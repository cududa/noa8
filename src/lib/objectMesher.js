/**
 * Object meshing module - per-chunk handling of static meshes for voxel IDs.
 * @module objectMesher
 */

import { TransformNode } from './babylonExports.js'
import { makeProfileHook } from './util'

/** @typedef {import('@babylonjs/core').Mesh} Mesh */

var PROFILE = 0

/** Metadata flag for object base meshes */
var objectMeshFlag = 'noa_object_base_mesh'

/**
 * Handles per-chunk creation/disposal of static meshes associated with voxel IDs.
 * @internal
 */
export class ObjectMesher {
    /**
     * @internal
     * @param {import('../index').Engine} noa
     */
    constructor(noa) {
        /** @internal @type {import('../index').Engine} */
        this._noa = noa

        /** @type {TransformNode} - Root node for all instance meshes */
        this.rootNode = new TransformNode('objectMeshRoot', noa.rendering.scene)

        /** @type {Mesh[]} - List of known base meshes */
        this.allBaseMeshes = []

        /** @internal @type {number[]} - Tracking rebase amount inside matrix data */
        this._rebaseOffset = [0, 0, 0]

        /** @internal @type {boolean} - Flag to trigger rebuild after chunk disposal */
        this._rebuildNextTick = false

        /** @internal @type {TransformNode} - Mock object for customMesh handler transforms */
        this._transformObj = new TransformNode('')

        /** @internal @type {Object.<number, InstanceManager>} - Instance managers keyed by block ID */
        this._managers = {}

        /** @internal @type {number} - Unique key seed for chunk instance keys */
        this._nextChunkKey = 1

        /** @internal @type {number} - Packed key stride (chunk volume) */
        this._chunkKeyStride = 0
    }

    /**
     * Get or create an InstanceManager for the given block ID.
     * Dedupes by mesh since Babylon chokes on separate instance sets for same geometry.
     * @internal
     * @param {number} id - Block ID
     * @returns {InstanceManager}
     */
    _getManager(id) {
        if (this._managers[id]) return this._managers[id]
        var mesh = this._noa.registry._blockMeshLookup[id]
        for (var id2 in this._managers) {
            var prev = this._managers[id2].mesh
            if (prev === mesh || (prev.geometry === mesh.geometry)) {
                return this._managers[id] = this._managers[id2]
            }
        }
        this.allBaseMeshes.push(mesh)
        if (!mesh.metadata) mesh.metadata = {}
        mesh.metadata[objectMeshFlag] = true
        return this._managers[id] = new InstanceManager(this._noa, mesh)
    }

    /**
     * Initialize chunk properties for object meshing.
     * @param {import('./chunk').Chunk} chunk
     */
    initChunk(chunk) {
        chunk._objectBlocks = new Map()
        if (!this._chunkKeyStride) {
            this._chunkKeyStride = chunk.size * chunk.size * chunk.size
        }
        chunk._objectKeyBase = this._nextChunkKey * this._chunkKeyStride
        this._nextChunkKey++
    }

    /**
     * Handle an object block being set or cleared.
     * Called by world when an object block changes.
     * @param {import('./chunk').Chunk} chunk
     * @param {number} blockID - New block ID (0 if clearing)
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     */
    setObjectBlock(chunk, blockID, i, j, k) {
        var x = chunk.x + i
        var y = chunk.y + j
        var z = chunk.z + k
        var stride = chunk.size
        var localIndex = i + stride * (j + stride * k)
        var key = chunk._objectKeyBase + localIndex
        var objectBlocks = /** @type {Map<number, number>} */ (chunk._objectBlocks)

        var oldID = objectBlocks.get(localIndex) || 0
        if (oldID === blockID) return
        if (oldID > 0) {
            var oldMgr = this._getManager(oldID)
            oldMgr.removeInstance(chunk, key)
        }

        if (blockID > 0) {
            var handlers = this._noa.registry._blockHandlerLookup[blockID]
            var onCreate = handlers && handlers.onCustomMeshCreate
            if (onCreate) {
                this._transformObj.position.copyFromFloats(0.5, 0, 0.5)
                this._transformObj.scaling.setAll(1)
                this._transformObj.rotation.setAll(0)
                onCreate(this._transformObj, x, y, z)
            }
            var mgr = this._getManager(blockID)
            var xform = (onCreate) ? this._transformObj : null
            mgr.addInstance(chunk, key, i, j, k, xform, this._rebaseOffset)
        }

        if (oldID > 0 && !blockID) objectBlocks.delete(localIndex)
        if (blockID > 0) objectBlocks.set(localIndex, blockID)
    }

    /**
     * Rebuild dirty instance meshes.
     * Called by world when objects have been updated.
     */
    buildObjectMeshes() {
        profile_hook('start')

        for (var id in this._managers) {
            var mgr = this._managers[id]
            mgr.updateMatrix()
            if (mgr.count === 0) mgr.dispose()
            if (mgr.disposed) delete this._managers[id]
        }

        profile_hook('rebuilt')
        profile_hook('end')
    }

    /**
     * Clean up chunk's object blocks at end of chunk lifecycle.
     * @param {import('./chunk').Chunk} chunk
     */
    disposeChunk(chunk) {
        var objectBlocks = /** @type {Map<number, number>} */ (chunk._objectBlocks)
        for (var [localIndex, id] of objectBlocks) {
            if (id > 0) {
                var mgr = this._getManager(id)
                var key = chunk._objectKeyBase + localIndex
                mgr.removeInstance(chunk, key)
            }
        }
        chunk._objectBlocks = null
        this._rebuildNextTick = true
    }

    /**
     * Tick handler - catches case where objects are dirty due to disposal.
     */
    tick() {
        if (this._rebuildNextTick) {
            this.buildObjectMeshes()
            this._rebuildNextTick = false
        }
    }

    /**
     * Handle world origin rebase.
     * @internal
     * @param {number[]} delta - Rebase offset [x, y, z]
     */
    _rebaseOrigin(delta) {
        this._rebaseOffset[0] += delta[0]
        this._rebaseOffset[1] += delta[1]
        this._rebaseOffset[2] += delta[2]

        for (var id1 in this._managers) this._managers[id1].rebased = false
        for (var id2 in this._managers) {
            var mgr = this._managers[id2]
            if (mgr.rebased) continue
            for (var i = 0; i < mgr.count; i++) {
                var ix = i << 4
                mgr.buffer[ix + 12] -= delta[0]
                mgr.buffer[ix + 13] -= delta[1]
                mgr.buffer[ix + 14] -= delta[2]
            }
            mgr.rebased = true
            mgr.dirty = true
        }
        this._rebuildNextTick = true
    }
}

/**
 * Manager class for thin instances of a given object block ID.
 * @internal
 */
class InstanceManager {
    /**
     * @param {import('../index').Engine} noa
     * @param {Mesh} mesh
     */
    constructor(noa, mesh) {
        /** @type {import('../index').Engine} */
        this.noa = noa

        /** @type {Mesh} */
        this.mesh = mesh

        /** @type {Float32Array|null} */
        this.buffer = null

        /** @type {number} */
        this.capacity = 0

        /** @type {number} */
        this.count = 0

        /** @type {boolean} */
        this.dirty = false

        /** @type {boolean} */
        this.rebased = true

        /** @type {boolean} */
        this.disposed = false

        /** @type {Map<number, number>|null} - Map keys (locations) to buffer indices */
        this.keyToIndex = new Map()

        /** @type {Float64Array|null} - Map buffer locations to keys */
        this.locToKey = new Float64Array(0)

        // Prepare mesh for rendering
        this.mesh.position.setAll(0)
        this.mesh.parent = noa._objectMesher.rootNode
        this.noa.rendering.addMeshToScene(this.mesh, false)
        this.noa.emit('addingTerrainMesh', this.mesh)
        this.mesh.isPickable = false
        this.mesh.doNotSyncBoundingInfo = true
        this.mesh.alwaysSelectAsActiveMesh = true
    }

    /**
     * Clean up and dispose the mesh.
     */
    dispose() {
        if (this.disposed) return
        this.mesh.thinInstanceCount = 0
        this.setCapacity(0)
        this.noa.emit('removingTerrainMesh', this.mesh)
        this.noa.rendering.setMeshVisibility(this.mesh, false)
        this.mesh.dispose()
        this.mesh = null
        this.keyToIndex = null
        this.locToKey = null
        this.disposed = true
        this.noa = null
    }

    /**
     * Add an instance at the given location.
     * @param {import('./chunk').Chunk} chunk
     * @param {number} key - Location key
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @param {TransformNode|null} transform - Optional transform from handler
     * @param {number[]} rebaseVec - Current rebase offset
     */
    addInstance(chunk, key, i, j, k, transform, rebaseVec) {
        maybeExpandBuffer(this)
        var ix = this.count << 4
        var locToKey = /** @type {Float64Array} */ (this.locToKey)
        var keyToIndex = /** @type {Map<number, number>} */ (this.keyToIndex)
        locToKey[this.count] = key
        keyToIndex.set(key, ix)
        if (transform) {
            transform.position.x += (chunk.x - rebaseVec[0]) + i
            transform.position.y += (chunk.y - rebaseVec[1]) + j
            transform.position.z += (chunk.z - rebaseVec[2]) + k
            var worldMatrix = transform.computeWorldMatrix(true)
            worldMatrix.copyToArray(this.buffer, ix)
        } else {
            var matArray = tempMatrixArray
            matArray[12] = (chunk.x - rebaseVec[0]) + i + 0.5
            matArray[13] = (chunk.y - rebaseVec[1]) + j
            matArray[14] = (chunk.z - rebaseVec[2]) + k + 0.5
            copyMatrixData(matArray, 0, this.buffer, ix)
        }
        this.count++
        this.dirty = true
    }

    /**
     * Remove an instance by key.
     * @param {import('./chunk').Chunk} chunk
     * @param {number} key - Location key
     */
    removeInstance(chunk, key) {
        var keyToIndex = /** @type {Map<number, number>} */ (this.keyToIndex)
        var locToKey = /** @type {Float64Array} */ (this.locToKey)
        var remIndex = keyToIndex.get(key)
        if (!(remIndex >= 0)) throw 'tried to remove object instance not in storage'
        keyToIndex.delete(key)
        var remLoc = remIndex >> 4
        // Copy tail instance's data to location of one we're removing
        var tailLoc = this.count - 1
        if (remLoc !== tailLoc) {
            var tailIndex = tailLoc << 4
            copyMatrixData(this.buffer, tailIndex, this.buffer, remIndex)
            // Update key/location structs
            var tailKey = locToKey[tailLoc]
            keyToIndex.set(tailKey, remIndex)
            locToKey[remLoc] = tailKey
        }
        this.count--
        this.dirty = true
        maybeContractBuffer(this)
    }

    /**
     * Push buffer updates to mesh.
     */
    updateMatrix() {
        if (!this.dirty) return
        this.mesh.thinInstanceCount = this.count
        this.mesh.thinInstanceBufferUpdated('matrix')
        this.mesh.isVisible = (this.count > 0)
        this.dirty = false
    }

    /**
     * Resize the instance buffer.
     * @param {number} [size=4] - New capacity
     */
    setCapacity(size = 4) {
        this.capacity = size
        if (size === 0) {
            this.buffer = null
        } else {
            var newBuff = new Float32Array(this.capacity * 16)
            if (this.buffer) {
                var len = Math.min(this.buffer.length, newBuff.length)
                for (var i = 0; i < len; i++) newBuff[i] = this.buffer[i]
            }
            this.buffer = newBuff
        }
        var newLocToKey = new Float64Array(this.capacity)
        if (this.locToKey) {
            var keyLen = Math.min(this.locToKey.length, newLocToKey.length)
            newLocToKey.set(this.locToKey.subarray(0, keyLen))
        }
        this.locToKey = newLocToKey
        this.mesh.thinInstanceSetBuffer('matrix', this.buffer)
        this.updateMatrix()
    }
}

/*
 *
 *      Helper functions
 *
 */

/** Identity matrix template for new instances */
var tempMatrixArray = [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]

/**
 * Expand buffer if at capacity.
 * @param {InstanceManager} mgr
 */
function maybeExpandBuffer(mgr) {
    if (mgr.count < mgr.capacity) return
    var size = Math.max(8, mgr.capacity * 2)
    mgr.setCapacity(size)
}

/**
 * Contract buffer if underutilized.
 * @param {InstanceManager} mgr
 */
function maybeContractBuffer(mgr) {
    if (mgr.count > mgr.capacity * 0.4) return
    if (mgr.capacity < 100) return
    mgr.setCapacity(Math.round(mgr.capacity / 2))
}

/**
 * Copy 16 floats of matrix data between arrays.
 * @param {ArrayLike<number>} src
 * @param {number} srcOff
 * @param {Float32Array} dest
 * @param {number} destOff
 */
function copyMatrixData(src, srcOff, dest, destOff) {
    for (var i = 0; i < 16; i++) dest[destOff + i] = src[srcOff + i]
}

var profile_hook = (PROFILE) ?
    makeProfileHook(PROFILE, 'Object meshing') : () => { }
