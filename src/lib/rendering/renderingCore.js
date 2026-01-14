import {
    Engine,
    Scene,
    ScenePerformancePriority,
    FreeCamera,
    TransformNode,
    Vector3,
    Color3,
    Color4,
} from '../babylonExports.js'
import { SceneOctreeManager } from '../sceneOctreeManager.js'

/**
 * Core scene/engine initialization and disposal.
 * Extracted from the monolithic renderer so the lifecycle is isolated here.
 */
export class RenderingCore {

    /**
     * @param {import('./index.js').Rendering} rendering
     * @param {import('./index.js').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    constructor(rendering, opts, canvas) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
        /** RAF id used while polling scene readiness */
        /** @type {number | null} */ this._sceneReadyPollId = null
        this._initScene(opts, canvas)
    }


    /**
     * Wire up Babylon Engine, Scene, octree, camera holder, and readiness tracking.
     * @param {import('./index.js').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    _initScene(opts, canvas) {
        var rendering = this.rendering

        // Engine/scene creation
        rendering.engine = new Engine(canvas, opts.antiAlias, {
            preserveDrawingBuffer: opts.preserveDrawingBuffer,
        })
        var scene = new Scene(rendering.engine)
        rendering.scene = scene
        // remove built-in listeners - noa installs its own input handling
        scene.detachControl()

        // disable expensive features noa doesn't use
        scene.performancePriority = ScenePerformancePriority.Intermediate
        scene.autoClear = true
        scene.skipPointerMovePicking = true

        // octree manager handles chunk/static vs dynamic mesh registration
        var blockSize = Math.round(opts.octreeBlockSize)
        rendering._octreeManager = new SceneOctreeManager(rendering, blockSize)

        // camera holder/camera (camera parent collects rotations)
        rendering._cameraHolder = new TransformNode('camHolder', scene)
        rendering.camera = new FreeCamera('camera', new Vector3(0, 0, 0), scene)
        rendering.camera.parent = rendering._cameraHolder
        rendering.camera.minZ = .01

        // apply defaults
        scene.clearColor = Color4.FromArray(opts.clearColor)
        scene.ambientColor = Color3.FromArray(opts.ambientColor)

        // Set up scene readiness tracking AFTER all initial scene setup
        // NOTE: Babylon's onReadyObservable and executeWhenReady fire BEFORE shaders
        // are actually compiled. We must poll scene.isReady() to ensure true readiness.
        var self = this
        rendering.sceneReady = new Promise((resolve) => {
            if (scene.isReady()) {
                rendering._sceneIsReady = true
                resolve()
                return
            }

            // Poll for scene.isReady() using requestAnimationFrame
            // This ensures we wait for actual shader compilation, not just queued resources
            var pollCount = 0
            var maxPolls = 300 // ~5 seconds at 60fps

            function pollReady() {
                // Clear pending ID since we're now executing
                self._sceneReadyPollId = null
                // Stop polling if disposed
                if (rendering._disposed) return
                pollCount++
                if (scene.isReady()) {
                    rendering._sceneIsReady = true
                    // Call any queued callbacks
                    for (var cb of rendering._sceneReadyCallbacks) {
                        try { cb() } catch (e) { console.error('[noa] sceneReady callback error:', e) }
                    }
                    rendering._sceneReadyCallbacks = []
                    resolve()
                } else if (pollCount >= maxPolls) {
                    // Timeout - resolve anyway to prevent hanging, but log warning
                    console.warn('[noa] Scene ready timeout after', pollCount, 'polls - proceeding anyway')
                    console.warn('[noa] scene.isReady():', scene.isReady())
                    rendering._sceneIsReady = true
                    for (var cb of rendering._sceneReadyCallbacks) {
                        try { cb() } catch (e) { console.error('[noa] sceneReady callback error:', e) }
                    }
                    rendering._sceneReadyCallbacks = []
                    resolve()
                } else {
                    // Keep polling - store ID for potential cancellation
                    self._sceneReadyPollId = requestAnimationFrame(pollReady)
                }
            }

            // Start polling on next frame (give Babylon a chance to queue resources)
            self._sceneReadyPollId = requestAnimationFrame(pollReady)
        })
    }


    /** Dispose the engine/scene and cancel readiness polling */
    dispose() {
        var rendering = this.rendering

        // Cancel any pending scene ready polling
        if (this._sceneReadyPollId !== null) {
            cancelAnimationFrame(this._sceneReadyPollId)
            this._sceneReadyPollId = null
        }

        // Clear scene ready callbacks to prevent memory leaks
        rendering._sceneReadyCallbacks = []
        rendering._sceneIsReady = false

        if (rendering.scene) {
            rendering.scene.meshes.slice().forEach(mesh => {
                if (!mesh.isDisposed()) mesh.dispose()
            })
            rendering.scene.dispose()
            rendering.scene = null
        }
        if (rendering.engine) {
            rendering.engine.stopRenderLoop()
            rendering.engine.dispose()
            rendering.engine = null
        }
    }
}
