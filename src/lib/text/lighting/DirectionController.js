import { Vector3, Quaternion } from '../../babylonExports.js'

/**
 * Camera-relative direction calculations for text lighting.
 * Handles azimuth/elevation rotation math with reusable vectors.
 */

var DEG_TO_RAD = Math.PI / 180

// Reusable vectors for calculations (avoid per-frame allocations)
var _tempForward = new Vector3()
var _tempRight = new Vector3()
var _tempLightDir = new Vector3()
var _tempQuat = new Quaternion()

/**
 * Update light direction based on camera orientation and offset angles.
 * @param {object} light - Babylon DirectionalLight
 * @param {object} camera - noa camera instance
 * @param {number} azimuth - Horizontal offset in degrees
 * @param {number} elevation - Vertical offset in degrees
 */
export function updateLightDirection(light, camera, azimuth, elevation) {
    if (!light || !camera) return

    // Get camera forward direction (vec3 array)
    var camDir = camera.getDirection()
    _tempForward.copyFromFloats(camDir[0], camDir[1], camDir[2])

    var azRad = azimuth * DEG_TO_RAD
    var elRad = elevation * DEG_TO_RAD

    // Calculate right vector (cross of up and forward)
    Vector3.CrossToRef(Vector3.Up(), _tempForward, _tempRight)
    _tempRight.normalize()

    // Start with forward direction
    _tempLightDir.copyFrom(_tempForward)

    // Rotate by azimuth around world Y axis
    if (azRad !== 0) {
        Quaternion.RotationAxisToRef(Vector3.Up(), azRad, _tempQuat)
        _tempLightDir.rotateByQuaternionToRef(_tempQuat, _tempLightDir)
    }

    // Rotate by elevation around camera's right axis
    if (elRad !== 0) {
        Quaternion.RotationAxisToRef(_tempRight, elRad, _tempQuat)
        _tempLightDir.rotateByQuaternionToRef(_tempQuat, _tempLightDir)
    }

    // Babylon directional lights expect direction of incoming light (camera headlamp = camera forward)
    light.direction.copyFrom(_tempLightDir)
}

/**
 * Calculate squared distance between camera position (array) and mesh position (Vector3).
 * @param {number[]} camPos - Camera position [x, y, z]
 * @param {object} meshPos - Mesh position (Vector3-like with x, y, z)
 * @returns {number}
 */
export function distanceSquared(camPos, meshPos) {
    var dx = camPos[0] - meshPos.x
    var dy = camPos[1] - meshPos.y
    var dz = camPos[2] - meshPos.z
    return dx * dx + dy * dy + dz * dz
}
