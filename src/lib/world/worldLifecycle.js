/**
 * Chunk lifecycle management - creation, data setting, removal, meshing.
 * @module worldLifecycle
 */

import { Chunk } from '../chunk.js'
import { profile_queues_hook } from './worldDebug.js'

/** Error message for manual chunk loading API */
var manualErr = 'Set `noa.world.manuallyControlChunkLoading` if you need this API'


/**
 * Handles chunk lifecycle operations.
 */
export class WorldLifecycle {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world
    }

    /**
     * Tells noa to discard voxel data within a given `AABB` (e.g. because
     * the game client received updated data from a server).
     * The engine will mark all affected chunks for removal, and will later emit
     * new `worldDataNeeded` events (if the chunk is still in draw range).
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateVoxelsInAABB(box) {
        this.world._queues.invalidateChunksInBox(box)
    }

    /**
     * When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be created and loaded.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyLoadChunk(x = 0, y = 0, z = 0) {
        var world = this.world
        if (!world.manuallyControlChunkLoading) throw manualErr
        var [i, j, k] = world._coordsToChunkIndexes(x, y, z)
        world._chunksKnown.add(i, j, k)
        world._chunksToRequest.add(i, j, k)
    }

    /**
     * When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be unloaded and disposed.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyUnloadChunk(x = 0, y = 0, z = 0) {
        var world = this.world
        if (!world.manuallyControlChunkLoading) throw manualErr
        var [i, j, k] = world._coordsToChunkIndexes(x, y, z)
        world._chunksToRemove.add(i, j, k)
        world._chunksToMesh.remove(i, j, k)
        world._chunksToRequest.remove(i, j, k)
        world._chunksToMeshFirst.remove(i, j, k)
    }

    /**
     * Returns whether the initial chunk load has completed.
     * This becomes true when all initially requested chunks are loaded and meshed
     * (when both pending and mesh queues are empty for the first time).
     * @returns {boolean}
     */
    isInitialLoadComplete() {
        return this.world._initialLoadComplete
    }

    /**
     * Clients should call this after creating a chunk's worth of data (as an ndarray).
     * If userData is passed in it will be attached to the chunk.
     * @param {string} id - the string specified when the chunk was requested
     * @param {*} array - an ndarray of voxel data
     * @param {*} [userData=null] - an arbitrary value for game client use
     * @param {number} [fillVoxelID=-1] - specify a voxel ID here if you want to signify that
     * the entire chunk should be solidly filled with that voxel (e.g. `0` for air).
     * If you do this, the voxel array data will be overwritten and the engine will
     * take a fast path through some initialization steps.
     */
    setChunkData(id, array, userData = null, fillVoxelID = -1) {
        this.setChunkDataInternal(id, array, userData, fillVoxelID)
    }

    /**
     * Create chunk object and request voxel data from client.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     */
    requestNewChunk(i, j, k) {
        var world = this.world
        var size = world._chunkSize
        var worldName = world.noa.worldName
        var requestID = [i, j, k, worldName].join('|')
        var x = i * size
        var y = j * size
        var z = k * size
        world._chunksPending.add(i, j, k)

        // If async generator is registered, use it instead of events
        // Async generators provide their own voxelData, so we don't pre-allocate
        if (world._chunkGen.hasAsyncGenerator()) {
            world._chunkGen.requestNewChunkAsync(requestID, x, y, z, worldName)
        } else {
            // Event-based API needs pre-allocated array for client to fill
            var dataArr = Chunk._createVoxelArray(world._chunkSize)
            world.emit('worldDataNeeded', requestID, dataArr, x, y, z, worldName)
        }
        profile_queues_hook('request')
    }

    /**
     * Called when client sets a chunk's voxel data.
     * If userData is passed in it will be attached to the chunk.
     * @param {string} reqID
     * @param {*} array
     * @param {*} userData
     * @param {number} fillVoxelID
     */
    setChunkDataInternal(reqID, array, userData, fillVoxelID) {
        var world = this.world
        var arr = reqID.split('|')
        var i = parseInt(arr.shift())
        var j = parseInt(arr.shift())
        var k = parseInt(arr.shift())
        var worldName = arr.join('|')
        world._chunksPending.remove(i, j, k)
        // discard data if it's for a world that's no longer current
        if (worldName !== world.noa.worldName) return
        // discard if chunk is no longer needed
        if (!world._chunksKnown.includes(i, j, k)) return
        if (world._chunksToRemove.includes(i, j, k)) return

        var chunk = world._storage.getChunkByIndexes(i, j, k)
        if (!chunk) {
            // if chunk doesn't exist, create and init
            var size = world._chunkSize
            chunk = new Chunk(world.noa, reqID, i, j, k, size, array, fillVoxelID)
            world._storage.storeChunkByIndexes(i, j, k, chunk)
            chunk.userData = userData
            world.noa.rendering.prepareChunkForRendering(chunk)
            world.emit('chunkAdded', chunk)
        } else {
            // else we're updating data for an existing chunk
            chunk._updateVoxelArray(array, fillVoxelID)
        }
        // chunk can now be meshed, and ping neighbors
        world._queues.possiblyQueueChunkForMeshing(chunk)
        this.updateNeighborsOfChunk(i, j, k, chunk)

        profile_queues_hook('receive')
    }

    /**
     * Remove a chunk that wound up in the remove queue.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     */
    removeChunk(i, j, k) {
        var world = this.world
        var chunk = world._storage.getChunkByIndexes(i, j, k)

        // Cancel any pending async generation for this chunk
        var worldName = world.noa.worldName
        var requestID = [i, j, k, worldName].join('|')
        world._chunkGen.cancelAsyncRequest(requestID)

        if (chunk) {
            world.emit('chunkBeingRemoved', chunk.requestID, chunk.voxels, chunk.userData)
            world.noa.rendering.disposeChunkForRendering(chunk)
            chunk.dispose()
            profile_queues_hook('dispose')
            this.updateNeighborsOfChunk(i, j, k, null)
        }

        world._storage.removeChunkByIndexes(i, j, k)
        world._chunksKnown.remove(i, j, k)
        world._chunksToMesh.remove(i, j, k)
        world._chunksToRemove.remove(i, j, k)
        world._chunksToMeshFirst.remove(i, j, k)
        world._chunksPending.remove(i, j, k)
    }

    /**
     * Remesh a chunk.
     * @param {import('../chunk.js').Chunk} chunk
     */
    doChunkRemesh(chunk) {
        var world = this.world
        world._chunksToMesh.remove(chunk.i, chunk.j, chunk.k)
        world._chunksToMeshFirst.remove(chunk.i, chunk.j, chunk.k)
        chunk.updateMeshes()
        profile_queues_hook('mesh')
    }

    /**
     * Keep neighbor data updated when chunk is added or removed.
     * @param {number} ci - Chunk X index
     * @param {number} cj - Chunk Y index
     * @param {number} ck - Chunk Z index
     * @param {import('../chunk.js').Chunk|null} chunk - The chunk or null if removed
     */
    updateNeighborsOfChunk(ci, cj, ck, chunk) {
        var world = this.world
        var terrainChanged = (!chunk) || (chunk && !chunk._isEmpty)
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                for (var k = -1; k <= 1; k++) {
                    if ((i | j | k) === 0) continue
                    var neighbor = world._storage.getChunkByIndexes(ci + i, cj + j, ck + k)
                    if (!neighbor) continue
                    // flag neighbor, assume terrain needs remeshing
                    if (terrainChanged) neighbor._terrainDirty = true
                    // update neighbor counts and references, both ways
                    if (chunk && !chunk._neighbors.get(i, j, k)) {
                        chunk._neighborCount++
                        chunk._neighbors.set(i, j, k, neighbor)
                    }
                    var nabRef = neighbor._neighbors.get(-i, -j, -k)
                    if (chunk && !nabRef) {
                        neighbor._neighborCount++
                        neighbor._neighbors.set(-i, -j, -k, chunk)
                        // immediately queue neighbor if it's surrounded
                        if (neighbor._neighborCount === 26) {
                            world._queues.possiblyQueueChunkForMeshing(neighbor)
                        }
                    }
                    if (!chunk && nabRef) {
                        neighbor._neighborCount--
                        neighbor._neighbors.set(-i, -j, -k, null)
                    }
                }
            }
        }
    }
}
