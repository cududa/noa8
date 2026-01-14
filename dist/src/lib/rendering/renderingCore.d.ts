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
    constructor(rendering: import("./index.js").Rendering, opts: import("./index.js").RenderingOptions, canvas: HTMLCanvasElement);
    /** @type {import('./index.js').Rendering} */
    rendering: import("./index.js").Rendering;
    /** RAF id used while polling scene readiness */
    /** @type {number | null} */ _sceneReadyPollId: number | null;
    /**
     * Wire up Babylon Engine, Scene, octree, camera holder, and readiness tracking.
     * @param {import('./index.js').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    _initScene(opts: import("./index.js").RenderingOptions, canvas: HTMLCanvasElement): void;
    /** Dispose the engine/scene and cancel readiness polling */
    dispose(): void;
}
