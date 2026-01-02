/**
 * Shadow resource creation and management.
 * Creates shared disc mesh, material, and texture for text shadows.
 */
/**
 * @typedef {object} ShadowResourcesResult
 * @property {object} sourceMesh - Source disc mesh for instancing
 * @property {object} material - Shadow material
 * @property {object|null} texture - Radial opacity texture
 */
/**
 * Create all shadow resources.
 * @param {object} scene - Babylon scene
 * @param {object} rendering - noa.rendering reference
 * @param {number} opacity - Shadow opacity
 * @returns {ShadowResourcesResult}
 */
export function createShadowResources(scene: object, rendering: object, opacity: number): ShadowResourcesResult;
/**
 * Create radial gradient texture for shadow soft edges.
 * @param {object} scene - Babylon scene
 * @returns {object|null}
 */
export function createShadowTexture(scene: object): object | null;
/**
 * Fix Babylon.js 8 SubMesh.getBoundingInfo() issue.
 * @param {object} mesh - Babylon mesh
 */
export function fixBoundingInfo(mesh: object): void;
/**
 * Dispose all shadow resources.
 * @param {object} rendering - noa.rendering reference
 * @param {object|null} sourceMesh
 * @param {object|null} material
 * @param {object|null} texture
 */
export function disposeShadowResources(rendering: object, sourceMesh: object | null, material: object | null, texture: object | null): void;
/**
 * Update material opacity (unfreezes and refreezes).
 * @param {object} material - Shadow material
 * @param {number} opacity - New opacity value
 */
export function updateMaterialOpacity(material: object, opacity: number): void;
export type ShadowResourcesResult = {
    /**
     * - Source disc mesh for instancing
     */
    sourceMesh: object;
    /**
     * - Shadow material
     */
    material: object;
    /**
     * - Radial opacity texture
     */
    texture: object | null;
};
