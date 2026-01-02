/**
 * Registry for tracking text meshes and their LOD state.
 * Provides efficient mesh management for the lighting system.
 */
export class MeshRegistry {
    /** @type {Set<import('@babylonjs/core').Mesh>} */
    _allMeshes: Set<import("@babylonjs/core").Mesh>;
    /** @type {WeakMap<import('@babylonjs/core').Mesh, boolean>} */
    _lodState: WeakMap<import("@babylonjs/core").Mesh, boolean>;
    /**
     * Check if mesh is registered.
     * @param {object} mesh
     * @returns {boolean}
     */
    has(mesh: object): boolean;
    /**
     * Add a mesh to the registry.
     * @param {object} mesh
     */
    add(mesh: object): void;
    /**
     * Remove a mesh from the registry.
     * @param {object} mesh
     */
    remove(mesh: object): void;
    /**
     * Get the LOD state for a mesh (true = using text light).
     * @param {object} mesh
     * @returns {boolean}
     */
    getLODState(mesh: object): boolean;
    /**
     * Set the LOD state for a mesh.
     * @param {object} mesh
     * @param {boolean} usingTextLight
     */
    setLODState(mesh: object, usingTextLight: boolean): void;
    /**
     * Get the number of registered meshes.
     * @returns {number}
     */
    get size(): number;
    /**
     * Clear all meshes from the registry.
     */
    clear(): void;
    /**
     * Remove disposed meshes from the registry.
     * Returns list of removed meshes.
     * @returns {object[]}
     */
    pruneDisposed(): object[];
    /**
     * Get iterator for all meshes.
     * @returns {IterableIterator<object>}
     */
    [Symbol.iterator](): IterableIterator<object>;
}
