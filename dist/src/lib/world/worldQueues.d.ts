/**
 * Handles chunk queue management and processing.
 */
export class WorldQueues {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world: import("./index.js").World);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
    /** @internal */
    _removeCheckIndex: number;
    /** @internal */
    _meshCheckIndex: number;
    /**
     * Get chunk indexes of where the player is.
     * @returns {[number, number, number]}
     */
    getPlayerChunkIndexes(): [number, number, number];
    /**
     * Get chunk object by world coordinates.
     * @internal
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {import('../chunk.js').Chunk|null}
     */
    getChunkByCoords(x?: number, y?: number, z?: number): import("../chunk.js").Chunk | null;
    /**
     * Internal accessor for chunks to queue themselves for remeshing
     * after their data changes.
     * @param {import('../chunk.js').Chunk} chunk
     */
    queueChunkForRemesh(chunk: import("../chunk.js").Chunk): void;
    /**
     * Gradually scan neighborhood chunk locs; add missing ones to "toRequest".
     * @param {number} ci - Player chunk X index
     * @param {number} cj - Player chunk Y index
     * @param {number} ck - Player chunk Z index
     */
    findChunksToRequest(ci: number, cj: number, ck: number): void;
    /**
     * Helpers for checking whether to add a location, and reflections of it.
     * @param {number} ci
     * @param {number} cj
     * @param {number} ck
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    _checkReflectedLocations(ci: number, cj: number, ck: number, i: number, j: number, k: number): void;
    /**
     * Finally, the logic for each reflected location checked.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    _checkOneLocation(i: number, j: number, k: number): void;
    /**
     * Incrementally scan known chunks for any that are no longer in range.
     * Assume that the order they're removed in isn't very important.
     * @param {number} ci - Player chunk X index
     * @param {number} cj - Player chunk Y index
     * @param {number} ck - Player chunk Z index
     */
    findDistantChunksToRemove(ci: number, cj: number, ck: number): void;
    /**
     * Incrementally look for chunks that could be re-meshed.
     */
    findChunksToMesh(): void;
    /**
     * Invalidate chunks overlapping the given AABB.
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateChunksInBox(box: {
        base: number[];
        max: number[];
    }): void;
    /**
     * When current world changes - empty work queues and mark all for removal.
     */
    markAllChunksInvalid(): void;
    /**
     * Run through chunk tracking queues looking for work to do next.
     * @returns {boolean} - True if queue is empty
     */
    processRequestQueue(): boolean;
    /**
     * Process the remove queue.
     * @returns {boolean} - True if queue is empty
     */
    processRemoveQueue(): boolean;
    /**
     * Process chunks waiting to be meshed.
     * @param {boolean} firstOnly - Only process high-priority queue
     * @returns {boolean} - True if done (for breaking out of processing loop)
     */
    processMeshingQueue(firstOnly: boolean): boolean;
    /**
     * Check if chunk should be queued for meshing and queue if so.
     * @param {import('../chunk.js').Chunk} chunk
     * @returns {boolean} - True if chunk was queued
     */
    possiblyQueueChunkForMeshing(chunk: import("../chunk.js").Chunk): boolean;
}
