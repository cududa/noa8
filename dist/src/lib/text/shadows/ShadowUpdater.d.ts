/**
 * Update all shadow positions for a frame.
 * @param {object} noa - noa engine reference
 * @param {import('./ShadowInstances').ShadowInstances} instances - Shadow instances
 * @returns {number[]} - List of text IDs to remove (disposed)
 */
export function updateShadows(noa: object, instances: import("./ShadowInstances").ShadowInstances): number[];
