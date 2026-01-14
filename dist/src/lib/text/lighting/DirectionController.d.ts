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
export function updateLightDirection(light: object, camera: object, azimuth: number, elevation: number, smoothing?: number): void;
/**
 * Reset the smoothed direction to a specific value.
 * Useful when teleporting or resetting the camera.
 * @param {Vector3} [direction] - Direction to reset to (defaults to down-forward)
 */
export function resetSmoothedDirection(direction?: Vector3): void;
/**
 * Calculate squared distance between camera position (array) and mesh position (Vector3).
 * @param {number[]} camPos - Camera position [x, y, z]
 * @param {object} meshPos - Mesh position (Vector3-like with x, y, z)
 * @returns {number}
 */
export function distanceSquared(camPos: number[], meshPos: object): number;
import { Vector3 } from '../../babylonExports.js';
