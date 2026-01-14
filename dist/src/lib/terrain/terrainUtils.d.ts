/**
 * Metadata flag used to identify terrain meshes
 * @type {string}
 */
export const terrainMeshFlag: string;
/**
 * Reusable coordinate array to avoid allocations in hot paths
 * @type {number[]}
 */
export const tempCoordArray: number[];
/**
 * Profiling hook - enabled when PROFILE_EVERY > 0
 * @type {function(string): void}
 */
export const profile_hook: (arg0: string) => void;
