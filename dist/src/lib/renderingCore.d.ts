/**
 * Core scene/engine initialization and disposal.
 * Extracted from the monolithic renderer so the lifecycle is isolated here.
 */
export class RenderingCore {
    /**
     * @param {import('./rendering').Rendering} rendering
     * @param {import('./rendering').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    constructor(rendering: import("./rendering").Rendering, opts: import("./rendering").RenderingOptions, canvas: HTMLCanvasElement);
    /** @type {import('./rendering').Rendering} */
    rendering: import("./rendering").Rendering;
    /** RAF id used while polling scene readiness */
    /** @type {number | null} */ _sceneReadyPollId: number | null;
    /**
     * Wire up Babylon Engine, Scene, octree, camera holder, and readiness tracking.
     * @param {import('./rendering').RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
     */
    _initScene(opts: import("./rendering").RenderingOptions, canvas: HTMLCanvasElement): void;
    /** Dispose the engine/scene and cancel readiness polling */
    dispose(): void;
}
