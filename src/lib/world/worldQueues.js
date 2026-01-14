/**
 * Chunk queue management and processing.
 * Handles scanning for chunks to add/remove and processing work queues.
 * @module worldQueues
 */

import { sortQueueByDistanceFrom, defaultSortDistance } from './worldUtils.js'


/**
 * Handles chunk queue management and processing.
 */
export class WorldQueues {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world

        // Module-level state for incremental scanning
        /** @internal */
        this._removeCheckIndex = 0
        /** @internal */
        this._meshCheckIndex = 0
    }

    /**
     * Get chunk indexes of where the player is.
     * @returns {[number, number, number]}
     */
    getPlayerChunkIndexes() {
        var world = this.world
        var pos = world.noa.entities.getPosition(world.noa.playerEntity)
        return world._coordsToChunkIndexes(pos[0], pos[1], pos[2])
    }

    /**
     * Get chunk object by world coordinates.
     * @internal
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {import('../chunk.js').Chunk|null}
     */
    getChunkByCoords(x = 0, y = 0, z = 0) {
        // let internal modules request a chunk object
        var world = this.world
        var [i, j, k] = world._coordsToChunkIndexes(x, y, z)
        return world._storage.getChunkByIndexes(i, j, k)
    }

    /**
     * Internal accessor for chunks to queue themselves for remeshing
     * after their data changes.
     * @param {import('../chunk.js').Chunk} chunk
     */
    queueChunkForRemesh(chunk) {
        this.possiblyQueueChunkForMeshing(chunk)
    }

    /**
     * Gradually scan neighborhood chunk locs; add missing ones to "toRequest".
     * @param {number} ci - Player chunk X index
     * @param {number} cj - Player chunk Y index
     * @param {number} ck - Player chunk Z index
     */
    findChunksToRequest(ci, cj, ck) {
        var world = this.world
        var toRequest = world._chunksToRequest
        var numQueued = toRequest.count()
        var maxQueued = 50
        if (numQueued >= maxQueued) return

        // handle changes to chunk sorting function
        var sortDistFn = world.chunkSortingDistFn || defaultSortDistance
        if (sortDistFn !== world._prevSortingFn) {
            sortQueueByDistanceFrom(world, world._chunksSortedLocs, 0, 0, 0, true)
            world._prevSortingFn = sortDistFn
        }

        // consume the pre-sorted positions array, checking each loc and
        // its reflections for locations that need to be added to request queue
        var locsArr = world._chunksSortedLocs.arr
        var ix = world._chunkAddSearchFrom
        var maxIter = Math.min(20, locsArr.length / 10)
        for (var ct = 0; ct < maxIter; ct++) {
            var [di, dj, dk] = locsArr[ix++ % locsArr.length]
            this._checkReflectedLocations(ci, cj, ck, di, dj, dk)
            if (toRequest.count() >= maxQueued) break
        }

        // only advance start point if nothing is invalidated,
        // so that nearby chunks stay at high priority in that case
        if (world._chunksInvalidated.isEmpty()) {
            world._chunkAddSearchFrom = ix % locsArr.length
        }

        // queue should be mostly sorted, but may not have been empty
        sortQueueByDistanceFrom(world, toRequest, ci, cj, ck, false)
    }

    /**
     * Helpers for checking whether to add a location, and reflections of it.
     * @param {number} ci
     * @param {number} cj
     * @param {number} ck
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    _checkReflectedLocations(ci, cj, ck, i, j, k) {
        this._checkOneLocation(ci + i, cj + j, ck + k)
        if (i !== k) this._checkOneLocation(ci + k, cj + j, ck + i)
        if (i > 0) this._checkReflectedLocations(ci, cj, ck, -i, j, k)
        if (j > 0) this._checkReflectedLocations(ci, cj, ck, i, -j, k)
        if (k > 0) this._checkReflectedLocations(ci, cj, ck, i, j, -k)
    }

    /**
     * Finally, the logic for each reflected location checked.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    _checkOneLocation(i, j, k) {
        var world = this.world
        if (world._chunksKnown.includes(i, j, k)) return
        // Check world bounds - skip chunks outside finite world
        var bounds = world._worldBounds
        if (bounds) {
            if (i < bounds.minX || i > bounds.maxX ||
                j < bounds.minY || j > bounds.maxY ||
                k < bounds.minZ || k > bounds.maxZ) return
        }
        world._chunksKnown.add(i, j, k)
        world._chunksToRequest.add(i, j, k, true)
    }

    /**
     * Incrementally scan known chunks for any that are no longer in range.
     * Assume that the order they're removed in isn't very important.
     * @param {number} ci - Player chunk X index
     * @param {number} cj - Player chunk Y index
     * @param {number} ck - Player chunk Z index
     */
    findDistantChunksToRemove(ci, cj, ck) {
        var world = this.world
        var distCheck = world._remDistanceFn
        var toRemove = world._chunksToRemove
        var numQueued = toRemove.count() + world._chunksInvalidated.count()
        var maxQueued = 50
        if (numQueued >= maxQueued) return

        var knownArr = world._chunksKnown.arr
        if (knownArr.length === 0) return
        var maxIter = Math.min(100, knownArr.length / 10)
        var found = false
        for (var ct = 0; ct < maxIter; ct++) {
            var [i, j, k] = knownArr[this._removeCheckIndex++ % knownArr.length]
            if (toRemove.includes(i, j, k)) continue
            if (distCheck(i - ci, j - cj, k - ck)) continue
            // flag chunk for removal and remove it from work queues
            world._chunksToRemove.add(i, j, k)
            world._chunksToRequest.remove(i, j, k)
            world._chunksToMesh.remove(i, j, k)
            world._chunksToMeshFirst.remove(i, j, k)
            found = true
            numQueued++
            if (numQueued > maxQueued) break
        }
        this._removeCheckIndex = this._removeCheckIndex % knownArr.length
        if (found) sortQueueByDistanceFrom(world, toRemove, ci, cj, ck)
    }

    /**
     * Incrementally look for chunks that could be re-meshed.
     */
    findChunksToMesh() {
        var world = this.world
        var maxQueued = 10
        var numQueued = world._chunksToMesh.count() + world._chunksToMeshFirst.count()
        if (numQueued > maxQueued) return
        var knownArr = world._chunksKnown.arr
        if (knownArr.length === 0) return
        var maxIter = Math.min(50, knownArr.length / 10)
        for (var ct = 0; ct < maxIter; ct++) {
            var [i, j, k] = knownArr[this._meshCheckIndex++ % knownArr.length]
            var chunk = world._storage.getChunkByIndexes(i, j, k)
            if (!chunk) continue
            var res = this.possiblyQueueChunkForMeshing(chunk)
            if (res) numQueued++
            if (numQueued > maxQueued) break
        }
        this._meshCheckIndex %= knownArr.length
    }

    /**
     * Invalidate chunks overlapping the given AABB.
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateChunksInBox(box) {
        var world = this.world
        var min = world._coordsToChunkIndexes(box.base[0], box.base[1], box.base[2])
        var max = world._coordsToChunkIndexes(box.max[0], box.max[1], box.max[2])
        for (var i = 0; i < 3; i++) {
            if (!Number.isFinite(box.base[i])) min[i] = box.base[i]
            if (!Number.isFinite(box.max[i])) max[i] = box.max[i]
        }
        world._chunksKnown.forEach(loc => {
            var [i, j, k] = loc
            if (i < min[0] || i >= max[0]) return
            if (j < min[1] || j >= max[1]) return
            if (k < min[2] || k >= max[2]) return
            world._chunksInvalidated.add(i, j, k)
            world._chunksToRemove.remove(i, j, k)
            world._chunksToRequest.remove(i, j, k)
            world._chunksToMesh.remove(i, j, k)
            world._chunksToMeshFirst.remove(i, j, k)
        })
    }

    /**
     * When current world changes - empty work queues and mark all for removal.
     */
    markAllChunksInvalid() {
        var world = this.world

        // Cancel all pending async chunk requests
        world._chunkGen.cancelAllAsyncRequests()

        world._chunksInvalidated.copyFrom(world._chunksKnown)
        world._chunksToRemove.empty()
        world._chunksToRequest.empty()
        world._chunksToMesh.empty()
        world._chunksToMeshFirst.empty()
        sortQueueByDistanceFrom(world, world._chunksInvalidated)
    }

    /**
     * Run through chunk tracking queues looking for work to do next.
     * @returns {boolean} - True if queue is empty
     */
    processRequestQueue() {
        var world = this.world
        var toRequest = world._chunksToRequest
        if (toRequest.isEmpty()) return true
        // skip if too many outstanding requests, or if meshing queue is full
        var pending = world._chunksPending.count()
        var toMesh = world._chunksToMesh.count()
        if (pending >= world.maxChunksPendingCreation) return true
        if (toMesh >= world.maxChunksPendingMeshing) return true
        var [i, j, k] = toRequest.pop()
        world._lifecycle.requestNewChunk(i, j, k)
        return toRequest.isEmpty()
    }

    /**
     * Process the remove queue.
     * @returns {boolean} - True if queue is empty
     */
    processRemoveQueue() {
        var world = this.world
        var queue = world._chunksInvalidated
        if (queue.isEmpty()) queue = world._chunksToRemove
        if (queue.isEmpty()) return true
        var [i, j, k] = queue.pop()
        world._lifecycle.removeChunk(i, j, k)
        return (queue.isEmpty())
    }

    /**
     * Process chunks waiting to be meshed.
     * @param {boolean} firstOnly - Only process high-priority queue
     * @returns {boolean} - True if done (for breaking out of processing loop)
     */
    processMeshingQueue(firstOnly) {
        var world = this.world
        var queue = world._chunksToMeshFirst
        if (queue.isEmpty() && !firstOnly) queue = world._chunksToMesh
        if (queue.isEmpty()) return true
        var [i, j, k] = queue.pop()
        if (world._chunksToRemove.includes(i, j, k)) return false
        var chunk = world._storage.getChunkByIndexes(i, j, k)
        if (chunk) world._lifecycle.doChunkRemesh(chunk)
        return false
    }

    /**
     * Check if chunk should be queued for meshing and queue if so.
     * @param {import('../chunk.js').Chunk} chunk
     * @returns {boolean} - True if chunk was queued
     */
    possiblyQueueChunkForMeshing(chunk) {
        var world = this.world
        if (!(chunk._terrainDirty || chunk._objectsDirty)) return false
        if (chunk._neighborCount < world.minNeighborsToMesh) return false
        if (world._chunksToMesh.includes(chunk.i, chunk.j, chunk.k)) return false
        if (world._chunksToMeshFirst.includes(chunk.i, chunk.j, chunk.k)) return false
        var queue = (chunk._neighborCount === 26) ?
            world._chunksToMeshFirst : world._chunksToMesh
        queue.add(chunk.i, chunk.j, chunk.k)
        world._sortMeshQueueEvery++
        if (world._sortMeshQueueEvery > 20) {
            sortQueueByDistanceFrom(world, queue)
            world._sortMeshQueueEvery = 0
        }
        return true
    }
}
