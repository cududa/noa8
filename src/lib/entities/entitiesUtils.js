/**
 * Entity utilities - types, defaults, and hot-path helpers.
 * @module entities/entitiesUtils
 */


/**
 * Default options for the Entities module.
 * @typedef {object} EntitiesOptions
 * @property {number} [shadowDistance=10] - Distance for entity shadow rendering
 */

/** @type {EntitiesOptions} */
export var defaultOptions = {
    shadowDistance: 10,
}


/**
 * Cached array for entity world position hot paths.
 * Used by getWorldPositionCached - do not store references to this array.
 * @internal
 */
export var _cachedEntityWorldPos = [0, 0, 0]

/**
 * Separate cache for isInWorldBounds to avoid corrupting user's
 * getWorldPositionCached() result during bounds checking.
 * @internal
 */
export var _boundsCheckPos = [0, 0, 0]


/**
 * Compare two extent arrays for overlap.
 * Extents are [minX, minY, minZ, maxX, maxY, maxZ].
 *
 * @param {number[]} extA
 * @param {number[]} extB
 * @returns {boolean}
 */
export function extentsOverlap(extA, extB) {
    if (extA[0] > extB[3]) return false
    if (extA[1] > extB[4]) return false
    if (extA[2] > extB[5]) return false
    if (extA[3] < extB[0]) return false
    if (extA[4] < extB[1]) return false
    if (extA[5] < extB[2]) return false
    return true
}


/**
 * Safety helper for origin rebasing - nudges position away from voxel
 * boundaries so floating point error doesn't carry us across.
 *
 * @internal
 * @param {number[]} pos
 * @param {number} index
 * @param {number} dmin
 * @param {number} dmax
 * @param {number} id - Entity ID (unused, kept for debugging)
 */
export function nudgePosition(pos, index, dmin, dmax, id) {
    var min = pos[index] + dmin
    var max = pos[index] + dmax
    if (Math.abs(min - Math.round(min)) < 0.002) pos[index] += 0.002
    if (Math.abs(max - Math.round(max)) < 0.001) pos[index] -= 0.001
}
