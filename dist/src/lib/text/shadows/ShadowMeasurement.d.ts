/**
 * Shadow measurement utilities.
 * Extracts dimensions from text mesh bounding box.
 */
/**
 * @typedef {object} MeshMetrics
 * @property {number} width - Shadow width
 * @property {number} depth - Shadow depth
 * @property {number} centerOffsetX - X offset from mesh origin to visual center
 * @property {number} centerOffsetZ - Z offset from mesh origin to visual center
 */
/**
 * Measure text mesh to get shadow dimensions.
 * @param {object} mesh - Babylon mesh
 * @returns {MeshMetrics}
 */
export function measureTextMesh(mesh: object): MeshMetrics;
export type MeshMetrics = {
    /**
     * - Shadow width
     */
    width: number;
    /**
     * - Shadow depth
     */
    depth: number;
    /**
     * - X offset from mesh origin to visual center
     */
    centerOffsetX: number;
    /**
     * - Z offset from mesh origin to visual center
     */
    centerOffsetZ: number;
};
