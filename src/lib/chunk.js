/**
 * Chunk module - stores and manages voxel IDs and flags for each voxel within a chunk.
 * @module chunk
 */

import { VoxelLocationQueue } from './util'
import ndarray from 'ndarray'

/** @typedef {import('ndarray').NdArray} NdArray */

const NO_WHOLE_LAYER_SENTINEL = -1
const NEIGHBOR_CENTER_INDEX = 13

/**
 * Calculate the flat neighbor array index for a given offset.
 * @param {number} di
 * @param {number} dj
 * @param {number} dk
 * @returns {number}
 */
export function getNeighborIndex(di, dj, dk) {
    return (di + 1) * 9 + (dj + 1) * 3 + (dk + 1)
}

var env = (/** @type {any} */ (globalThis)).process?.env
if (env && env.NODE_ENV !== 'production') {
    var centerIndex = getNeighborIndex(0, 0, 0)
    var negIIndex = getNeighborIndex(-1, 0, 0)
    var posIIndex = getNeighborIndex(1, 0, 0)
    var negKIndex = getNeighborIndex(0, 0, -1)
    if (centerIndex !== 13 || negIIndex !== 4 || posIIndex !== 22 || negKIndex !== 12) {
        throw new Error('chunk neighbor index mapping mismatch')
    }
}

/**
 * Stores and manages voxel IDs and flags for each voxel within a chunk.
 */
export class Chunk {
    /**
     * @param {import('../index').Engine} noa
     * @param {string} requestID - ID sent to game client
     * @param {number} ci - Chunk index i
     * @param {number} cj - Chunk index j
     * @param {number} ck - Chunk index k
     * @param {number} size - Chunk size
     * @param {NdArray} dataArray - Voxel data array
     * @param {number} [fillVoxelID=-1] - ID to fill voxels with, or -1 for no fill
     */
    constructor(noa, requestID, ci, cj, ck, size, dataArray, fillVoxelID = -1) {
        /** @type {import('../index').Engine} */
        this.noa = noa

        /** @type {boolean} */
        this.isDisposed = false

        /** @type {*} - Arbitrary data passed in by client when generating world */
        this.userData = null

        /** @type {string} - ID sent to game client */
        this.requestID = requestID

        /** @type {NdArray} */
        this.voxels = dataArray

        /** @type {number} - Chunk index i */
        this.i = ci

        /** @type {number} - Chunk index j */
        this.j = cj

        /** @type {number} - Chunk index k */
        this.k = ck

        /** @type {number} */
        this.size = size

        /** @type {number} - World x coordinate */
        this.x = ci * size

        /** @type {number} - World y coordinate */
        this.y = cj * size

        /** @type {number} - World z coordinate */
        this.z = ck * size

        /** @type {number[]} - World position [x, y, z] */
        this.pos = [this.x, this.y, this.z]

        /** @internal @type {boolean} - Flag to track if terrain needs re-meshing */
        this._terrainDirty = false

        /** @internal @type {boolean} - Flag to track if objects need re-meshing */
        this._objectsDirty = false

        /** @internal @type {import('@babylonjs/core').Mesh[]} */
        this._terrainMeshes = []

        /** @internal @type {Map<number, number>|null} */
        this._objectBlocks = null

        /** @internal @type {number} - Base offset for object instance keys */
        this._objectKeyBase = 0

        noa._terrainMesher.initChunk(this)
        noa._objectMesher.initChunk(this)

        /** @internal @type {boolean} - Whether chunk is entirely opaque */
        this._isFull = false

        /** @internal @type {boolean} - Whether chunk is entirely air */
        this._isEmpty = false

        /** @internal @type {Int32Array|null} - Tracks if a layer has a constant voxel ID */
        this._wholeLayerVoxel = new Int32Array(size)
        var wholeLayerVoxel = /** @type {Int32Array} */ (this._wholeLayerVoxel)
        wholeLayerVoxel.fill(NO_WHOLE_LAYER_SENTINEL)

        if (fillVoxelID >= 0) {
            this.voxels.data.fill(fillVoxelID, 0, this.voxels.size)
            wholeLayerVoxel.fill(fillVoxelID)
        }

        // references to neighboring chunks, if they exist (filled in by `world`)
        /** @internal @type {Array<Chunk|null>} - References to neighboring chunks */
        this._neighbors = Array(27).fill(null)
        this._neighbors[NEIGHBOR_CENTER_INDEX] = this

        /** @internal @type {number} - Count of neighboring chunks */
        this._neighborCount = 0

        /** @internal @type {number} - Number of times this chunk has been meshed */
        this._timesMeshed = 0

        /** @internal @type {VoxelLocationQueue} - Queue of voxels with block handlers */
        this._blockHandlerLocs = new VoxelLocationQueue(size)

        // passes through voxel contents, calling block handlers etc.
        scanVoxelData(this)
    }

    /**
     * Create a new voxel data array for a chunk.
     * @param {number} size - Chunk size
     * @returns {NdArray}
     */
    static _createVoxelArray(size) {
        var arr = new Uint16Array(size * size * size)
        return ndarray(arr, [size, size, size])
    }

    /**
     * Update the voxel data array with new data.
     * @internal
     * @param {NdArray} dataArray - New voxel data array
     * @param {number} [fillVoxelID=-1] - ID to fill voxels with, or -1 for no fill
     */
    _updateVoxelArray(dataArray, fillVoxelID = -1) {
        // dispose current object blocks
        callAllBlockHandlers(this, 'onUnload')
        this.noa._objectMesher.disposeChunk(this)
        this.noa._terrainMesher.disposeChunk(this)
        this.voxels = dataArray
        this._terrainDirty = false
        this._objectsDirty = false
        this._blockHandlerLocs.empty()
        this.noa._objectMesher.initChunk(this)
        this.noa._terrainMesher.initChunk(this)

        var wholeLayerVoxel = /** @type {Int32Array} */ (this._wholeLayerVoxel)
        if (fillVoxelID >= 0) {
            wholeLayerVoxel.fill(fillVoxelID)
        } else {
            wholeLayerVoxel.fill(NO_WHOLE_LAYER_SENTINEL)
        }

        scanVoxelData(this)
    }

    /**
     * Get the block ID at a local position within the chunk.
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @returns {number} Block ID at the position
     */
    get(i, j, k) {
        return this.voxels.get(i, j, k)
    }

    /**
     * Get the solidity value at a local position within the chunk.
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @returns {boolean} Solidity value at the position
     */
    getSolidityAt(i, j, k) {
        var solidLookup = this.noa.registry._solidityLookup
        return solidLookup[this.voxels.get(i, j, k)]
    }

    /**
     * Set the block ID at a local position within the chunk.
     * Handles block lifecycle (onSet/onUnset handlers), object blocks,
     * terrain/object dirty flags, and neighbor chunk updates.
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @param {number} newID - New block ID to set
     */
    set(i, j, k, newID) {
        var oldID = this.voxels.get(i, j, k)
        if (newID === oldID) return

        // update voxel data
        this.voxels.set(i, j, k, newID)

        // lookup tables from registry, etc
        var solidLookup = this.noa.registry._solidityLookup
        var objectLookup = this.noa.registry._objectLookup
        var opaqueLookup = this.noa.registry._opacityLookup
        var handlerLookup = this.noa.registry._blockHandlerLookup

        // track invariants about chunk data
        if (!opaqueLookup[newID]) this._isFull = false
        if (newID !== 0) this._isEmpty = false
        var wholeLayerVoxel = /** @type {Int32Array} */ (this._wholeLayerVoxel)
        if (wholeLayerVoxel[j] !== newID) wholeLayerVoxel[j] = NO_WHOLE_LAYER_SENTINEL

        // voxel lifecycle handling
        var hold = handlerLookup[oldID]
        var hnew = handlerLookup[newID]
        if (hold) callBlockHandler(this, hold, 'onUnset', i, j, k)
        if (hnew) {
            callBlockHandler(this, hnew, 'onSet', i, j, k)
            this._blockHandlerLocs.add(i, j, k)
        } else {
            this._blockHandlerLocs.remove(i, j, k)
        }

        // track object block states
        var objMesher = this.noa._objectMesher
        var objOld = objectLookup[oldID]
        var objNew = objectLookup[newID]
        if (objOld) objMesher.setObjectBlock(this, 0, i, j, k)
        if (objNew) objMesher.setObjectBlock(this, newID, i, j, k)

        // decide dirtiness states
        var solidityChanged = (solidLookup[oldID] !== solidLookup[newID])
        var opacityChanged = (opaqueLookup[oldID] !== opaqueLookup[newID])
        var wasTerrain = !objOld && (oldID !== 0)
        var nowTerrain = !objNew && (newID !== 0)

        if (objOld || objNew) this._objectsDirty = true
        if (solidityChanged || opacityChanged || wasTerrain || nowTerrain) {
            this._terrainDirty = true
        }

        if (this._terrainDirty || this._objectsDirty) {
            this.noa.world._queueChunkForRemesh(this)
        }

        // neighbors only affected if solidity or opacity changed on an edge
        if (solidityChanged || opacityChanged) {
            var edge = this.size - 1
            var imin = (i === 0) ? -1 : 0
            var jmin = (j === 0) ? -1 : 0
            var kmin = (k === 0) ? -1 : 0
            var imax = (i === edge) ? 1 : 0
            var jmax = (j === edge) ? 1 : 0
            var kmax = (k === edge) ? 1 : 0
            for (var ni = imin; ni <= imax; ni++) {
                for (var nj = jmin; nj <= jmax; nj++) {
                    for (var nk = kmin; nk <= kmax; nk++) {
                        if ((ni | nj | nk) === 0) continue
                        var nab = this._neighbors[getNeighborIndex(ni, nj, nk)]
                        if (!nab) continue
                        nab._terrainDirty = true
                        this.noa.world._queueChunkForRemesh(nab)
                    }
                }
            }
        }
    }

    /**
     * Update terrain and object meshes if they are dirty.
     * Called by World when this chunk has been queued for remeshing.
     */
    updateMeshes() {
        if (this._terrainDirty) {
            this.noa._terrainMesher.meshChunk(this)
            this._timesMeshed++
            this._terrainDirty = false
        }
        if (this._objectsDirty) {
            this.noa._objectMesher.buildObjectMeshes()
            this._objectsDirty = false
        }
    }

    /**
     * Dispose the chunk and clean up all resources.
     * Calls onUnload handlers for all blocks, disposes meshes,
     * and nullifies references to allow garbage collection.
     */
    dispose() {
        // look through the data for onUnload handlers
        callAllBlockHandlers(this, 'onUnload')
        this._blockHandlerLocs.empty()

        // let meshers dispose their stuff
        this.noa._objectMesher.disposeChunk(this)
        this.noa._terrainMesher.disposeChunk(this)

        // apparently there's no way to dispose typed arrays, so just null everything
        this.voxels.data = null
        this.voxels = null
        this._neighbors = null
        this._wholeLayerVoxel = null

        this.isDisposed = true
        this.noa = null
    }
}

/**
 * Call a block handler of a given type at a particular position.
 * @param {Chunk} chunk - The chunk containing the block
 * @param {Object} handlers - Block handler lookup entry
 * @param {string} type - Handler type ('onSet', 'onUnset', 'onLoad', 'onUnload')
 * @param {number} i - Local x coordinate
 * @param {number} j - Local y coordinate
 * @param {number} k - Local z coordinate
 */
function callBlockHandler(chunk, handlers, type, i, j, k) {
    var handler = handlers[type]
    if (!handler) return
    handler(chunk.x + i, chunk.y + j, chunk.z + k)
}

/**
 * Scan voxel data, processing object blocks and setting chunk flags.
 * Sets _isFull, _isEmpty, _terrainDirty, and _objectsDirty flags.
 * Calls onLoad handlers for blocks that have them.
 * @param {Chunk} chunk - The chunk to scan
 */
function scanVoxelData(chunk) {
    var voxels = chunk.voxels
    var data = voxels.data
    var len = voxels.shape[0]
    var wholeLayerVoxel = /** @type {Int32Array} */ (chunk._wholeLayerVoxel)
    var opaqueLookup = chunk.noa.registry._opacityLookup
    var handlerLookup = chunk.noa.registry._blockHandlerLookup
    var objectLookup = chunk.noa.registry._objectLookup
    var plainLookup = chunk.noa.registry._blockIsPlainLookup
    var objMesher = chunk.noa._objectMesher

    // flags for tracking if chunk is entirely opaque or transparent
    var fullyOpaque = true
    var fullyAir = true

    // scan vertically..
    for (var j = 0; j < len; ++j) {

        // fastest case where whole layer is air/dirt/etc
        var layerID = wholeLayerVoxel[j]
        if (layerID >= 0 && !objMesher[layerID] && !handlerLookup[layerID]) {
            if (!opaqueLookup[layerID]) fullyOpaque = false
            if (layerID !== 0) fullyAir = false
            continue
        }

        var constantID = voxels.get(0, j, 0)

        for (var i = 0; i < len; ++i) {
            var index = voxels.index(i, j, 0)
            for (var k = 0; k < len; ++k, ++index) {
                var id = data[index]

                // detect constant layer ID if there is one
                if (constantID >= 0 && id !== constantID) constantID = NO_WHOLE_LAYER_SENTINEL

                // most common cases: air block...
                if (id === 0) {
                    fullyOpaque = false
                    continue
                }
                // ...or plain boring block (no mesh, handlers, etc)
                if (plainLookup[id]) {
                    fullyAir = false
                    continue
                }
                // otherwise check opacity, object mesh, and handlers
                fullyOpaque = fullyOpaque && opaqueLookup[id]
                fullyAir = false
                if (objectLookup[id]) {
                    objMesher.setObjectBlock(chunk, id, i, j, k)
                    chunk._objectsDirty = true
                }
                var handlers = handlerLookup[id]
                if (handlers) {
                    chunk._blockHandlerLocs.add(i, j, k)
                    callBlockHandler(chunk, handlers, 'onLoad', i, j, k)
                }
            }
        }

        if (constantID >= 0) wholeLayerVoxel[j] = constantID
    }

    chunk._isFull = fullyOpaque
    chunk._isEmpty = fullyAir
    chunk._terrainDirty = !chunk._isEmpty
}

/**
 * Call a given handler type for all blocks in the chunk that have handlers.
 * @param {Chunk} chunk - The chunk to process
 * @param {string} type - Handler type ('onSet', 'onUnset', 'onLoad', 'onUnload')
 */
function callAllBlockHandlers(chunk, type) {
    var voxels = chunk.voxels
    var handlerLookup = chunk.noa.registry._blockHandlerLookup
    chunk._blockHandlerLocs.forEach((i, j, k) => {
        var id = voxels.get(i, j, k)
        callBlockHandler(chunk, handlerLookup[id], type, i, j, k)
    })
}
