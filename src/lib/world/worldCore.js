/**
 * Core state initialization and storage management for World module.
 * @module worldCore
 */

import { LocationQueue, ChunkStorage } from '../util.js'
import { createCoordsToChunkIndexes, createCoordsToChunkLocals } from './worldCoords.js'


/**
 * Core state and storage management class.
 */
export class WorldCore {
    /**
     * @param {import('./index.js').World} world
     * @param {import('./worldUtils.js').WorldOptions} opts
     */
    constructor(world, opts) {
        /** @type {import('./index.js').World} */
        this.world = world

        // Init internal chunk queues:

        /** All chunks existing in any queue
         * @type {LocationQueue} */
        world._chunksKnown = new LocationQueue()

        /** In range but not yet requested from client
         * @type {LocationQueue} */
        world._chunksToRequest = new LocationQueue()

        /** Known to have invalid data (wrong world, eg)
         * @type {LocationQueue} */
        world._chunksInvalidated = new LocationQueue()

        /** Out of range, and waiting to be removed
         * @type {LocationQueue} */
        world._chunksToRemove = new LocationQueue()

        /** Requested, awaiting data event from client
         * @type {LocationQueue} */
        world._chunksPending = new LocationQueue()

        /** Has data, waiting to be (re-)meshed
         * @type {LocationQueue} */
        world._chunksToMesh = new LocationQueue()

        /** Priority queue for chunks to re-mesh
         * @type {LocationQueue} */
        world._chunksToMeshFirst = new LocationQueue()

        /** A queue of chunk locations, rather than chunk references.
         * Has only the positive 1/16 quadrant, sorted (reverse order!)
         * @type {LocationQueue} */
        world._chunksSortedLocs = new LocationQueue()

        // chunks stored in a data structure for quick lookup
        // note that the hash wraps around every 1024 chunk indexes!!
        // i.e. two chunks that far apart can't be loaded at the same time
        /** @type {ChunkStorage} */
        world._storage = new ChunkStorage()

        // coordinate converter functions - create optimized versions based on chunk size
        var cs = opts.chunkSize
        world._coordsToChunkIndexes = createCoordsToChunkIndexes(cs)
        world._coordsToChunkLocals = createCoordsToChunkLocals(cs)

        // when chunk size is a power of two, store optimization values
        var powerOfTwo = ((cs & cs - 1) === 0)
        if (powerOfTwo) {
            /** @internal */
            world._coordShiftBits = Math.log2(cs) | 0
            /** @internal */
            world._coordMask = (cs - 1) | 0
        }
    }

    /**
     * Get chunk by indexes from storage.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     * @returns {import('../chunk.js').Chunk|null}
     */
    getChunkByIndexes(i, j, k) {
        return this.world._storage.getChunkByIndexes(i, j, k)
    }

    /**
     * Store chunk by indexes.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     * @param {import('../chunk.js').Chunk} chunk
     */
    storeChunkByIndexes(i, j, k, chunk) {
        this.world._storage.storeChunkByIndexes(i, j, k, chunk)
    }

    /**
     * Remove chunk from storage by indexes.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    removeChunkByIndexes(i, j, k) {
        this.world._storage.removeChunkByIndexes(i, j, k)
    }
}
