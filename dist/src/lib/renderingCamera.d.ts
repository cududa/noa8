export class RenderingCamera {
    /** @param {import('./rendering').Rendering} rendering */
    constructor(rendering: import("./rendering").Rendering, opts: any);
    /** @type {import('./rendering').Rendering} */
    rendering: import("./rendering").Rendering;
    /** block id at current camera location used to toggle overlay */
    _camLocBlock: number;
    /** Create the fullscreen plane used for underwater/overlay effects */
    _initCameraOverlay(_opts: any): void;
    /** Update camera holder position/rotation and apply overlay each frame */
    updateCameraForRender(): void;
    /** Apply/remove fullscreen effect based on the block the camera is inside */
    _checkCameraEffect(id: any): void;
}
