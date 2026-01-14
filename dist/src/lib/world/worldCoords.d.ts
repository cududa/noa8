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
export function createCoordsToChunkIndexes(chunkSize: number): CoordsToChunkIndexesFn;
/**
 * Creates a function to convert world coordinates to local chunk coordinates.
 * Returns an optimized bit-masking version when chunk size is a power of two.
 *
 * @param {number} chunkSize - Size of chunks in each dimension
 * @returns {CoordsToChunkLocalsFn}
 */
export function createCoordsToChunkLocals(chunkSize: number): CoordsToChunkLocalsFn;
/**
 * Coordinate converter function type - converts world coords to chunk indices
 */
export type CoordsToChunkIndexesFn = (arg0: number, arg1: number, arg2: number) => [number, number, number];
/**
 * Coordinate converter function type - converts world coords to local chunk coords
 */
export type CoordsToChunkLocalsFn = (arg0: number, arg1: number, arg2: number) => [number, number, number];
