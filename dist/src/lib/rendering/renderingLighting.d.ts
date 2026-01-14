/**
 * Light setup and helpers for the main directional/hemispheric lighting.
 * Keeps Babylon-specific light tweaks out of the main Rendering class.
 */
export class RenderingLighting {
    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering: import("./index.js").Rendering, opts: any);
    /** @type {import('./index.js').Rendering} */
    rendering: import("./index.js").Rendering;
    /** Initialize the default directional light from options */
    _initLight(opts: any): void;
    /**
     * Clean up disposed meshes from the main light's excludedMeshes array.
     * This prevents memory leaks when meshes are disposed without explicit cleanup.
     */
    tick(_dt: any): void;
    /**
     * Allow callers to tweak or disable the built-in directional light.
     * @param {object} opts
     * @param {import('@babylonjs/core').Vector3} [opts.direction]
     * @param {number} [opts.intensity]
     * @param {import('@babylonjs/core').Color3} [opts.diffuse]
     * @param {import('@babylonjs/core').Color3} [opts.specular]
     */
    setMainLightOptions(opts: {
        direction?: import("@babylonjs/core").Vector3;
        intensity?: number;
        diffuse?: import("@babylonjs/core").Color3;
        specular?: import("@babylonjs/core").Color3;
    }): void;
    /**
     * Exclude a mesh (and optionally descendants) from the main directional light.
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} [includeDescendants]
     */
    excludeMesh(mesh: import("@babylonjs/core").Mesh, includeDescendants?: boolean): void;
    /**
     * Re-include a mesh (and optionally descendants) so it receives the main light again.
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} [includeDescendants]
     */
    includeMesh(mesh: import("@babylonjs/core").Mesh, includeDescendants?: boolean): void;
    /**
     * Create a new light in the scene.
     * @param {'directional' | 'hemispheric'} type
     * @param {string} name
     * @returns {import('@babylonjs/core').DirectionalLight | import('@babylonjs/core').HemisphericLight}
     */
    createLight(type: "directional" | "hemispheric", name: string): import("@babylonjs/core").DirectionalLight | import("@babylonjs/core").HemisphericLight;
}
