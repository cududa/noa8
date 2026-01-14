/**
 * Camera update and view overlay helpers.
 * Manages camera holder (a node that accumulates rotations) and
 * the fullscreen plane for overlaying effects (e.g. underwater tint).
 */
export class RenderingCamera {
    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering: import("./index.js").Rendering, opts: any);
    /** @type {import('./index.js').Rendering} */
    rendering: import("./index.js").Rendering;
    /** block id at current camera location used to toggle overlay */
    _camLocBlock: number;
    /**
     * Create the fullscreen plane used for underwater/overlay effects.
     * This plane obscures the camera - for overlaying an effect on the whole view.
     */
    _initCameraOverlay(_opts: any): void;
    /**
     * Updates camera position/rotation to match settings from noa.camera.
     * Also applies screen effect when camera is inside a transparent voxel.
     */
    updateCameraForRender(): void;
    /**
     * If camera's current location block id has alpha color (e.g. water),
     * apply/remove an effect on the fullscreen overlay plane.
     */
    _checkCameraEffect(id: any): void;
}
