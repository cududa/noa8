import * as vec3 from 'gl-vec3'

/**
 * Per-frame shadow update logic.
 * Handles raycasting and shadow positioning.
 */

var down = vec3.fromValues(0, -1, 0)

/**
 * Update all shadow positions for a frame.
 * @param {object} noa - noa engine reference
 * @param {import('./ShadowInstances').ShadowInstances} instances - Shadow instances
 * @returns {number[]} - List of text IDs to remove (disposed)
 */
export function updateShadows(noa, instances) {
    var toRemove = []

    for (var [id, data] of instances.entries()) {
        var textMesh = data.textHandle.mesh
        if (!textMesh || data.textHandle._disposed) {
            toRemove.push(id)
            continue
        }

        // Use mesh.position (properly rebased) + stored center offset
        // This avoids centerWorld which has timing issues after rebase
        var pos = textMesh.position
        var localX = pos.x + data.centerOffsetX
        var localY = pos.y
        var localZ = pos.z + data.centerOffsetZ

        // Raycast down to find ground
        var pickPos = [localX, localY, localZ]
        var result = noa._localPick(pickPos, down, data.opts.maxDistance)

        if (!result) {
            data.shadow.setEnabled(false)
            continue
        }

        // Convert ground Y from world to local
        var localGroundY = result.position[1] - noa.worldOriginOffset[1]
        var height = localY - localGroundY

        // Fade out when too high
        var heightFade = 1 - Math.min(height / data.opts.maxDistance, 1)
        if (heightFade < 0.05) {
            data.shadow.setEnabled(false)
            continue
        }

        // Position and scale shadow
        var blur = data.opts.blur
        var scaleFactor = 0.75 + heightFade * 0.25

        data.shadow.position.x = localX
        data.shadow.position.y = localGroundY + 0.02 + blur * 0.01
        data.shadow.position.z = localZ

        data.shadow.scaling.x = data.width * (0.9 + blur * 0.6) * scaleFactor
        data.shadow.scaling.z = data.depth * (0.5 + blur * 0.5) * scaleFactor
        data.shadow.setEnabled(true)
    }

    return toRemove
}
