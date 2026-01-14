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
export function makeDistanceTestFunction(xsize, ysize) {
    var asq = xsize * xsize
    var bsq = ysize * ysize
    // spherical case
    if (xsize === ysize) return (i, j, k) => (i * i + j * j + k * k <= asq)
    // otherwise do clipped spheres for now
    if (xsize > ysize) return (i, j, k) => {
        if (Math.abs(j) > ysize) return false
        return (i * i + j * j + k * k <= asq)
    }
    return (i, j, k) => {
        var dxsq = i * i + k * k
        if (dxsq > asq) return false
        return (dxsq + j * j <= bsq)
    }
}


/**
 * Handles chunk loading distance configuration and world bounds.
 */
export class WorldBounds {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world
    }

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
    setAddRemoveDistance(addDist = 2, remDist = 3) {
        var world = this.world
        var addArr = Array.isArray(addDist) ? addDist : [addDist, addDist]
        var remArr = Array.isArray(remDist) ? remDist : [remDist, remDist]
        var minGap = 1
        if (remArr[0] < addArr[0] + minGap) remArr[0] = addArr[0] + minGap
        if (remArr[1] < addArr[1] + minGap) remArr[1] = addArr[1] + minGap
        world._chunkAddDistance = addArr
        world._chunkRemoveDistance = remArr
        // rebuild chunk distance functions and add search locations
        world._addDistanceFn = makeDistanceTestFunction(addArr[0], addArr[1])
        world._remDistanceFn = makeDistanceTestFunction(remArr[0], remArr[1])
        world._chunksSortedLocs.empty()
        // this queue holds only 1/16th the search space: i=0..max, j=0..i, k=0..max
        for (var i = 0; i <= addArr[0]; i++) {
            for (var k = 0; k <= i; k++) {
                for (var j = 0; j <= addArr[1]; j++) {
                    if (!world._addDistanceFn(i, j, k)) continue
                    world._chunksSortedLocs.add(i, j, k)
                }
            }
        }
        // resets state of nearby chunk search
        world._prevSortingFn = null
        world._chunkAddSearchFrom = 0
    }

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
    setWorldBounds(minX, maxX, minY, maxY, minZ, maxZ) {
        var world = this.world
        if (minX === null || minX === undefined) {
            world._worldBounds = null
            console.log('[noa] World bounds cleared - infinite world enabled')
            return
        }
        world._worldBounds = { minX, maxX, minY, maxY, minZ, maxZ }
        console.log('[noa] World bounds set: ' +
            'X=[' + minX + ',' + maxX + '], ' +
            'Y=[' + minY + ',' + maxY + '], ' +
            'Z=[' + minZ + ',' + maxZ + ']')
    }

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
    setAddRemoveDistanceFromBakedWorld(loader, spawnPosition, options) {
        var world = this.world
        if (!loader || typeof loader.getWorldBounds !== 'function') {
            console.warn('[noa] Invalid loader passed to setAddRemoveDistanceFromBakedWorld')
            return
        }

        var bounds = loader.getWorldBounds()

        // Validate bounds object
        if (!bounds ||
            typeof bounds.minX !== 'number' || typeof bounds.maxX !== 'number' ||
            typeof bounds.minY !== 'number' || typeof bounds.maxY !== 'number' ||
            typeof bounds.minZ !== 'number' || typeof bounds.maxZ !== 'number') {
            console.warn('[noa] Invalid bounds returned from loader.getWorldBounds()')
            return
        }

        var chunkSize = bounds.chunkSize || world._chunkSize
        var buffer = (options && typeof options.buffer === 'number') ? options.buffer : 1

        // Default spawn to origin if not provided
        var spawnX = (spawnPosition && spawnPosition[0]) || 0
        var spawnY = (spawnPosition && spawnPosition[1]) || 0
        var spawnZ = (spawnPosition && spawnPosition[2]) || 0

        // Convert spawn position to chunk indices
        var spawnChunkX = Math.floor(spawnX / chunkSize)
        var spawnChunkY = Math.floor(spawnY / chunkSize)
        var spawnChunkZ = Math.floor(spawnZ / chunkSize)

        // Calculate distance from spawn chunk to each bound of the baked world
        var distToMinX = Math.abs(spawnChunkX - bounds.minX)
        var distToMaxX = Math.abs(spawnChunkX - bounds.maxX)
        var distToMinZ = Math.abs(spawnChunkZ - bounds.minZ)
        var distToMaxZ = Math.abs(spawnChunkZ - bounds.maxZ)
        var distToMinY = Math.abs(spawnChunkY - bounds.minY)
        var distToMaxY = Math.abs(spawnChunkY - bounds.maxY)

        // Calculate diagonal distance to corners (spherical loading needs radius to cover rectangular bounds)
        // Using sqrt(maxX² + maxZ²) ensures the loading sphere encompasses all corners of the world
        var maxDistX = Math.max(distToMinX, distToMaxX)
        var maxDistZ = Math.max(distToMinZ, distToMaxZ)
        var maxHoriz = Math.ceil(Math.sqrt(maxDistX * maxDistX + maxDistZ * maxDistZ))
        var maxVert = Math.max(distToMinY, distToMaxY)

        // Add buffer for smoother chunk loading when player moves around
        maxHoriz = maxHoriz + buffer
        maxVert = maxVert + buffer

        // Ensure minimum distance of 1 chunk to always load something
        maxHoriz = Math.max(1, maxHoriz)
        maxVert = Math.max(1, maxVert)

        // Warn if distances are unusually large (potential memory issue)
        if (maxHoriz > 20 || maxVert > 10) {
            console.warn('[noa] Large chunk distances configured (add=[' + maxHoriz + ',' + maxVert + ']). ' +
                'This may use significant memory. Consider spawning closer to center of baked world.')
        }

        // Set distances with +1 buffer for remove distance (hysteresis)
        this.setAddRemoveDistance([maxHoriz, maxVert], [maxHoriz + 1, maxVert + 1])

        console.log('[noa] Auto-configured chunk distances from baked world: ' +
            'spawn chunk=[' + spawnChunkX + ',' + spawnChunkY + ',' + spawnChunkZ + '], ' +
            'add=[' + maxHoriz + ',' + maxVert + '], ' +
            'remove=[' + (maxHoriz + 1) + ',' + (maxVert + 1) + ']')
    }

    /**
     * Check if chunk indices are within world bounds.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     * @returns {boolean}
     */
    isInWorldBounds(i, j, k) {
        var bounds = this.world._worldBounds
        if (!bounds) return true
        return (i >= bounds.minX && i <= bounds.maxX &&
                j >= bounds.minY && j <= bounds.maxY &&
                k >= bounds.minZ && k <= bounds.maxZ)
    }
}
