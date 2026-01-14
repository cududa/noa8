/**
 * Sorts a queue DESCENDING by distance from player position, unless reversed.
 * @param {import('./index.js').World} world
 * @param {import('../util.js').LocationQueue} queue
 * @param {number} [pi] - Player chunk i index (defaults to current position)
 * @param {number} [pj] - Player chunk j index
 * @param {number} [pk] - Player chunk k index
 * @param {boolean} [reverse=false] - Sort ascending instead of descending
 */
export function sortQueueByDistanceFrom(world: import("./index.js").World, queue: import("../util.js").LocationQueue, pi?: number, pj?: number, pk?: number, reverse?: boolean): void;
/**
 * Utility functions and default options for World module.
 * @module worldUtils
 */
/**
 * @typedef {object} WorldOptions
 * @property {number} [chunkSize=24]
 * @property {number|[number,number]} [chunkAddDistance=[2,2]] - [horizontal, vertical] or single number
 * @property {number|[number,number]} [chunkRemoveDistance=[3,3]] - [horizontal, vertical] or single number
 * @property {boolean} [worldGenWhilePaused=false]
 * @property {boolean} [manuallyControlChunkLoading=false]
 */
/** @type {WorldOptions} */
export const defaultOptions: WorldOptions;
/**
 * Chunk sorting distance function type
 * @typedef {function(number, number, number): number} ChunkSortingDistFn
 */
/**
 * Default distance function for chunk sorting - squared Euclidean distance
 * @type {ChunkSortingDistFn}
 */
export const defaultSortDistance: ChunkSortingDistFn;
export type WorldOptions = {
    chunkSize?: number;
    /**
     * - [horizontal, vertical] or single number
     */
    chunkAddDistance?: number | [number, number];
    /**
     * - [horizontal, vertical] or single number
     */
    chunkRemoveDistance?: number | [number, number];
    worldGenWhilePaused?: boolean;
    manuallyControlChunkLoading?: boolean;
};
/**
 * Chunk sorting distance function type
 */
export type ChunkSortingDistFn = (arg0: number, arg1: number, arg2: number) => number;
