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
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world
    }

    /**
     * Get the block ID at the given world coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {number}
     */
    getBlockID(x = 0, y = 0, z = 0) {
        var world = this.world
        var [ci, cj, ck] = world._coordsToChunkIndexes(x, y, z)
        var chunk = world._storage.getChunkByIndexes(ci, cj, ck)
        if (!chunk) return 0
        var [i, j, k] = world._coordsToChunkLocals(x, y, z)
        return chunk.voxels.get(i, j, k)
    }

    /**
     * Get whether the block at the given coordinates is solid.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockSolidity(x = 0, y = 0, z = 0) {
        var world = this.world
        var [ci, cj, ck] = world._coordsToChunkIndexes(x, y, z)
        var chunk = world._storage.getChunkByIndexes(ci, cj, ck)
        if (!chunk) return false
        var [i, j, k] = world._coordsToChunkLocals(x, y, z)
        return !!chunk.getSolidityAt(i, j, k)
    }

    /**
     * Get the opacity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockOpacity(x = 0, y = 0, z = 0) {
        var id = this.getBlockID(x, y, z)
        return this.world.noa.registry.getBlockOpacity(id)
    }

    /**
     * Get the fluidity of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {boolean}
     */
    getBlockFluidity(x = 0, y = 0, z = 0) {
        var id = this.getBlockID(x, y, z)
        return this.world.noa.registry.getBlockFluidity(id)
    }

    /**
     * Get the properties object of the block at the given coordinates.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     * @returns {object}
     */
    getBlockProperties(x = 0, y = 0, z = 0) {
        var id = this.getBlockID(x, y, z)
        return this.world.noa.registry.getBlockProps(id)
    }

    /**
     * Set the block ID at the given world coordinates.
     * @param {number} [id=0]
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setBlockID(id = 0, x = 0, y = 0, z = 0) {
        var world = this.world
        var [ci, cj, ck] = world._coordsToChunkIndexes(x, y, z)
        var chunk = world._storage.getChunkByIndexes(ci, cj, ck)
        if (!chunk) return
        var [i, j, k] = world._coordsToChunkLocals(x, y, z)
        return chunk.set(i, j, k, id)
    }

    /**
     * Check if the given AABB is unobstructed (no solid blocks).
     * @param {{ base: number[], max: number[] }} box - AABB with base and max coordinates
     * @returns {boolean}
     */
    isBoxUnobstructed(box) {
        var base = box.base
        var max = box.max
        for (var i = Math.floor(base[0]); i < max[0] + 1; i++) {
            for (var j = Math.floor(base[1]); j < max[1] + 1; j++) {
                for (var k = Math.floor(base[2]); k < max[2] + 1; k++) {
                    if (this.getBlockSolidity(i, j, k)) return false
                }
            }
        }
        return true
    }
}
