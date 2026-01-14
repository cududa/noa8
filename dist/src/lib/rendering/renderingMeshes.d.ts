export class RenderingMeshes {
    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering: import("./index.js").Rendering);
    /** @type {import('./index.js').Rendering} */
    rendering: import("./index.js").Rendering;
    /**
     * Register a mesh with noa's octree/selection system so it participates in rendering.
     * Handles Babylon quirks (LOD map, bounding info) before registration.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [isStatic]
     * @param {number[] | null} [pos]
     * @param {import('../chunk').Chunk | null} [containingChunk]
     */
    addMeshToScene(mesh: import("@babylonjs/core").AbstractMesh, isStatic?: boolean, pos?: number[] | null, containingChunk?: import("../chunk").Chunk | null): void;
    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Use this to temporarily remove a mesh or transfer it to different management.
     * The mesh can be re-added later with addMeshToScene.
     *
     * Note: The onDisposeObservable handler added by addMeshToScene will remain,
     * but it's safe - removeMesh is idempotent and the flag prevents double-processing.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     */
    removeMeshFromScene(mesh: import("@babylonjs/core").AbstractMesh): void;
    /**
     * Toggle mesh visibility while keeping its registration intact.
     * If the mesh was never registered, optionally add it when making visible.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [visible]
     */
    setMeshVisibility(mesh: import("@babylonjs/core").AbstractMesh, visible?: boolean): void;
}
