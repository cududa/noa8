/**
 * Voxel/block access API for World module.
 * Handles getting and setting block data at world coordinates.
 * @module worldVoxels
 */
/**
 * Voxel access class providing block get/set operations.
 */
export class WorldVoxels {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world: import("./index.js").World);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
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
     * @param {{ base: number[], max: number[] }} box - AABB with base and max coordinates
     * @returns {boolean}
     */
    isBoxUnobstructed(box: {
        base: number[];
        max: number[];
    }): boolean;
}
