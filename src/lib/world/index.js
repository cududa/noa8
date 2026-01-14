/**
 * World module - manages world data, chunks, voxels.
 * @module world
 */

import EventEmitter from 'events'
import { Chunk } from '../chunk.js'
import { locationHasher } from '../util.js'

import { WorldCore } from './worldCore.js'
import { WorldVoxels } from './worldVoxels.js'
import { WorldChunkGen } from './worldChunkGen.js'
import { WorldBounds } from './worldBounds.js'
import { WorldQueues } from './worldQueues.js'
import { WorldLifecycle } from './worldLifecycle.js'
import { WorldDebug, profile_hook, profile_queues_hook } from './worldDebug.js'
import { defaultOptions } from './worldUtils.js'


/**
 * `noa.world` - manages world data, chunks, voxels.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * var defaultOptions = {
 *   chunkSize: 24,
 *   chunkAddDistance: [2, 2],           // [horizontal, vertical]
 *   chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
 *   worldGenWhilePaused: false,
 *   manuallyControlChunkLoading: false,
 * }
 * ```
 *
 * **Events:**
 *  + `worldDataNeeded = (requestID, dataArr, x, y, z, worldName)`
 *    Alerts client that a new chunk of world data is needed.
 *  + `playerEnteredChunk => (i, j, k)`
 *    Fires when player enters a new chunk
 *  + `chunkAdded => (chunk)`
 *    Fires after a new chunk object is added to the world
 *  + `chunkBeingRemoved = (requestID, dataArr, userData)`
 *    Fires before a chunk is removed from world
 *  + `initialLoadComplete => ()`
 *    Fires once when all initially requested chunks are loaded and meshed
 */
export class World extends EventEmitter {

    /**
     * @internal
     * @param {import('../../index.js').Engine} noa
     * @param {import('./worldUtils.js').WorldOptions} opts
     */
    constructor(noa, opts) {
        super()
        opts = Object.assign({}, defaultOptions, opts)

        /** @internal */
        this.noa = noa

        /** @internal */
        this.playerChunkLoaded = false

        /**
         * Whether the initial chunk load has completed.
         * Becomes true when all initially requested chunks are loaded and meshed.
         * @type {boolean}
         */
        this._initialLoadComplete = false

        /** @internal */
        this.Chunk = Chunk // expose this class for ...reasons

        /**
         * Game clients should set this if they need to manually control
         * which chunks to load and unload. When set, client should call
         * `noa.world.manuallyLoadChunk` / `manuallyUnloadChunk` as needed.
         */
        this.manuallyControlChunkLoading = !!opts.manuallyControlChunkLoading

        /**
         * Defining this function sets a custom order in which to create chunks.
         * The function should look like:
         * ```js
         *   (i, j, k) => 1 // return a smaller number for chunks to process first
         * ```
         * @type {import('./worldUtils.js').ChunkSortingDistFn|null}
         */
        this.chunkSortingDistFn = null

        /**
         * Set this higher to cause chunks not to mesh until they have some neighbors.
         * Max legal value is 26 (each chunk will mesh only when all neighbors are present)
         */
        this.minNeighborsToMesh = 6

        /** When true, worldgen queues will keep running if engine is paused. */
        this.worldGenWhilePaused = !!opts.worldGenWhilePaused

        /** Limit the size of internal chunk processing queues
         * @type {number}
         */
        this.maxChunksPendingCreation = 50

        /** Limit the size of internal chunk processing queues
         * @type {number}
         */
        this.maxChunksPendingMeshing = 50

        /** Cutoff (in ms) of time spent each **tick**
         * @type {number}
         */
        this.maxProcessingPerTick = 5

        /** Cutoff (in ms) of time spent each **render**
         * @type {number}
         */
        this.maxProcessingPerRender = 3

        // Internal state

        /** @internal */
        this._chunkSize = opts.chunkSize
        /** @internal */
        this._chunkAddDistance = [2, 2]
        /** @internal */
        this._chunkRemoveDistance = [3, 3]
        /** @internal */
        this._addDistanceFn = null
        /** @internal */
        this._remDistanceFn = null
        /** @internal */
        this._prevWorldName = ''
        /** @internal */
        this._prevPlayerChunkHash = 0
        /** @internal */
        this._chunkAddSearchFrom = 0
        /** @internal */
        this._prevSortingFn = null
        /** @internal */
        this._sortMeshQueueEvery = 0
        /** @internal World bounds in chunk indices - null means infinite world
         * @type {import('./worldBounds.js').WorldBoundsConfig|null} */
        this._worldBounds = null

        // These will be initialized by WorldCore
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksKnown = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToRequest = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksInvalidated = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToRemove = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksPending = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToMesh = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksToMeshFirst = null
        /** @internal @type {import('../util.js').LocationQueue} */
        this._chunksSortedLocs = null
        /** @internal @type {import('../util.js').ChunkStorage} */
        this._storage = null
        /** @internal @type {function(number, number, number): [number, number, number]} */
        this._coordsToChunkIndexes = null
        /** @internal @type {function(number, number, number): [number, number, number]} */
        this._coordsToChunkLocals = null
        /** @internal @type {number} - bit shift for power-of-two chunk sizes */
        this._coordShiftBits = 0
        /** @internal @type {number} - bit mask for power-of-two chunk sizes */
        this._coordMask = 0

        // Initialize sub-modules
        /** @internal */
        this._core = new WorldCore(this, opts)
        /** @internal */
        this._voxels = new WorldVoxels(this)
        /** @internal */
        this._chunkGen = new WorldChunkGen(this)
        /** @internal */
        this._bounds = new WorldBounds(this)
        /** @internal */
        this._queues = new WorldQueues(this)
        /** @internal */
        this._lifecycle = new WorldLifecycle(this)
        /** @internal */
        this._debug = new WorldDebug(this)

        // Apply initial distances (after queues are initialized)
        this.setAddRemoveDistance(opts.chunkAddDistance, opts.chunkRemoveDistance)
    }


    // ============ VOXEL API ============

    /**
     * Get the block ID at the given world coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {number}
     */
    getBlockID(x, y, z) { return this._voxels.getBlockID(x, y, z) }

    /**
     * Get whether the block at the given coordinates is solid.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockSolidity(x, y, z) { return this._voxels.getBlockSolidity(x, y, z) }

    /**
     * Get the opacity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockOpacity(x, y, z) { return this._voxels.getBlockOpacity(x, y, z) }

    /**
     * Get the fluidity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockFluidity(x, y, z) { return this._voxels.getBlockFluidity(x, y, z) }

    /**
     * Get the properties object of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {object}
     */
    getBlockProperties(x, y, z) { return this._voxels.getBlockProperties(x, y, z) }

    /**
     * Set the block ID at the given world coordinates.
     * @param {number} [id=0]
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setBlockID(id, x, y, z) { return this._voxels.setBlockID(id, x, y, z) }

    /**
     * Check if the given AABB is unobstructed (no solid blocks).
     * @param {{ base: number[], max: number[] }} box
     * @returns {boolean}
     */
    isBoxUnobstructed(box) { return this._voxels.isBoxUnobstructed(box) }


    // ============ CHUNK GENERATOR ============

    /**
     * Register an async chunk generator function.
     * @param {import('./worldChunkGen.js').ChunkGeneratorFunction} generatorFn
     */
    registerChunkGenerator(generatorFn) { return this._chunkGen.registerChunkGenerator(generatorFn) }


    // ============ BOUNDS & DISTANCE ============

    /**
     * Sets the distances within which to load new chunks, and beyond which to unload them.
     * @param {number | number[]} [addDist=2]
     * @param {number | number[]} [remDist=3]
     */
    setAddRemoveDistance(addDist, remDist) { return this._bounds.setAddRemoveDistance(addDist, remDist) }

    /**
     * Set finite world bounds in chunk indices.
     * @param {number|null|undefined} minX
     * @param {number} [maxX]
     * @param {number} [minY]
     * @param {number} [maxY]
     * @param {number} [minZ]
     * @param {number} [maxZ]
     */
    setWorldBounds(minX, maxX, minY, maxY, minZ, maxZ) { return this._bounds.setWorldBounds(minX, maxX, minY, maxY, minZ, maxZ) }

    /**
     * Automatically configure chunk load/unload distances based on a baked world's bounds.
     * @param {import('./worldBounds.js').BakedWorldLoader} loader
     * @param {[number, number, number]} [spawnPosition]
     * @param {object} [options]
     */
    setAddRemoveDistanceFromBakedWorld(loader, spawnPosition, options) { return this._bounds.setAddRemoveDistanceFromBakedWorld(loader, spawnPosition, options) }


    // ============ LIFECYCLE ============

    /**
     * Tells noa to discard voxel data within a given AABB.
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateVoxelsInAABB(box) { return this._lifecycle.invalidateVoxelsInAABB(box) }

    /**
     * When manually controlling chunk loading, request a chunk to be loaded.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyLoadChunk(x, y, z) { return this._lifecycle.manuallyLoadChunk(x, y, z) }

    /**
     * When manually controlling chunk loading, request a chunk to be unloaded.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyUnloadChunk(x, y, z) { return this._lifecycle.manuallyUnloadChunk(x, y, z) }

    /**
     * Clients should call this after creating a chunk's worth of data.
     * @param {string} id
     * @param {*} array
     * @param {*} [userData=null]
     * @param {number} [fillVoxelID=-1]
     */
    setChunkData(id, array, userData, fillVoxelID) { return this._lifecycle.setChunkData(id, array, userData, fillVoxelID) }

    /**
     * Returns whether the initial chunk load has completed.
     * @returns {boolean}
     */
    isInitialLoadComplete() { return this._lifecycle.isInitialLoadComplete() }


    // ============ INTERNAL API ============

    /**
     * @internal
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {import('../chunk.js').Chunk|null}
     */
    _getChunkByCoords(x, y, z) { return this._queues.getChunkByCoords(x, y, z) }

    /**
     * @internal
     * @param {import('../chunk.js').Chunk} chunk
     */
    _queueChunkForRemesh(chunk) { return this._queues.queueChunkForRemesh(chunk) }


    // ============ DEBUG ============

    /** @internal */
    report() { return this._debug.report() }


    // ============ TICK/RENDER/DISPOSE ============

    /** @internal */
    tick() {
        var tickStartTime = performance.now()

        // get indexes of player's current chunk, and has it changed since last tick?
        var [ci, cj, ck] = this._queues.getPlayerChunkIndexes()
        var chunkLocHash = locationHasher(ci, cj, ck)
        var changedChunks = (chunkLocHash !== this._prevPlayerChunkHash)
        if (changedChunks) {
            this.emit('playerEnteredChunk', ci, cj, ck)
            this._prevPlayerChunkHash = chunkLocHash
            this._chunkAddSearchFrom = 0
        }

        // if world has changed, invalidate everything and ping
        // removals queue so that player's chunk gets loaded back quickly
        if (this._prevWorldName !== this.noa.worldName) {
            if (!this.manuallyControlChunkLoading) {
                this._queues.markAllChunksInvalid()
                this._chunkAddSearchFrom = 0
                this._queues.processRemoveQueue()
            }
            this._prevWorldName = this.noa.worldName
        }

        profile_hook('start')
        profile_queues_hook('start')

        // scan for chunks to add/remove (unless client handles manually)
        if (!this.manuallyControlChunkLoading) {
            this._queues.findDistantChunksToRemove(ci, cj, ck)
            profile_hook('remQueue')
            this._queues.findChunksToRequest(ci, cj, ck)
            profile_hook('addQueue')
        }

        // possibly scan for additions to meshing queue if it's empty
        this._queues.findChunksToMesh()

        // process (create or mesh) some chunks, up to max iteration time
        var t = performance.now()
        var t1 = tickStartTime + (this.maxProcessingPerTick || 0)
        if (t < t1) t1 = t + 1
        var done1 = false
        var done2 = false
        var done3 = false
        while (t < t1) {
            if (!done1) {
                done1 = this._queues.processRemoveQueue()
                profile_hook('removes')
            }
            if (!done2) {
                done2 = this._queues.processRequestQueue()
                profile_hook('requests')
            }
            if (!done3) {
                done3 = this._queues.processMeshingQueue(false)
                profile_hook('meshes')
            }
            if (done1 && done2 && done3) break
            t = performance.now()
        }

        // track whether the player's local chunk is loaded and ready or not
        var pChunk = this._storage.getChunkByIndexes(ci, cj, ck)
        this.playerChunkLoaded = !!pChunk

        // check for initial load completion (all queues empty for first time)
        if (!this._initialLoadComplete) {
            var pendingEmpty = this._chunksPending.isEmpty()
            var toMeshEmpty = this._chunksToMesh.isEmpty()
            var toMeshFirstEmpty = this._chunksToMeshFirst.isEmpty()
            var hasLoadedChunks = !this._chunksKnown.isEmpty()

            if (pendingEmpty && toMeshEmpty && toMeshFirstEmpty && hasLoadedChunks) {
                this._initialLoadComplete = true
                this.emit('initialLoadComplete')
            }
        }

        profile_queues_hook('end', this)
        profile_hook('end')
    }

    /** @internal */
    render() {
        // on render, quickly process the high-priority meshing queue
        // to help avoid flashes of background while neighboring chunks update
        var t = performance.now()
        var t1 = t + this.maxProcessingPerRender
        while (t < t1) {
            var done = this._queues.processMeshingQueue(true)
            if (done) break
            t = performance.now()
        }
    }

    /** Dispose world resources and cancel pending async operations */
    dispose() {
        // Cancel all pending async chunk requests
        this._chunkGen.cancelAllAsyncRequests()

        // Clear all queues
        this._chunksKnown.empty()
        this._chunksToRequest.empty()
        this._chunksInvalidated.empty()
        this._chunksToRemove.empty()
        this._chunksPending.empty()
        this._chunksToMesh.empty()
        this._chunksToMeshFirst.empty()
        this._chunksSortedLocs.empty()

        // Reset initial load state for potential reuse
        this._initialLoadComplete = false

        // Dispose all chunks
        var hash = this._storage.hash
        for (var key in hash) {
            var chunk = hash[key]
            if (chunk && typeof chunk.dispose === 'function') {
                chunk.dispose()
            }
            delete hash[key]
        }

        this.removeAllListeners()
        this.noa = null
    }
}
