/**
 * Coordinate conversion utilities for chunk/local coordinate transforms.
 * Provides factory functions that return optimized converters based on chunk size.
 * @module worldCoords
 */

/**
 * Coordinate converter function type - converts world coords to chunk indices
 * @typedef {function(number, number, number): [number, number, number]} CoordsToChunkIndexesFn
 */

/**
 * Coordinate converter function type - converts world coords to local chunk coords
 * @typedef {function(number, number, number): [number, number, number]} CoordsToChunkLocalsFn
 */


/**
 * Creates a function to convert world coordinates to chunk indices.
 * Returns an optimized bit-shifting version when chunk size is a power of two.
 *
 * @param {number} chunkSize - Size of chunks in each dimension
 * @returns {CoordsToChunkIndexesFn}
 */
export function createCoordsToChunkIndexes(chunkSize) {
    var powerOfTwo = ((chunkSize & chunkSize - 1) === 0)
    if (powerOfTwo) {
        var shift = Math.log2(chunkSize) | 0
        return function chunkCoordsToIndexesPowerOfTwo(x, y, z) {
            return [(x >> shift) | 0, (y >> shift) | 0, (z >> shift) | 0]
        }
    }
    var cs = chunkSize
    return function chunkCoordsToIndexesGeneral(x, y, z) {
        return [Math.floor(x / cs) | 0, Math.floor(y / cs) | 0, Math.floor(z / cs) | 0]
    }
}


/**
 * Creates a function to convert world coordinates to local chunk coordinates.
 * Returns an optimized bit-masking version when chunk size is a power of two.
 *
 * @param {number} chunkSize - Size of chunks in each dimension
 * @returns {CoordsToChunkLocalsFn}
 */
export function createCoordsToChunkLocals(chunkSize) {
    var powerOfTwo = ((chunkSize & chunkSize - 1) === 0)
    if (powerOfTwo) {
        var mask = (chunkSize - 1) | 0
        return function chunkCoordsToLocalsPowerOfTwo(x, y, z) {
            return [(x & mask) | 0, (y & mask) | 0, (z & mask) | 0]
        }
    }
    var cs = chunkSize
    return function chunkCoordsToLocalsGeneral(x, y, z) {
        var i = (x % cs) | 0; if (i < 0) i += cs
        var j = (y % cs) | 0; if (j < 0) j += cs
        var k = (z % cs) | 0; if (k < 0) k += cs
        return [i, j, k]
    }
}
