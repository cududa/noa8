import { Material } from '../babylonExports.js'
import { RenderingCore } from './renderingCore.js'
import { RenderingLighting } from './renderingLighting.js'
import { RenderingMeshes } from './renderingMeshes.js'
import { RenderingMaterials } from './renderingMaterials.js'
import { RenderingModels } from './renderingModels.js'
import { RenderingCoords } from './renderingCoords.js'
import { RenderingCamera } from './renderingCamera.js'
import { RenderingUtils, setUpFPS, profile_hook, fps_hook } from './renderingUtils.js'

// Babylon 8 expects materials to expose needAlphaTestingForMesh; add a backward-compatible shim
if (typeof Material.prototype.needAlphaTestingForMesh !== 'function') {
    Material.prototype.needAlphaTestingForMesh = function (mesh) {
        // @ts-ignore older materials expose needAlphaTesting
        return (typeof this.needAlphaTesting === 'function') ? this.needAlphaTesting() : false
    }
}


var defaults = {
    showFPS: false,
    antiAlias: true,
    clearColor: [0.8, 0.9, 1],
    ambientColor: [0.5, 0.5, 0.5],
    lightDiffuse: [1, 1, 1],
    lightSpecular: [1, 1, 1],
    lightVector: [1, -1, 0.5],
    useAO: true,
    AOmultipliers: [0.93, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    preserveDrawingBuffer: true,
    octreeBlockSize: 2,
    renderOnResize: true,
}
var _cachedHighlightPos = [0, 0, 0]
var _cachedHighlightNorm = [0, 0, 0]

/**
 * Rendering configuration passed in via the Engine constructor.
 * Options here intentionally mirror the historical monolithic renderer defaults.
 * @typedef {object} RenderingOptions
 * @property {boolean} [showFPS]
 * @property {boolean} [antiAlias]
 * @property {[number, number, number]} [clearColor]
 * @property {[number, number, number]} [ambientColor]
 * @property {[number, number, number]} [lightDiffuse]
 * @property {[number, number, number]} [lightSpecular]
 * @property {[number, number, number]} [lightVector]
 * @property {boolean} [useAO]
 * @property {[number, number, number]} [AOmultipliers]
 * @property {number} [reverseAOmultiplier]
 * @property {boolean} [preserveDrawingBuffer]
 * @property {number} [octreeBlockSize]
 * @property {boolean} [renderOnResize]
 */


/**
 * `noa.rendering` - Manages all rendering and Babylon scene objects.
 *
 * The following options may be provided via the main Engine constructor:
 * ```js
 * {
 *     showFPS: false,
 *     antiAlias: true,
 *     clearColor: [0.8, 0.9, 1],
 *     ambientColor: [0.5, 0.5, 0.5],
 *     lightDiffuse: [1, 1, 1],
 *     lightSpecular: [1, 1, 1],
 *     lightVector: [1, -1, 0.5],
 *     useAO: true,
 *     AOmultipliers: [0.93, 0.8, 0.5],
 *     reverseAOmultiplier: 1.0,
 *     preserveDrawingBuffer: true,
 *     octreeBlockSize: 2,
 *     renderOnResize: true,
 * }
 * ```
 */
export class Rendering {

    /**
     * @internal
     * @param {import('../../index.js').Engine} noa
     * @param {RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
    */
    constructor(noa, opts, canvas) {
        opts = Object.assign({}, defaults, opts)
        /** Primary noa engine handle */
        /** @internal */ this.noa = noa

        // settings and basic config used throughout rendering helpers
        /** Whether to redraw the screen when the game is resized while paused */
        this.renderOnResize = !!opts.renderOnResize
        /** @internal */ this.useAO = !!opts.useAO
        /** @internal */ this.aoVals = opts.AOmultipliers
        /** @internal */ this.revAoVal = opts.reverseAOmultiplier
        /** @internal */ this.meshingCutoffTime = 6 // ms budget for meshing batches
        /** @internal */ this._disposed = false

        // Babylon handles initialized by RenderingCore
        /** @type {import('@babylonjs/core').Engine | null} */ this.engine = null
        /** @type {import('@babylonjs/core').Scene | null} */ this.scene = null
        /** @type {import('@babylonjs/core').DirectionalLight | null} */ this.light = null
        /** @type {import('@babylonjs/core').FreeCamera | null} */ this.camera = null
        /** @internal legacy hook for highlight mesh (managed by RenderingUtils) */ this._highlightMesh = null
        /** @type {import('../sceneOctreeManager.js').SceneOctreeManager | null} */ this._octreeManager = null
        /** @type {import('@babylonjs/core').TransformNode | null} */ this._cameraHolder = null
        /** @type {import('@babylonjs/core').Mesh | null} */ this._camScreen = null
        /** @type {import('@babylonjs/core').StandardMaterial | null} */ this._camScreenMat = null
        /** @internal */ this._errorLogged = false

        // scene readiness tracking
        /** @internal */ this._sceneIsReady = false
        /** @internal */ this._sceneReadyCallbacks = /** @type {(() => void)[]} */([])
        /** Promise that resolves when the Babylon scene reports ready */
        /** @type {Promise<void> | null} */ this.sceneReady = null // set by core

        // core scene setup
        this._core = new RenderingCore(this, opts, canvas)

        // feature modules (each encapsulates a concern formerly bundled in rendering.js)
        /** @internal */ this._lighting = new RenderingLighting(this, opts)
        /** @internal */ this._meshes = new RenderingMeshes(this)
        /** @internal */ this._materials = new RenderingMaterials(this)
        /** @internal */ this._models = new RenderingModels(this)
        /** @internal */ this._coords = new RenderingCoords(this)
        /** @internal */ this._utils = new RenderingUtils(this)
        /** @internal */ this._camera = new RenderingCamera(this, opts)

        // for debugging
        if (opts.showFPS) setUpFPS()
    }


    /*
     *   PUBLIC API
     */

    /** The Babylon `scene` object representing the game world. */
    getScene() { return this.scene }

    /**
     * Whether the Babylon scene has finished initializing (including shader compilation).
     * Check this when you need synchronous access to Babylon objects.
     */
    isSceneReady() { return this._sceneIsReady }

    onSceneReady(callback) {
        if (typeof callback !== 'function') return
        if (this._sceneIsReady) {
            try { callback() } catch (e) { console.error('[noa] onSceneReady callback error:', e) }
        } else {
            this._sceneReadyCallbacks.push(callback)
        }
    }

    /**
     * Allow callers to tweak or disable the built-in directional light.
     * @param {object} opts
     * @param {import('@babylonjs/core').Vector3} [opts.direction]
     * @param {number} [opts.intensity]
     * @param {import('@babylonjs/core').Color3} [opts.diffuse]
     * @param {import('@babylonjs/core').Color3} [opts.specular]
     */
    setMainLightOptions(opts) { this._lighting.setMainLightOptions(opts) }

    /** Exclude a mesh (and optionally its descendants) from the main directional light */
    excludeMeshFromMainLight(mesh, includeDescendants = true) {
        this._lighting.excludeMesh(mesh, includeDescendants)
    }

    /** Re-include a mesh (and optionally its descendants) in the main directional light */
    includeMeshInMainLight(mesh, includeDescendants = true) {
        this._lighting.includeMesh(mesh, includeDescendants)
    }

    /** Create an ad-hoc directional or hemispheric light in the scene */
    createLight(type, name) { return this._lighting.createLight(type, name) }

    /** @internal */
    tick(dt) { this._lighting.tick(dt) }


    /**
     * @internal
     * Per-frame render loop: updates camera, validates mesh bounds to avoid Babylon crashes,
     * executes Babylon render, and records simple profiling hooks.
     */
    render() {
        profile_hook('start')
        this._camera.updateCameraForRender()
        profile_hook('updateCamera')
        this.engine.beginFrame()
        profile_hook('beginFrame')

        // Validate bounding info before render to avoid Babylon errors
        this.scene.meshes.forEach(mesh => {
            if (!mesh.metadata) mesh.metadata = {}
            if (mesh.metadata._noaBoundingChecked) return
            var bi = null
            try { bi = mesh.getBoundingInfo && mesh.getBoundingInfo() } catch (e) { }
            if (!bi || !bi.boundingSphere) {
                mesh.isVisible = false
                console.log('[noa] Hidden mesh without boundingInfo:', mesh.name)
            }
            mesh.metadata._noaBoundingChecked = true
        })

        try {
            this.scene.render()
        } catch (e) {
            if (e.message && e.message.includes('boundingSphere') && !this._errorLogged) {
                this._errorLogged = true
                console.error('[noa] boundingSphere error! Checking all meshes and submeshes...')
                this.scene.meshes.forEach((mesh, i) => {
                    var bi = null
                    try { bi = mesh.getBoundingInfo && mesh.getBoundingInfo() } catch (e2) { }
                    if (!bi || !bi.boundingSphere) {
                        console.error('[noa] BAD MESH:', i, mesh.name, 'bi:', bi)
                    }
                    if (mesh.subMeshes) {
                        mesh.subMeshes.forEach((sm, j) => {
                            var smBi = null
                            try { smBi = sm.getBoundingInfo && sm.getBoundingInfo() } catch (e2) { }
                            if (!smBi || !smBi.boundingSphere) {
                                console.error('[noa] BAD SUBMESH:', mesh.name, 'submesh', j, 'bi:', smBi)
                            }
                        })
                    }
                })
            }
            throw e
        }

        profile_hook('render')
        fps_hook()
        this.engine.endFrame()
        profile_hook('endFrame')
        profile_hook('end')
    }


    /** @internal */
    postRender() { /* hook for post-render effects if needed */ }


    /**
     * Dispose Babylon resources and clear internal references.
     * Safe to call multiple times.
     */
    dispose() {
        if (this._disposed) return
        this._disposed = true
        this._utils.dispose()
        this._core.dispose()
        this.light = null
        this.camera = null
        this._highlightMesh = null
    }


    /**
     * Resize the Babylon engine/scene. When paused and renderOnResize is true,
     * force a single render to keep the paused frame up to date.
     * @internal
     */
    resize() {
        this.engine.resize()
        if (this.noa._paused && this.renderOnResize) {
            this.scene.render()
        }
    }


    /**
     * Pick terrain from the camera position along the camera direction.
     * @param {number} [distance=-1] optional max distance; defaults to blockTestDistance
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainFromCamera(distance = -1) { return this._utils.pickTerrainFromCamera(distance) }

    /**
     * Cast a ray for terrain picking from an origin/direction.
     * @param {number[]} origin world or local coords
     * @param {number[]} direction unit-ish direction vector
     * @param {number} [distance=-1] optional max distance
     * @param {boolean} [originIsLocal=false] whether origin is already local coords
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainWithRay(origin, direction, distance = -1, originIsLocal = false) {
        return this._utils.pickTerrainWithRay(origin, direction, distance, originIsLocal)
    }

    /**
     * Draw or hide the translucent block-face highlight used by the selector.
     * @param {boolean} show
     * @param {number[]} [posArr] world coords of the targeted block position
     * @param {number[]} [normArr] face normal (length 3) pointing outward
     */
    highlightBlockFace(show, posArr = _cachedHighlightPos, normArr = _cachedHighlightNorm) {
        return this._utils.highlightBlockFace(show, posArr, normArr)
    }


    /**
     * Adds a mesh to the engine's selection/octree logic so that it renders.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [isStatic]
     * @param {number[] | null} [pos]
     * @param {import('../chunk').Chunk | null} [containingChunk]
     */
    addMeshToScene(mesh, isStatic = false, pos = null, containingChunk = null) {
        return this._meshes.addMeshToScene(mesh, isStatic, pos, containingChunk)
    }

    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Mesh can be re-added later with addMeshToScene.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     */
    removeMeshFromScene(mesh) { return this._meshes.removeMeshFromScene(mesh) }

    /**
     * Toggle visibility of a mesh without disposing/removing it.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [visible]
     */
    setMeshVisibility(mesh, visible = false) { return this._meshes.setMeshVisibility(mesh, visible) }


    /** Create a default flat non-specular material */
    makeStandardMaterial(name) { return this._materials.makeStandardMaterial(name) }

    /** Access to Babylon MeshBuilder */
    get meshBuilder() { return this._materials.meshBuilder }

    /** Convenience factory for StandardMaterial with common options */
    createStandardMaterial(name, options) { return this._materials.createStandardMaterial(name, options) }

    /** Convenience factory for ShaderMaterial from inline GLSL */
    createShaderMaterial(name, vertexSource, fragmentSource, options) {
        return this._materials.createShaderMaterial(name, vertexSource, fragmentSource, options)
    }


    /**
     * Load a GLB/glTF model and register its meshes with noa.
     * @param {string} url
     * @param {import('./renderingModels.js').LoadModelOptions} [options]
     */
    async loadModel(url, options) { return this._models.loadModel(url, options) }


    /** Convert world coordinates to local (rendering) coordinates */
    worldToLocal(x, y, z) { return this._coords.worldToLocal(x, y, z) }
    /** Cached world-to-local conversion for hot paths */
    worldToLocalCached(x, y, z, out) { return this._coords.worldToLocalCached(x, y, z, out) }
    /** Convert local (rendering) coordinates to world coordinates */
    localToWorld(x, y, z) { return this._coords.localToWorld(x, y, z) }
    /** Cached local-to-world conversion for hot paths */
    localToWorldCached(x, y, z, out) { return this._coords.localToWorldCached(x, y, z, out) }
    /** Set a mesh position using world coordinates */
    setMeshWorldPosition(mesh, x, y, z) { return this._coords.setMeshWorldPosition(mesh, x, y, z) }
    /** Get a mesh's world position */
    getMeshWorldPosition(mesh) { return this._coords.getMeshWorldPosition(mesh) }
    /** Cached variant of getMeshWorldPosition */
    getMeshWorldPositionCached(mesh, out) { return this._coords.getMeshWorldPositionCached(mesh, out) }
    /** Copy of current world origin offset */
    getWorldOriginOffset() { return this._coords.getWorldOriginOffset() }
    /** Cached world origin offset */
    getWorldOriginOffsetCached(out) { return this._coords.getWorldOriginOffsetCached(out) }
    /** Push world origin offset into a shader uniform */
    updateShaderWorldOrigin(material, uniformName) { return this._coords.updateShaderWorldOrigin(material, uniformName) }


    /** @internal */
    _rebaseOrigin(delta) { return this._coords._rebaseOrigin(delta) }

    /** @internal */
    prepareChunkForRendering(chunk) { /* currently unused */ }

    /** @internal */
    disposeChunkForRendering(chunk) { /* currently unused */ }

    /** @internal */
    debug_SceneCheck() { return this._utils.debug_SceneCheck() }

    /** @internal */
    debug_MeshCount() { return this._utils.debug_MeshCount() }
}
