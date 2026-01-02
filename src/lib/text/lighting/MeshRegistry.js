/**
 * Registry for tracking text meshes and their LOD state.
 * Provides efficient mesh management for the lighting system.
 */

export class MeshRegistry {
    constructor() {
        /** @type {Set<import('@babylonjs/core').Mesh>} */
        this._allMeshes = new Set()
        /** @type {WeakMap<import('@babylonjs/core').Mesh, boolean>} */
        this._lodState = new WeakMap()
    }

    /**
     * Check if mesh is registered.
     * @param {object} mesh
     * @returns {boolean}
     */
    has(mesh) {
        return this._allMeshes.has(mesh)
    }

    /**
     * Add a mesh to the registry.
     * @param {object} mesh
     */
    add(mesh) {
        if (mesh) {
            this._allMeshes.add(mesh)
        }
    }

    /**
     * Remove a mesh from the registry.
     * @param {object} mesh
     */
    remove(mesh) {
        if (mesh) {
            this._allMeshes.delete(mesh)
            this._lodState.delete(mesh)
        }
    }

    /**
     * Get the LOD state for a mesh (true = using text light).
     * @param {object} mesh
     * @returns {boolean}
     */
    getLODState(mesh) {
        return this._lodState.get(mesh) || false
    }

    /**
     * Set the LOD state for a mesh.
     * @param {object} mesh
     * @param {boolean} usingTextLight
     */
    setLODState(mesh, usingTextLight) {
        this._lodState.set(mesh, usingTextLight)
    }

    /**
     * Get iterator for all meshes.
     * @returns {IterableIterator<object>}
     */
    [Symbol.iterator]() {
        return this._allMeshes[Symbol.iterator]()
    }

    /**
     * Get the number of registered meshes.
     * @returns {number}
     */
    get size() {
        return this._allMeshes.size
    }

    /**
     * Clear all meshes from the registry.
     */
    clear() {
        this._allMeshes.clear()
    }

    /**
     * Remove disposed meshes from the registry.
     * Returns list of removed meshes.
     * @returns {object[]}
     */
    pruneDisposed() {
        var removed = []
        for (var mesh of this._allMeshes) {
            if (mesh.isDisposed && mesh.isDisposed()) {
                removed.push(mesh)
            }
        }
        for (var m of removed) {
            this._allMeshes.delete(m)
        }
        return removed
    }
}
