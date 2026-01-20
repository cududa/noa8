import ndarray from 'ndarray'
import { faceDataPool, MeshedFaceData } from './faceData.js'
import { packAOMask } from './aoHelpers.js'
import { tempCoordArray } from './terrainUtils.js'

/**
 * Greedy meshing algorithm for terrain.
 * @module terrain/greedyMesher
 *
 * Originally based on algorithm by Mikola Lysenko:
 *     http://0fps.net/2012/07/07/meshing-minecraft-part-2/
 * but probably no code remaining from there anymore.
 * Ad-hoc AO handling made of cobwebs and dreams.
 *
 * Takes in a Chunk instance, and returns an object containing
 * GeometryData structs, keyed by terrain material ID,
 * which the terrain builder can then make into meshes.
 */

/**
 * Greedy mesher - takes a Chunk instance and returns face data
 * keyed by terrain material ID.
 * @internal
 */
export class GreedyMesher {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent) {
        /** @type {import('./index.js').TerrainMesher} */
        this.parent = parent

        // class-wide cached structs
        /** @type {Int16Array} */
        this._maskCache = new Int16Array(16)
        /** @type {Int16Array} */
        this._aoMaskCache = new Int16Array(16)
    }

    /**
     * Entry point - mesh a chunk and return face data by terrain ID
     * @param {import('../chunk.js').Chunk} chunk
     * @param {boolean} ignoreMaterials
     * @returns {Object.<string, MeshedFaceData>} keyed by terrain material ID
     */
    mesh(chunk, ignoreMaterials) {
        var cs = chunk.size
        var noa = this.parent.noa
        var matManager = this.parent._matManager
        var wholeLayerVoxel = /** @type {Int32Array} */ (chunk._wholeLayerVoxel)

        // terrain ID accessor can be overridden for hacky reasons
        var realGetTerrainID = matManager.getTerrainMatId.bind(matManager)
        var fakeGetTerrainID = (matID) => 1
        var terrainIDgetter = ignoreMaterials ? fakeGetTerrainID : realGetTerrainID

        // no internal faces for empty or entirely solid chunks
        var edgesOnly = (chunk._isEmpty || chunk._isFull)

        /** @type {Object.<string, MeshedFaceData>} */
        var faceDataSet = {}
        faceDataPool.reset()

        // Sweep over each axis, mapping axes to [d,u,v]
        for (var d = 0; d < 3; ++d) {
            var u = (d === 2) ? 0 : 2
            var v = (d === 1) ? 0 : 1

            // transposed ndarrays of nearby chunk voxels (self and neighbors)
            var nabVoxelsArr = chunk._neighbors.map(c => {
                if (c && c.voxels) return c.voxels.transpose(d, u, v)
                return null
            })

            // ndarray of the previous, similarly transposed
            var nabVoxelsT = ndarray(nabVoxelsArr, [3, 3, 3])
                .lo(1, 1, 1)
                .transpose(d, u, v)

            // embiggen the cached mask arrays if needed - grow exponentially to reduce allocations
            if (this._maskCache.length < cs * cs) {
                var newSize = Math.max(cs * cs, this._maskCache.length * 2)
                this._maskCache = new Int16Array(newSize)
                this._aoMaskCache = new Int16Array(newSize)
            }

            // sets up transposed accessor for querying solidity of (i,j,k)
            prepareSolidityLookup(noa, nabVoxelsT, cs)

            // mesh plane between this chunk and previous neighbor on i axis
            var prev = nabVoxelsT.get(-1, 0, 0)
            var here = nabVoxelsT.get(0, 0, 0)
            if (prev) {
                // offset version of neighbor to make queries work at i=-1
                var prevOff = prev.lo(cs, 0, 0)
                var nFaces = this._constructMeshMask(d, prevOff, -1, here, 0, noa)

                if (nFaces > 0) {
                    this._constructGeometryFromMasks(0, d, u, v, cs, cs, nFaces, faceDataSet, terrainIDgetter, noa)
                }
            }

            // if only doing edges, we're done with this axis
            if (edgesOnly) continue

            // mesh the rest of the planes internal to this chunk
            // note only looping up to (size-1), skipping final coord so as
            // not to duplicate faces at chunk borders
            for (var i = 0; i < cs - 1; i++) {
                // maybe skip y axis, if both layers are all the same voxel
                if (d === 1) {
                    var v1 = wholeLayerVoxel[i]
                    if (v1 >= 0 && v1 === wholeLayerVoxel[i + 1]) {
                        continue
                    }
                }

                // pass in layer array for skip checks, only if not already checked
                var layerVoxRef = (d === 1) ? null : wholeLayerVoxel

                var nf = this._constructMeshMask(d, here, i, here, i + 1, noa, layerVoxRef)
                if (nf > 0) {
                    this._constructGeometryFromMasks(i + 1, d, u, v, cs, cs, nf, faceDataSet, terrainIDgetter, noa)
                }
            }

            // we skip the i-positive neighbor so as not to duplicate edge faces
        }

        return faceDataSet
    }

    /**
     * Build a 2D array of mask values representing whether a mesh face is needed at each position.
     * Each mask value is a terrain material ID, negative if the face needs to point
     * in the -i direction (towards voxel arr A).
     * @returns {number} number of mesh faces found
     */
    _constructMeshMask(d, arrA, iA, arrB, iB, noa, wholeLayerVoxel = null) {
        var len = arrA.shape[1]
        var mask = this._maskCache
        var aoMask = this._aoMaskCache
        var doAO = noa.rendering.useAO
        var skipRevAo = (noa.rendering.revAoVal === noa.rendering.aoVals[0])

        var opacityLookup = noa.registry._opacityLookup
        var getMaterial = noa.registry.getBlockFaceMaterial
        var materialDir = d * 2

        // mask is iterated by a simple integer, both here and later when
        // merging meshes, so the j/k order must be the same in both places
        var n = 0

        // set up for quick ndarray traversals
        var indexA = arrA.index(iA, 0, 0)
        var jstrideA = arrA.stride[1]
        var kstrideA = arrA.stride[2]
        var indexB = arrB.index(iB, 0, 0)
        var jstrideB = arrB.stride[1]
        var kstrideB = arrB.stride[2]

        var facesFound = 0

        for (var k = 0; k < len; ++k) {
            var dA = indexA
            var dB = indexB
            indexA += kstrideA
            indexB += kstrideB

            // skip this second axis, if whole layer is same voxel?
            if (wholeLayerVoxel && wholeLayerVoxel[k] >= 0) {
                n += len
                continue
            }

            for (var j = 0; j < len; j++, n++, dA += jstrideA, dB += jstrideB) {
                // mask[n] represents the face needed between the two voxel layers
                // for now, assume we never have two faces in both directions

                // note that mesher zeroes out the mask as it goes, so there's
                // no need to zero it here when no face is needed

                // IDs at i-1,j,k  and  i,j,k
                var id0 = arrA.data[dA]
                var id1 = arrB.data[dB]

                // most common case: never a face between same voxel IDs, so skip out early
                if (id0 === id1) continue

                // no face if both blocks are opaque
                var op0 = opacityLookup[id0]
                var op1 = opacityLookup[id1]
                if (op0 && op1) continue

                // also no face if both block faces have the same block material
                var m0 = getMaterial(id0, materialDir) || 0
                var m1 = getMaterial(id1, materialDir + 1) || 0
                if (m0 === m1) continue

                // choose which block face to draw:
                //   * if either block is opaque draw that one
                //   * if either material is missing draw the other one
                if (op0 || m1 === 0) {
                    mask[n] = m0
                    if (doAO) aoMask[n] = packAOMask(voxelIsSolid, iB, iA, j, k, skipRevAo)
                    facesFound++
                } else if (op1 || m0 === 0) {
                    mask[n] = -m1
                    if (doAO) aoMask[n] = packAOMask(voxelIsSolid, iA, iB, j, k, skipRevAo)
                    facesFound++
                } else {
                    // leftover case is two different non-opaque blocks facing each other.
                    // Someday we could try to draw both, but for now we draw neither.
                }
            }
        }
        return facesFound
    }

    /**
     * Greedy meshing inner loop - construct geometry data from the masks
     */
    _constructGeometryFromMasks(i, d, u, v, len1, len2, numFaces, faceDataSet, terrainIDgetter, noa) {
        var doAO = noa.rendering.useAO
        var mask = this._maskCache
        var aomask = this._aoMaskCache

        var n = 0
        var materialDir = d * 2
        // reuse array to avoid allocation in hot path
        var coords = tempCoordArray
        coords[0] = 0
        coords[1] = 0
        coords[2] = 0
        coords[d] = i

        var maskCompareFcn = (doAO) ? maskCompare : maskCompare_noAO

        for (var k = 0; k < len2; ++k) {
            var w = 1
            var h = 1
            for (var j = 0; j < len1; j += w, n += w) {
                var maskVal = mask[n] | 0
                if (!maskVal) {
                    w = 1
                    continue
                }

                var ao = aomask[n] | 0

                // Compute width and height of area with same mask/aomask values
                for (w = 1; w < len1 - j; ++w) {
                    if (!maskCompareFcn(n + w, mask, maskVal, aomask, ao)) break
                }

                OUTER:
                for (h = 1; h < len2 - k; ++h) {
                    for (var m = 0; m < w; ++m) {
                        var ix = n + m + h * len1
                        if (!maskCompareFcn(ix, mask, maskVal, aomask, ao)) break OUTER
                    }
                }

                // for testing: doing the following will disable greediness
                //w=h=1

                // materialID and terrain ID type for the face
                var matID = Math.abs(maskVal)
                var terrainID = terrainIDgetter(matID)

                // if terrainID not seen before, start a new MeshedFaceData
                // from the extremely naive object pool
                if (!(terrainID in faceDataSet)) {
                    var fdFromPool = faceDataPool.get()
                    fdFromPool.numFaces = 0
                    fdFromPool.terrainID = terrainID
                    faceDataSet[terrainID] = fdFromPool
                }

                // pack one face worth of data into the return struct
                var faceData = faceDataSet[terrainID]
                var nf = faceData.numFaces
                faceData.numFaces++

                faceData.matIDs[nf] = matID
                coords[u] = j
                coords[v] = k
                faceData.is[nf] = coords[0]
                faceData.js[nf] = coords[1]
                faceData.ks[nf] = coords[2]
                faceData.wids[nf] = w
                faceData.hts[nf] = h
                faceData.packedAO[nf] = ao
                faceData.dirs[nf] = (maskVal > 0) ? materialDir : materialDir + 1

                // Face now finished, zero out the used part of the mask
                for (var hx = 0; hx < h; ++hx) {
                    for (var wx = 0; wx < w; ++wx) {
                        mask[n + wx + hx * len1] = 0
                    }
                }

                // exit condition where no more faces are left to mesh
                numFaces -= w * h
                if (numFaces === 0) return
            }
        }
    }
}


// Mask comparison helpers
function maskCompare(index, mask, maskVal, aomask, aoVal) {
    if (maskVal !== mask[index]) return false
    if (aoVal !== aomask[index]) return false
    return true
}

function maskCompare_noAO(index, mask, maskVal, aomask, aoVal) {
    if (maskVal !== mask[index]) return false
    return true
}


/*
 * Solidity lookup system
 *
 * Rigging for a transposed (i,j,k) => boolean solidity lookup,
 * that knows how to query into neighboring chunks at edges.
 * This sets up the indirection used by `voxelIsSolid` below.
 */

var solidityLookupInittedSize = -1
var voxelIDtoSolidity = [false, true]
var voxLookup = Array(27).fill(null)
var voxTypeLookup = Array(27).fill(0)
var coordToLoc = [0, 1, 1, 1, 1, 1, 2]
var edgeCoordLookup = [3, 0, 1, 2, 3, 0]
var missingCoordLookup = [0, 0, 1, 2, 3, 3]

/**
 * @param {import('../../index.js').Engine} noa
 */
function prepareSolidityLookup(noa, nabVoxelsT, size) {
    if (solidityLookupInittedSize !== size) {
        solidityLookupInittedSize = size
        voxelIDtoSolidity = noa.registry._solidityLookup

        for (var x = -1; x < size + 1; x++) {
            var loc = (x < 0) ? 0 : (x < size) ? 1 : 2
            coordToLoc[x + 1] = [0, 1, 2][loc]
            edgeCoordLookup[x + 1] = [size - 1, x, 0][loc]
            missingCoordLookup[x + 1] = [0, x, size - 1][loc]
        }
    }

    var centerChunk = nabVoxelsT.get(0, 0, 0)
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                var ix = i * 9 + j * 3 + k
                var nab = nabVoxelsT.get(i - 1, j - 1, k - 1)
                var type = 0
                if (!nab) type = 1
                if (nab === centerChunk) type = 2
                voxTypeLookup[ix] = type
                voxLookup[ix] = nab || centerChunk
            }
        }
    }
}

/**
 * Query solidity at a transposed (i,j,k) coordinate
 * @param {number} i
 * @param {number} j
 * @param {number} k
 * @returns {boolean}
 */
function voxelIsSolid(i, j, k) {
    var li = coordToLoc[i + 1]
    var lj = coordToLoc[j + 1]
    var lk = coordToLoc[k + 1]
    var ix = li * 9 + lj * 3 + lk
    var voxArray = voxLookup[ix]
    var type = voxTypeLookup[ix]
    if (type === 2) {
        return voxelIDtoSolidity[voxArray.get(i, j, k)]
    }
    var lookup = [edgeCoordLookup, missingCoordLookup][type]
    var ci = lookup[i + 1]
    var cj = lookup[j + 1]
    var ck = lookup[k + 1]
    return voxelIDtoSolidity[voxArray.get(ci, cj, ck)]
}
