/**
 * Core state and storage management class.
 */
export class WorldCore {
    /**
     * @param {import('./index.js').World} world
     * @param {import('./worldUtils.js').WorldOptions} opts
     */
    constructor(world: import("./index.js").World, opts: import("./worldUtils.js").WorldOptions);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
    /**
     * Get chunk by indexes from storage.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     * @returns {import('../chunk.js').Chunk|null}
     */
    getChunkByIndexes(i: number, j: number, k: number): import("../chunk.js").Chunk | null;
    /**
     * Store chunk by indexes.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     * @param {import('../chunk.js').Chunk} chunk
     */
    storeChunkByIndexes(i: number, j: number, k: number, chunk: import("../chunk.js").Chunk): void;
    /**
     * Remove chunk from storage by indexes.
     * @param {number} i
     * @param {number} j
     * @param {number} k
     */
    removeChunkByIndexes(i: number, j: number, k: number): void;
}
