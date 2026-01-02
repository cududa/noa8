/**
 * Manages scene light isolation for text meshes.
 * Ensures new lights added to the scene don't affect text meshes using camera-relative lighting.
 */
/**
 * Register an observer for new scene lights.
 * @param {object} scene - Babylon scene
 * @param {Function} onNewLight - Callback for new lights
 * @returns {object} Observer reference for cleanup
 */
export function registerSceneLightObserver(scene: object, onNewLight: Function): object;
/**
 * Unregister the scene light observer.
 * @param {object} scene - Babylon scene
 * @param {object} observer - Observer reference
 */
export function unregisterSceneLightObserver(scene: object, observer: object): void;
/**
 * Check if a light should be ignored for isolation purposes.
 * @param {object} light - Babylon light
 * @param {object} textLight - Text directional light
 * @param {object} textAmbient - Text ambient light
 * @returns {boolean}
 */
export function shouldIgnoreLight(light: object, textLight: object, textAmbient: object): boolean;
/**
 * Exclude a mesh from a light.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function excludeMeshFromLight(light: object, mesh: object, textLight: object, textAmbient: object): void;
/**
 * Include a mesh in a light (remove from excludedMeshes).
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function includeMeshInLight(light: object, mesh: object, textLight: object, textAmbient: object): void;
/**
 * Exclude mesh from all world lights in a scene.
 * @param {object} scene - Babylon scene
 * @param {object} mesh - Mesh to exclude
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function excludeMeshFromAllWorldLights(scene: object, mesh: object, textLight: object, textAmbient: object): void;
/**
 * Include mesh in all world lights in a scene.
 * @param {object} scene - Babylon scene
 * @param {object} mesh - Mesh to include
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function includeMeshInAllWorldLights(scene: object, mesh: object, textLight: object, textAmbient: object): void;
