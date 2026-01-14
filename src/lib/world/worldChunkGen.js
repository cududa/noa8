/**
 * Async chunk generator registration and handling.
 * @module worldChunkGen
 */

import { Chunk } from '../chunk.js'

/**
 * Result from async chunk generator
 * @typedef {object} ChunkGeneratorResult
 * @property {*} voxelData - ndarray of voxel data
 * @property {*} [userData] - optional user data attached to chunk
 * @property {number} [fillVoxelID] - optional fill ID for uniform chunks
 */

/**
 * Async chunk generator function signature
 * @typedef {function(number, number, number, number, AbortSignal): Promise<ChunkGeneratorResult|null>} ChunkGeneratorFunction
 */


/**
 * Handles async chunk generator registration and execution.
 */
export class WorldChunkGen {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world

        /** @type {ChunkGeneratorFunction|null} */
        this._asyncChunkGenerator = null

        /** @type {Map<string, AbortController>} requestID -> AbortController */
        this._asyncChunkAbortControllers = new Map()

        /** @type {Map<string, Promise<void>>} requestID -> Promise */
        this._asyncChunkPromises = new Map()
    }

    /**
     * Whether an async generator is registered.
     * @returns {boolean}
     */
    hasAsyncGenerator() {
        return !!this._asyncChunkGenerator
    }

    /**
     * Register an async chunk generator function. When registered, this function
     * will be called instead of emitting `worldDataNeeded` events.
     *
     * The generator function receives:
     * - `x, y, z`: World coordinates of chunk origin
     * - `chunkSize`: Size of chunk in each dimension
     * - `signal`: AbortSignal that fires if chunk is cancelled (left view range)
     *
     * It should return a Promise that resolves to either:
     * - An object `{ voxelData, userData?, fillVoxelID? }` where voxelData is an ndarray
     * - Or `null` to indicate the chunk should be empty (all air)
     *
     * @param {ChunkGeneratorFunction} generatorFn
     * @example
     * ```js
     * noa.world.registerChunkGenerator(async (x, y, z, chunkSize, signal) => {
     *   // Check for cancellation
     *   if (signal.aborted) return null
     *
     *   // Generate or fetch chunk data
     *   const voxelData = await generateChunk(x, y, z, chunkSize)
     *
     *   // Can check signal periodically during long operations
     *   if (signal.aborted) return null
     *
     *   return { voxelData }
     * })
     * ```
     */
    registerChunkGenerator(generatorFn) {
        var world = this.world
        this._asyncChunkGenerator = generatorFn

        // Re-request any chunks that were requested before the generator was registered
        // These would have emitted worldDataNeeded events with no handler
        var pendingCount = world._chunksPending.count()
        if (pendingCount > 0) {
            console.log(`[noa:world] Re-requesting ${pendingCount} pending chunks`)
            var pending = world._chunksPending.arr.slice() // copy array
            world._chunksPending.empty()
            pending.forEach((loc) => {
                world._lifecycle.requestNewChunk(loc[0], loc[1], loc[2])
            })
        }
    }

    /**
     * Handle async chunk generation for a specific request.
     * @param {string} requestID
     * @param {number} x - World X coordinate of chunk origin
     * @param {number} y - World Y coordinate of chunk origin
     * @param {number} z - World Z coordinate of chunk origin
     * @param {string} worldName - Current world name for validation
     */
    requestNewChunkAsync(requestID, x, y, z, worldName) {
        var world = this.world
        var self = this

        // Create abort controller for this request
        var abortController = new AbortController()
        this._asyncChunkAbortControllers.set(requestID, abortController)

        var promise = this._asyncChunkGenerator(x, y, z, world._chunkSize, abortController.signal)
            .then(result => {
                // Only clean up if this is still the active request for this chunk
                // (prevents race where chunk removed & re-requested before promise resolves)
                if (self._asyncChunkAbortControllers.get(requestID) === abortController) {
                    self._asyncChunkAbortControllers.delete(requestID)
                    self._asyncChunkPromises.delete(requestID)
                }

                // Check if aborted or world changed
                if (abortController.signal.aborted) return
                if (worldName !== world.noa.worldName) return

                // Handle null result (empty chunk) - create empty array on demand
                if (result === null) {
                    var emptyArr = Chunk._createVoxelArray(world._chunkSize)
                    world._lifecycle.setChunkDataInternal(requestID, emptyArr, null, 0)
                    return
                }

                // Handle result with voxelData
                var { voxelData, userData, fillVoxelID } = result
                if (voxelData) {
                    world._lifecycle.setChunkDataInternal(requestID, voxelData, userData || null, fillVoxelID ?? -1)
                } else {
                    // No voxel data provided, treat as empty - create array on demand
                    var fallbackArr = Chunk._createVoxelArray(world._chunkSize)
                    world._lifecycle.setChunkDataInternal(requestID, fallbackArr, userData || null, 0)
                }
            })
            .catch(err => {
                // Only clean up if this is still the active request for this chunk
                if (self._asyncChunkAbortControllers.get(requestID) === abortController) {
                    self._asyncChunkAbortControllers.delete(requestID)
                    self._asyncChunkPromises.delete(requestID)
                }

                // Don't log abort errors - they're expected
                if (err.name === 'AbortError') return

                console.error(`[noa] Async chunk generation failed for ${requestID}:`, err)
                // On error, create empty chunk as fallback to prevent permanent holes
                var errorArr = Chunk._createVoxelArray(world._chunkSize)
                world._lifecycle.setChunkDataInternal(requestID, errorArr, null, 0)
            })

        this._asyncChunkPromises.set(requestID, promise)
    }

    /**
     * Cancel an async chunk request by ID.
     * @param {string} requestID
     */
    cancelAsyncRequest(requestID) {
        var abortController = this._asyncChunkAbortControllers.get(requestID)
        if (abortController) {
            abortController.abort()
            this._asyncChunkAbortControllers.delete(requestID)
            this._asyncChunkPromises.delete(requestID)
        }
    }

    /**
     * Cancel all pending async chunk requests.
     */
    cancelAllAsyncRequests() {
        for (var [requestID, abortController] of this._asyncChunkAbortControllers) {
            abortController.abort()
        }
        this._asyncChunkAbortControllers.clear()
        this._asyncChunkPromises.clear()
    }
}
