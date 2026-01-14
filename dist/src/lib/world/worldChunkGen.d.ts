/**
 * Result from async chunk generator
 * @typedef {object} ChunkGeneratorResult
 * @property {*} voxelData - ndarray of voxel data
 * @property {*} [userData] - optional user data attached to chunk
 * @property {number} [fillVoxelID] - optional fill ID for uniform chunks
 */
/**
 * Async chunk generator function signature
 * @callback ChunkGeneratorFunction
 * @param {number} x - Chunk world x coordinate
 * @param {number} y - Chunk world y coordinate
 * @param {number} z - Chunk world z coordinate
 * @param {number} requestID - Unique request identifier
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<ChunkGeneratorResult|null>} Generated chunk data or null
 */
/**
 * Handles async chunk generator registration and execution.
 */
export class WorldChunkGen {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world: import("./index.js").World);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
    /** @type {ChunkGeneratorFunction|null} */
    _asyncChunkGenerator: ChunkGeneratorFunction | null;
    /** @type {Map<string, AbortController>} requestID -> AbortController */
    _asyncChunkAbortControllers: Map<string, AbortController>;
    /** @type {Map<string, Promise<void>>} requestID -> Promise */
    _asyncChunkPromises: Map<string, Promise<void>>;
    /**
     * Whether an async generator is registered.
     * @returns {boolean}
     */
    hasAsyncGenerator(): boolean;
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
    registerChunkGenerator(generatorFn: ChunkGeneratorFunction): void;
    /**
     * Handle async chunk generation for a specific request.
     * @param {string} requestID
     * @param {number} x - World X coordinate of chunk origin
     * @param {number} y - World Y coordinate of chunk origin
     * @param {number} z - World Z coordinate of chunk origin
     * @param {string} worldName - Current world name for validation
     */
    requestNewChunkAsync(requestID: string, x: number, y: number, z: number, worldName: string): void;
    /**
     * Cancel an async chunk request by ID.
     * @param {string} requestID
     */
    cancelAsyncRequest(requestID: string): void;
    /**
     * Cancel all pending async chunk requests.
     */
    cancelAllAsyncRequests(): void;
}
/**
 * Result from async chunk generator
 */
export type ChunkGeneratorResult = {
    /**
     * - ndarray of voxel data
     */
    voxelData: any;
    /**
     * - optional user data attached to chunk
     */
    userData?: any;
    /**
     * - optional fill ID for uniform chunks
     */
    fillVoxelID?: number;
};
/**
 * Async chunk generator function signature
 */
export type ChunkGeneratorFunction = (x: number, y: number, z: number, requestID: number, signal: AbortSignal) => Promise<ChunkGeneratorResult | null>;
