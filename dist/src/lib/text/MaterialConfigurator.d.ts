/**
 * Handles color processing and material configuration for text meshes.
 * Centralizes contrast color derivation and Fresnel setup.
 */
/**
 * Process color options for contrast requirements.
 * @param {object} opts - Text options
 * @param {object|null} contrastUtils - Color utilities from meshwriter
 * @returns {{emissive: string, diffuse: string|null, ambient: string|null}}
 */
export function processContrastColors(opts: object, contrastUtils: object | null): {
    emissive: string;
    diffuse: string | null;
    ambient: string | null;
};
/**
 * Configure material for text mesh with Fresnel and contrast settings.
 * @param {object} material - Babylon StandardMaterial
 * @param {object} opts - Text options
 * @param {boolean} usingCameraLight - Whether camera-relative lighting is active
 * @param {boolean} isolatedFromSceneAmbient - Whether to zero ambient
 * @param {object|null} contrastUtils - Color utilities from meshwriter
 */
export function configureMaterial(material: object, opts: object, usingCameraLight: boolean, isolatedFromSceneAmbient: boolean, contrastUtils: object | null): void;
