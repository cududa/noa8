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
    constructor(noa: import("../../index.js").Engine, opts: import("./worldUtils.js").WorldOptions);
    /** @internal */
    noa: import("../../index.js").Engine;
    /** @internal */
    playerChunkLoaded: boolean;
    /**
     * Whether the initial chunk load has completed.
     * Becomes true when all initially requested chunks are loaded and meshed.
     * @type {boolean}
     */
    _initialLoadComplete: boolean;
    /** @internal */
    Chunk: typeof Chunk;
    /**
     * Game clients should set this if they need to manually control
     * which chunks to load and unload. When set, client should call
     * `noa.world.manuallyLoadChunk` / `manuallyUnloadChunk` as needed.
     */
    manuallyControlChunkLoading: boolean;
    /**
     * Defining this function sets a custom order in which to create chunks.
     * The function should look like:
     * ```js
     *   (i, j, k) => 1 // return a smaller number for chunks to process first
     * ```
     * @type {import('./worldUtils.js').ChunkSortingDistFn|null}
     */
    chunkSortingDistFn: import("./worldUtils.js").ChunkSortingDistFn | null;
    /**
     * Set this higher to cause chunks not to mesh until they have some neighbors.
     * Max legal value is 26 (each chunk will mesh only when all neighbors are present)
     */
    minNeighborsToMesh: number;
    /** When true, worldgen queues will keep running if engine is paused. */
    worldGenWhilePaused: boolean;
    /** Limit the size of internal chunk processing queues
     * @type {number}
     */
    maxChunksPendingCreation: number;
    /** Limit the size of internal chunk processing queues
     * @type {number}
     */
    maxChunksPendingMeshing: number;
    /** Cutoff (in ms) of time spent each **tick**
     * @type {number}
     */
    maxProcessingPerTick: number;
    /** Cutoff (in ms) of time spent each **render**
     * @type {number}
     */
    maxProcessingPerRender: number;
    /** @internal */
    _chunkSize: number;
    /** @internal */
    _chunkAddDistance: number[];
    /** @internal */
    _chunkRemoveDistance: number[];
    /** @internal */
    _addDistanceFn: any;
    /** @internal */
    _remDistanceFn: any;
    /** @internal */
    _prevWorldName: string;
    /** @internal */
    _prevPlayerChunkHash: number;
    /** @internal */
    _chunkAddSearchFrom: number;
    /** @internal */
    _prevSortingFn: any;
    /** @internal */
    _sortMeshQueueEvery: number;
    /** @internal World bounds in chunk indices - null means infinite world
     * @type {import('./worldBounds.js').WorldBoundsConfig|null} */
    _worldBounds: import("./worldBounds.js").WorldBoundsConfig | null;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksKnown: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksToRequest: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksInvalidated: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksToRemove: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksPending: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksToMesh: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksToMeshFirst: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').LocationQueue} */
    _chunksSortedLocs: import("../util.js").LocationQueue;
    /** @internal @type {import('../util.js').ChunkStorage} */
    _storage: import("../util.js").ChunkStorage;
    /** @internal @type {function(number, number, number): [number, number, number]} */
    _coordsToChunkIndexes: (arg0: number, arg1: number, arg2: number) => [number, number, number];
    /** @internal @type {function(number, number, number): [number, number, number]} */
    _coordsToChunkLocals: (arg0: number, arg1: number, arg2: number) => [number, number, number];
    /** @internal @type {number} - bit shift for power-of-two chunk sizes */
    _coordShiftBits: number;
    /** @internal @type {number} - bit mask for power-of-two chunk sizes */
    _coordMask: number;
    /** @internal */
    _core: WorldCore;
    /** @internal */
    _voxels: WorldVoxels;
    /** @internal */
    _chunkGen: WorldChunkGen;
    /** @internal */
    _bounds: WorldBounds;
    /** @internal */
    _queues: WorldQueues;
    /** @internal */
    _lifecycle: WorldLifecycle;
    /** @internal */
    _debug: WorldDebug;
    /**
     * Get the block ID at the given world coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {number}
     */
    getBlockID(x?: number, y?: number, z?: number): number;
    /**
     * Get whether the block at the given coordinates is solid.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockSolidity(x?: number, y?: number, z?: number): boolean;
    /**
     * Get the opacity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockOpacity(x?: number, y?: number, z?: number): boolean;
    /**
     * Get the fluidity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockFluidity(x?: number, y?: number, z?: number): boolean;
    /**
     * Get the properties object of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {object}
     */
    getBlockProperties(x?: number, y?: number, z?: number): object;
    /**
     * Set the block ID at the given world coordinates.
     * @param {number} [id=0]
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setBlockID(id?: number, x?: number, y?: number, z?: number): void;
    /**
     * Check if the given AABB is unobstructed (no solid blocks).
     * @param {{ base: number[], max: number[] }} box
     * @returns {boolean}
     */
    isBoxUnobstructed(box: {
        base: number[];
        max: number[];
    }): boolean;
    /**
     * Register an async chunk generator function.
     * @param {import('./worldChunkGen.js').ChunkGeneratorFunction} generatorFn
     */
    registerChunkGenerator(generatorFn: import("./worldChunkGen.js").ChunkGeneratorFunction): void;
    /**
     * Sets the distances within which to load new chunks, and beyond which to unload them.
     * @param {number | number[]} [addDist=2]
     * @param {number | number[]} [remDist=3]
     */
    setAddRemoveDistance(addDist?: number | number[], remDist?: number | number[]): void;
    /**
     * Set finite world bounds in chunk indices.
     * @param {number|null|undefined} minX
     * @param {number} [maxX]
     * @param {number} [minY]
     * @param {number} [maxY]
     * @param {number} [minZ]
     * @param {number} [maxZ]
     */
    setWorldBounds(minX: number | null | undefined, maxX?: number, minY?: number, maxY?: number, minZ?: number, maxZ?: number): void;
    /**
     * Automatically configure chunk load/unload distances based on a baked world's bounds.
     * @param {import('./worldBounds.js').BakedWorldLoader} loader
     * @param {[number, number, number]} [spawnPosition]
     * @param {object} [options]
     */
    setAddRemoveDistanceFromBakedWorld(loader: import("./worldBounds.js").BakedWorldLoader, spawnPosition?: [number, number, number], options?: object): void;
    /**
     * Tells noa to discard voxel data within a given AABB.
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateVoxelsInAABB(box: {
        base: number[];
        max: number[];
    }): void;
    /**
     * When manually controlling chunk loading, request a chunk to be loaded.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyLoadChunk(x?: number, y?: number, z?: number): void;
    /**
     * When manually controlling chunk loading, request a chunk to be unloaded.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyUnloadChunk(x?: number, y?: number, z?: number): void;
    /**
     * Clients should call this after creating a chunk's worth of data.
     * @param {string} id
     * @param {*} array
     * @param {*} [userData=null]
     * @param {number} [fillVoxelID=-1]
     */
    setChunkData(id: string, array: any, userData?: any, fillVoxelID?: number): void;
    /**
     * Returns whether the initial chunk load has completed.
     * @returns {boolean}
     */
    isInitialLoadComplete(): boolean;
    /**
     * @internal
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {import('../chunk.js').Chunk|null}
     */
    _getChunkByCoords(x?: number, y?: number, z?: number): import("../chunk.js").Chunk | null;
    /**
     * @internal
     * @param {import('../chunk.js').Chunk} chunk
     */
    _queueChunkForRemesh(chunk: import("../chunk.js").Chunk): void;
    /** @internal */
    report(): void;
    /** @internal */
    tick(): void;
    /** @internal */
    render(): void;
    /** Dispose world resources and cancel pending async operations */
    dispose(): void;
}
import EventEmitter from 'events';
import { Chunk } from '../chunk.js';
import { WorldCore } from './worldCore.js';
import { WorldVoxels } from './worldVoxels.js';
import { WorldChunkGen } from './worldChunkGen.js';
import { WorldBounds } from './worldBounds.js';
import { WorldQueues } from './worldQueues.js';
import { WorldLifecycle } from './worldLifecycle.js';
import { WorldDebug } from './worldDebug.js';
