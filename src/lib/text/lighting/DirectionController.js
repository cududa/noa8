import { Vector3, Quaternion } from '../../babylonExports.js'

/**
 * Camera-relative direction calculations for text lighting.
 * Handles azimuth/elevation rotation math with reusable vectors.
 * Includes smoothing to prevent jitter on distant text.
 */

var DEG_TO_RAD = Math.PI / 180

// Reusable vectors for calculations (avoid per-frame allocations)
var _tempForward = new Vector3()
var _tempRight = new Vector3()
var _tempTargetDir = new Vector3()
var _tempQuat = new Quaternion()

// Smoothed direction state (persists across frames)
// Initialized to a sensible default (down-forward)
var _smoothedDir = new Vector3(0, -0.7, 0.7)
_smoothedDir.normalize()

// Default smoothing factor (0-1, lower = smoother)
var DEFAULT_SMOOTHING = 0.15

/**
 * Update light direction based on camera orientation and offset angles.
 * Uses interpolation to smooth direction changes and prevent jitter.
 *
 * @param {object} light - Babylon DirectionalLight
 * @param {object} camera - noa camera instance
 * @param {number} azimuth - Horizontal offset in degrees
 * @param {number} elevation - Vertical offset in degrees
 * @param {number} [smoothing=0.15] - Smoothing factor (0-1). Lower = smoother. 1 = instant.
 */
export function updateLightDirection(light, camera, azimuth, elevation, smoothing) {
    if (!light || !camera) return

    smoothing = smoothing !== undefined ? smoothing : DEFAULT_SMOOTHING

    // Get camera forward direction (vec3 array)
    var camDir = camera.getDirection()
    _tempForward.copyFromFloats(camDir[0], camDir[1], camDir[2])

    var azRad = azimuth * DEG_TO_RAD
    var elRad = elevation * DEG_TO_RAD

    // Calculate right vector (cross of up and forward)
    Vector3.CrossToRef(Vector3.Up(), _tempForward, _tempRight)
    _tempRight.normalize()

    // Start with forward direction for target calculation
    _tempTargetDir.copyFrom(_tempForward)

    // Rotate by azimuth around world Y axis
    if (azRad !== 0) {
        Quaternion.RotationAxisToRef(Vector3.Up(), azRad, _tempQuat)
        _tempTargetDir.rotateByQuaternionToRef(_tempQuat, _tempTargetDir)
    }

    // Rotate by elevation around camera's right axis
    if (elRad !== 0) {
        Quaternion.RotationAxisToRef(_tempRight, elRad, _tempQuat)
        _tempTargetDir.rotateByQuaternionToRef(_tempQuat, _tempTargetDir)
    }

    // Smooth the light direction by interpolating toward target
    // This prevents jitter caused by rapid camera/position changes
    Vector3.LerpToRef(_smoothedDir, _tempTargetDir, smoothing, _smoothedDir)
    _smoothedDir.normalize()

    // Babylon directional lights expect direction of incoming light
    light.direction.copyFrom(_smoothedDir)
}

/**
 * Reset the smoothed direction to a specific value.
 * Useful when teleporting or resetting the camera.
 * @param {Vector3} [direction] - Direction to reset to (defaults to down-forward)
 */
export function resetSmoothedDirection(direction) {
    if (direction) {
        _smoothedDir.copyFrom(direction)
    } else {
        _smoothedDir.copyFromFloats(0, -0.7, 0.7)
    }
    _smoothedDir.normalize()
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
