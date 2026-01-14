import { makeProfileHook } from '../util.js'

/**
 * Utility functions and shared types for terrain meshing module.
 * @module terrain/terrainUtils
 */

/** Enable for profiling - set to number of samples between reports */
var PROFILE_EVERY = 0

/**
 * Metadata flag used to identify terrain meshes
 * @type {string}
 */
export var terrainMeshFlag = 'noa_chunk_terrain_mesh'

/**
 * Reusable coordinate array to avoid allocations in hot paths
 * @type {number[]}
 */
export var tempCoordArray = [0, 0, 0]

/**
 * Profiling hook - enabled when PROFILE_EVERY > 0
 * @type {function(string): void}
 */
export var profile_hook = (PROFILE_EVERY)
    ? makeProfileHook(PROFILE_EVERY, 'Meshing')
    : () => { }
