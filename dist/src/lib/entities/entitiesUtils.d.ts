/**
 * Compare two extent arrays for overlap.
 * Extents are [minX, minY, minZ, maxX, maxY, maxZ].
 *
 * @param {number[]} extA
 * @param {number[]} extB
 * @returns {boolean}
 */
export function extentsOverlap(extA: number[], extB: number[]): boolean;
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
export function nudgePosition(pos: number[], index: number, dmin: number, dmax: number, id: number): void;
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
export const defaultOptions: EntitiesOptions;
/**
 * Cached array for entity world position hot paths.
 * Used by getWorldPositionCached - do not store references to this array.
 * @internal
 */
export const _cachedEntityWorldPos: number[];
/**
 * Separate cache for isInWorldBounds to avoid corrupting user's
 * getWorldPositionCached() result during bounds checking.
 * @internal
 */
export const _boundsCheckPos: number[];
/**
 * Default options for the Entities module.
 */
export type EntitiesOptions = {
    /**
     * - Distance for entity shadow rendering
     */
    shadowDistance?: number;
};
