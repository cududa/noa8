import { Mesh, VertexData } from '../babylonExports.js'
import { unpackAOMask } from './aoHelpers.js'
import { MeshedFaceData } from './faceData.js'

/**
 * Mesh construction from greedy mesher output.
 * @module terrain/meshBuilder
 *
 * Consumes all the raw data in faceDataSet to build
 * Babylon.js mesh/submeshes, ready to be added to the scene.
 */

/**
 * Mesh Builder - consumes raw face data to build
 * Babylon.js mesh/submeshes ready to be added to the scene.
 * @internal
 */
export class MeshBuilder {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent) {
        /** @type {import('./index.js').TerrainMesher} */
        this.parent = parent
    }

    /**
     * Consume the intermediate FaceData struct and produce
     * actual meshes the 3D engine can render
     * @param {import('../chunk.js').Chunk} chunk
     * @param {Object.<string, MeshedFaceData>} faceDataSet
     * @param {boolean} ignoreMaterials
     * @returns {import('@babylonjs/core').Mesh[]}
     */
    buildMesh(chunk, faceDataSet, ignoreMaterials) {
        var noa = this.parent.noa
        var scene = noa.rendering.getScene()

        var doAO = noa.rendering.useAO
        var aoVals = noa.rendering.aoVals
        var revAoVal = noa.rendering.revAoVal

        var atlasIndexLookup = noa.registry._matAtlasIndexLookup
        var matColorLookup = noa.registry._materialColorLookup
        var white = [1, 1, 1]

        // geometry data is already keyed by terrain type, so build
        // one mesh per faceData object in the hash
        var meshes = []
        for (var key in faceDataSet) {
            var faceData = faceDataSet[key]
            var terrainID = faceData.terrainID

            // will this mesh need texture atlas indexes?
            var usesAtlas = false
            if (!ignoreMaterials) {
                var firstIx = atlasIndexLookup[faceData.matIDs[0]]
                usesAtlas = (firstIx >= 0)
            }

            // build the necessary arrays
            var nf = faceData.numFaces
            var indices = new Uint16Array(nf * 6)
            var positions = new Float32Array(nf * 12)
            var normals = new Float32Array(nf * 12)
            var colors = new Float32Array(nf * 16)
            var uvs = new Float32Array(nf * 8)
            var atlasIndexes
            if (usesAtlas) atlasIndexes = new Float32Array(nf * 4)

            // scan all faces in the struct, creating data for each
            for (var f = 0; f < faceData.numFaces; f++) {
                // basic data from struct
                var matID = faceData.matIDs[f]
                var materialDir = faceData.dirs[f]  // 0..5: x,-x, y,-y, z,-z

                var i = faceData.is[f]
                var j = faceData.js[f]
                var k = faceData.ks[f]
                var w = faceData.wids[f]
                var h = faceData.hts[f]
                var axis = (materialDir / 2) | 0
                var dir = (materialDir % 2) ? -1 : 1

                addPositionValues(positions, f, i, j, k, axis, w, h)
                addUVs(uvs, f, axis, w, h, dir)

                var norms = [0, 0, 0]
                norms[axis] = dir
                addNormalValues(normals, f, norms)

                var ao = faceData.packedAO[f]
                var [A, B, C, D] = unpackAOMask(ao)
                var triDir = decideTriDir(A, B, C, D)

                addIndexValues(indices, f, axis, dir, triDir)

                if (usesAtlas) {
                    var atlasIndex = atlasIndexLookup[matID]
                    addAtlasIndices(atlasIndexes, f, atlasIndex)
                }

                var matColor = matColorLookup[matID] || white
                if (doAO) {
                    pushMeshColors(colors, f, matColor, aoVals, revAoVal, A, B, C, D)
                } else {
                    pushMeshColors_noAO(colors, f, matColor)
                }
            }

            // the mesh and vertexData object
            var name = `chunk_${chunk.requestID}_${terrainID}`
            var mesh = new Mesh(name, scene)
            var vdat = new VertexData()

            // finish the mesh
            vdat.positions = positions
            vdat.indices = indices
            vdat.normals = normals
            vdat.colors = colors
            vdat.uvs = uvs
            vdat.applyToMesh(mesh)

            // meshes using a texture atlas need atlasIndices
            if (usesAtlas) {
                mesh.setVerticesData('texAtlasIndices', atlasIndexes, false, 1)
            }

            // disable some unnecessary bounding checks
            mesh.isPickable = false
            mesh.doNotSyncBoundingInfo = true
            mesh._refreshBoundingInfo = () => mesh

            // materials wrangled by external module
            if (!ignoreMaterials) {
                mesh.material = this.parent._matManager.getMaterial(terrainID)
            }

            meshes.push(mesh)
        }

        return meshes
    }
}


/*
 * Helper functions for building mesh arrays
 * These could probably be simplified and less magical
 */

/**
 * @param {Float32Array} posArr
 */
function addPositionValues(posArr, faceNum, i, j, k, axis, w, h) {
    var offset = faceNum * 12

    var loc = [i, j, k]
    var du = [0, 0, 0]
    var dv = [0, 0, 0]
    du[(axis === 2) ? 0 : 2] = w
    dv[(axis === 1) ? 0 : 1] = h

    for (var ix = 0; ix < 3; ix++) {
        posArr[offset + ix] = loc[ix]
        posArr[offset + 3 + ix] = loc[ix] + du[ix]
        posArr[offset + 6 + ix] = loc[ix] + du[ix] + dv[ix]
        posArr[offset + 9 + ix] = loc[ix] + dv[ix]
    }
}

/**
 * @param {Float32Array} uvArr
 */
function addUVs(uvArr, faceNum, d, w, h, dir) {
    var offset = faceNum * 8
    var epsilon = 0
    for (var i = 0; i < 8; i++) uvArr[offset + i] = epsilon
    if (d === 0) {
        uvArr[offset + 1] = uvArr[offset + 3] = h - epsilon
        uvArr[offset + 2] = uvArr[offset + 4] = dir * w
    } else if (d === 1) {
        uvArr[offset + 1] = uvArr[offset + 7] = w - epsilon
        uvArr[offset + 4] = uvArr[offset + 6] = dir * h
    } else {
        uvArr[offset + 1] = uvArr[offset + 3] = h - epsilon
        uvArr[offset + 2] = uvArr[offset + 4] = -dir * w
    }
}

/**
 * @param {Float32Array} normArr
 */
function addNormalValues(normArr, faceNum, norms) {
    var offset = faceNum * 12
    for (var i = 0; i < 12; i++) {
        normArr[offset + i] = norms[i % 3]
    }
}

var indexLists = [
    [0, 1, 2, 0, 2, 3], // base
    [0, 2, 1, 0, 3, 2], // flipped
    [1, 2, 3, 1, 3, 0], // opposite triDir
    [1, 3, 2, 1, 0, 3], // opposite triDir
]

/**
 * @param {Uint16Array} indArr
 */
function addIndexValues(indArr, faceNum, axis, dir, triDir) {
    var offset = faceNum * 6
    var baseIndex = faceNum * 4
    if (axis === 0) dir = -dir
    var ix = (dir < 0) ? 0 : 1
    if (!triDir) ix += 2
    var indexVals = indexLists[ix]
    for (var i = 0; i < 6; i++) {
        indArr[offset + i] = baseIndex + indexVals[i]
    }
}

/**
 * @param {Float32Array} indArr
 */
function addAtlasIndices(indArr, faceNum, atlasIndex) {
    var offset = faceNum * 4
    for (var i = 0; i < 4; i++) {
        indArr[offset + i] = atlasIndex
    }
}

/**
 * Decide triangle direction based on AO values - this bit is pretty magical.
 * (true means split along the a00-a11 axis)
 */
function decideTriDir(A, B, C, D) {
    if (A === C) {
        return (D === B) ? (D === 2) : true
    } else {
        return (D === B) ? false : (A + C > D + B)
    }
}

/**
 * @param {Float32Array} colors
 */
function pushMeshColors_noAO(colors, faceNum, col) {
    var offset = faceNum * 16
    for (var i = 0; i < 16; i += 4) {
        colors[offset + i] = col[0]
        colors[offset + i + 1] = col[1]
        colors[offset + i + 2] = col[2]
        colors[offset + i + 3] = 1
    }
}

/**
 * @param {Float32Array} colors
 */
function pushMeshColors(colors, faceNum, col, aoVals, revAo, A, B, C, D) {
    var offset = faceNum * 16
    pushAOColor(colors, offset, col, A, aoVals, revAo)
    pushAOColor(colors, offset + 4, col, D, aoVals, revAo)
    pushAOColor(colors, offset + 8, col, C, aoVals, revAo)
    pushAOColor(colors, offset + 12, col, B, aoVals, revAo)
}

/**
 * Premultiply vertex colors by value depending on AO level
 * then push them into color array
 */
function pushAOColor(colors, ix, baseCol, ao, aoVals, revAoVal) {
    var mult = (ao === 0) ? revAoVal : aoVals[ao - 1]
    colors[ix] = baseCol[0] * mult
    colors[ix + 1] = baseCol[1] * mult
    colors[ix + 2] = baseCol[2] * mult
    colors[ix + 3] = 1
}
