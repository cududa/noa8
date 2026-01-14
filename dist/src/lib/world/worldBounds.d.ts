/**
 * Chunk loading distance and world bounds configuration.
 * @module worldBounds
 */
/**
 * World bounds configuration object
 * @typedef {object} WorldBoundsConfig
 * @property {number} minX - Minimum chunk X index (inclusive)
 * @property {number} maxX - Maximum chunk X index (inclusive)
 * @property {number} minY - Minimum chunk Y index (inclusive)
 * @property {number} maxY - Maximum chunk Y index (inclusive)
 * @property {number} minZ - Minimum chunk Z index (inclusive)
 * @property {number} maxZ - Maximum chunk Z index (inclusive)
 */
/**
 * Distance test function type
 * @typedef {function(number, number, number): boolean} DistanceTestFn
 */
/**
 * Baked world loader interface
 * @typedef {object} BakedWorldLoader
 * @property {function(): {minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, chunkSize?: number}} getWorldBounds
 */
/**
 * Makes a function to check if an (i,j,k) is within a sphere/ellipse of given size.
 * @param {number} xsize - Horizontal radius
 * @param {number} ysize - Vertical radius
 * @returns {DistanceTestFn}
 */
export function makeDistanceTestFunction(xsize: number, ysize: number): DistanceTestFn;
/**
 * Handles chunk loading distance configuration and world bounds.
 */
export class WorldBounds {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world: import("./index.js").World);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
    /**
     * Sets the distances within which to load new chunks, and beyond which
     * to unload them. Generally you want the remove distance to be somewhat
     * farther, so that moving back and forth across the same chunk border doesn't
     * keep loading/unloading the same distant chunks.
     *
     * Both arguments can be numbers (number of voxels), or arrays like:
     * `[horiz, vert]` specifying different horizontal and vertical distances.
     * @param {number | number[]} [addDist=2]
     * @param {number | number[]} [remDist=3]
     */
    setAddRemoveDistance(addDist?: number | number[], remDist?: number | number[]): void;
    /**
     * Set finite world bounds in chunk indices. Chunks outside these bounds will not be
     * loaded or generated, creating a bounded world. Set to null to return to infinite world.
     *
     * @param {number|null|undefined} minX - Minimum chunk X index (inclusive), or null/undefined to clear
     * @param {number} [maxX] - Maximum chunk X index (inclusive)
     * @param {number} [minY] - Minimum chunk Y index (inclusive)
     * @param {number} [maxY] - Maximum chunk Y index (inclusive)
     * @param {number} [minZ] - Minimum chunk Z index (inclusive)
     * @param {number} [maxZ] - Maximum chunk Z index (inclusive)
     * @example
     * ```js
     * // Set world bounds to a 10x5x10 chunk region centered at origin
     * noa.world.setWorldBounds(-5, 4, -2, 2, -5, 4)
     * // Clear bounds for infinite world
     * noa.world.setWorldBounds(null)
     * ```
     */
    setWorldBounds(minX: number | null | undefined, maxX?: number, minY?: number, maxY?: number, minZ?: number, maxZ?: number): void;
    /**
     * Automatically configure chunk load/unload distances based on a baked world's bounds
     * and the player's spawn position. This ensures all chunks within the baked area
     * are loadable from the spawn point, avoiding procedural generation overhead
     * and reducing memory usage.
     *
     * @param {BakedWorldLoader} loader - A loaded BakedWorldLoader instance
     * @param {[number, number, number]} [spawnPosition] - Player spawn position in world coordinates
     * @param {object} [options] - Optional configuration
     * @param {number} [options.buffer=1] - Extra chunks to load beyond minimum required
     * @example
     * ```js
     * const loader = new BakedWorldLoader()
     * await loader.loadFromURL('/world.noaworld')
     * // Configure based on spawn position with extra buffer for smoother loading
     * noa.world.setAddRemoveDistanceFromBakedWorld(loader, [15, 5, 0], { buffer: 2 })
     * ```
     */
    setAddRemoveDistanceFromBakedWorld(loader: BakedWorldLoader, spawnPosition?: [number, number, number], options?: {
        buffer?: number;
    }): void;
    /**
     * Check if chunk indices are within world bounds.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     * @returns {boolean}
     */
    isInWorldBounds(i: number, j: number, k: number): boolean;
}
/**
 * World bounds configuration object
 */
export type WorldBoundsConfig = {
    /**
     * - Minimum chunk X index (inclusive)
     */
    minX: number;
    /**
     * - Maximum chunk X index (inclusive)
     */
    maxX: number;
    /**
     * - Minimum chunk Y index (inclusive)
     */
    minY: number;
    /**
     * - Maximum chunk Y index (inclusive)
     */
    maxY: number;
    /**
     * - Minimum chunk Z index (inclusive)
     */
    minZ: number;
    /**
     * - Maximum chunk Z index (inclusive)
     */
    maxZ: number;
};
/**
 * Distance test function type
 */
export type DistanceTestFn = (arg0: number, arg1: number, arg2: number) => boolean;
/**
 * Baked world loader interface
 */
export type BakedWorldLoader = {
    getWorldBounds: () => {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        minZ: number;
        maxZ: number;
        chunkSize?: number;
    };
};
