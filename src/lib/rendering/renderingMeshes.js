// Mesh management helpers (octree registration, visibility)
export class RenderingMeshes {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
    }


    /**
     * Register a mesh with noa's octree/selection system so it participates in rendering.
     * Handles Babylon quirks (LOD map, bounding info) before registration.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [isStatic]
     * @param {number[] | null} [pos]
     * @param {import('../chunk').Chunk | null} [containingChunk]
     */
    addMeshToScene(mesh, isStatic = false, pos = null, containingChunk = null) {
        var rendering = this.rendering
        if (!mesh.metadata) mesh.metadata = {}

        // Babylon 8 expects meshes to have a _currentLOD map; ensure it exists for all meshes
        var internalInfo = /** @type {any} */ ((mesh)._internalAbstractMeshDataInfo || {})
        if (!internalInfo._currentLOD) {
            internalInfo._currentLOD = new Map()
        }
        /** @type {any} */ (mesh)._internalAbstractMeshDataInfo = internalInfo

        // Ensure bounding info exists to avoid Babylon transparent sorting errors
        var bi = mesh.getBoundingInfo && mesh.getBoundingInfo()
        if (!bi || !bi.boundingSphere) {
            // Hide meshes without boundingInfo to prevent render errors
            mesh.isVisible = false
            return
        }

        // Ensure submeshes have valid boundingInfo for Babylon's transparent mesh sorting
        // SubMesh.getBoundingInfo() returns: IsGlobal || hasThinInstances ? mesh.getBoundingInfo() : _boundingInfo
        // For most meshes, IsGlobal is read-only and hasThinInstances is false, so it returns _boundingInfo
        // which may be null. Fix by setting _boundingInfo on each submesh.
        if (mesh.subMeshes && mesh.subMeshes.length > 0) {
            for (var i = 0; i < mesh.subMeshes.length; i++) {
                var sm = mesh.subMeshes[i]
                // @ts-ignore private Babylon field needed for transparent sorting
                if (!sm._boundingInfo) sm._boundingInfo = bi
            }
        }

        // Babylon 8 defaults useVertexColors=true even when no color buffer exists.
        // Sync useVertexColors with actual vertex color data to avoid white faces.
        var hasVertexColors = false
        if (mesh.isVerticesDataPresent) {
            try { hasVertexColors = mesh.isVerticesDataPresent('color') } catch (e) { }
        }
        if (!hasVertexColors && mesh.geometry && mesh.geometry.isVerticesDataPresent) {
            try { hasVertexColors = mesh.geometry.isVerticesDataPresent('color') } catch (e) { }
        }
        if (mesh.useVertexColors !== hasVertexColors) {
            mesh.useVertexColors = hasVertexColors
        }

        // Already registered? just make sure it's visible and bail
        if (mesh.metadata[addedToSceneFlag]) {
            rendering._octreeManager.setMeshVisibility(mesh, true)
            return
        }
        mesh.metadata[addedToSceneFlag] = true

        // If unparented, move from world coords into local coords before adding
        if (!mesh.parent) {
            if (!pos) pos = mesh.position.asArray()
            var lpos = rendering.noa.globalToLocal(pos, null, [])
            mesh.position.fromArray(lpos)
        }

        // Register with the octree; ensure cleanup on disposal
        rendering._octreeManager.addMesh(mesh, isStatic, pos, containingChunk)
        mesh.onDisposeObservable.add(() => {
            rendering._octreeManager.removeMesh(mesh)
            mesh.metadata[addedToSceneFlag] = false
        })
    }


    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Use this to temporarily remove a mesh or transfer it to different management.
     * The mesh can be re-added later with addMeshToScene.
     *
     * Note: The onDisposeObservable handler added by addMeshToScene will remain,
     * but it's safe - removeMesh is idempotent and the flag prevents double-processing.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     */
    removeMeshFromScene(mesh) {
        if (!mesh.metadata) return
        if (!mesh.metadata[addedToSceneFlag]) return
        this.rendering._octreeManager.removeMesh(mesh)
        mesh.metadata[addedToSceneFlag] = false
    }


    /**
     * Toggle mesh visibility while keeping its registration intact.
     * If the mesh was never registered, optionally add it when making visible.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [visible]
     */
    setMeshVisibility(mesh, visible = false) {
        if (!mesh.metadata) mesh.metadata = {}
        if (mesh.metadata[addedToSceneFlag]) {
            this.rendering._octreeManager.setMeshVisibility(mesh, visible)
        } else {
            if (visible) this.addMeshToScene(mesh)
        }
    }
}

/** Metadata flag used to mark meshes added to noa's managed scene */
var addedToSceneFlag = 'noa_added_to_scene'
