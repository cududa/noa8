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
export function measureTextMesh(mesh) {
    var width = 1
    var depth = 0.3
    var centerOffsetX = 0
    var centerOffsetZ = 0

    mesh.computeWorldMatrix(true)
    mesh.refreshBoundingInfo()
    var boundingInfo = mesh.getBoundingInfo()
    if (boundingInfo && boundingInfo.boundingBox) {
        var bb = boundingInfo.boundingBox
        width = Math.max(0.5, bb.extendSize.x * 2)
        depth = Math.max(0.2, bb.extendSize.z * 2, width * 0.15)

        // Compute offset from mesh origin to visual center in SCENE coords
        // This is constant and doesn't change with rebase
        centerOffsetX = bb.centerWorld.x - mesh.position.x
        centerOffsetZ = bb.centerWorld.z - mesh.position.z
    }

    return { width, depth, centerOffsetX, centerOffsetZ }
}
