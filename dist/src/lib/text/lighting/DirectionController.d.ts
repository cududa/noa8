/**
 * Update light direction based on camera orientation and offset angles.
 * @param {object} light - Babylon DirectionalLight
 * @param {object} camera - noa camera instance
 * @param {number} azimuth - Horizontal offset in degrees
 * @param {number} elevation - Vertical offset in degrees
 */
export function updateLightDirection(light: object, camera: object, azimuth: number, elevation: number): void;
/**
 * Calculate squared distance between camera position (array) and mesh position (Vector3).
 * @param {number[]} camPos - Camera position [x, y, z]
 * @param {object} meshPos - Mesh position (Vector3-like with x, y, z)
 * @returns {number}
 */
export function distanceSquared(camPos: number[], meshPos: object): number;
