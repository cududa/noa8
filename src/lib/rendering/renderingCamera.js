import { CreatePlane } from '../babylonExports.js'

/**
 * Camera update and view overlay helpers.
 * Manages camera holder (a node that accumulates rotations) and
 * the fullscreen plane for overlaying effects (e.g. underwater tint).
 */
export class RenderingCamera {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering, opts) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
        /** block id at current camera location used to toggle overlay */
        this._camLocBlock = 0
        this._initCameraOverlay(opts)
    }

    /**
     * Create the fullscreen plane used for underwater/overlay effects.
     * This plane obscures the camera - for overlaying an effect on the whole view.
     */
    _initCameraOverlay(_opts) {
        var rendering = this.rendering
        var scene = rendering.scene
        // plane obscuring the camera - for overlaying an effect on the whole view
        rendering._camScreen = CreatePlane('camScreen', { size: 10 }, scene)
        rendering.addMeshToScene(rendering._camScreen)
        rendering._camScreen.position.z = .1
        rendering._camScreen.parent = rendering.camera
        rendering._camScreenMat = rendering.makeStandardMaterial('camera_screen_mat')
        rendering._camScreen.material = rendering._camScreenMat
        rendering._camScreen.setEnabled(false)
        rendering._camScreenMat.freeze()
    }

    /**
     * Updates camera position/rotation to match settings from noa.camera.
     * Also applies screen effect when camera is inside a transparent voxel.
     */
    updateCameraForRender() {
        var rendering = this.rendering
        // camera holder accumulates rotations, camera offset handles zoom
        var cam = rendering.noa.camera
        var tgtLoc = cam._localGetTargetPosition()
        rendering._cameraHolder.position.copyFromFloats(tgtLoc[0], tgtLoc[1], tgtLoc[2])
        rendering._cameraHolder.rotation.x = cam.pitch
        rendering._cameraHolder.rotation.y = cam.heading
        rendering.camera.position.z = -cam.currentZoom

        // applies screen effect when camera is inside a transparent voxel
        var cloc = cam._localGetPosition()
        var off = rendering.noa.worldOriginOffset
        var cx = Math.floor(cloc[0] + off[0])
        var cy = Math.floor(cloc[1] + off[1])
        var cz = Math.floor(cloc[2] + off[2])
        var id = rendering.noa.getBlock(cx, cy, cz)
        this._checkCameraEffect(id)
    }

    /**
     * If camera's current location block id has alpha color (e.g. water),
     * apply/remove an effect on the fullscreen overlay plane.
     */
    _checkCameraEffect(id) {
        var rendering = this.rendering
        if (id === this._camLocBlock) return
        if (id === 0) {
            rendering._camScreen.setEnabled(false)
        } else {
            var mat = rendering._camScreenMat
            if (!mat) return
            var matId = rendering.noa.registry.getBlockFaceMaterial(id, 0)
            if (matId) {
                var matData = rendering.noa.registry.getMaterialData(matId)
                var col = matData.color
                var alpha = matData.alpha
                if (col && alpha && alpha < 1) {
                    mat.diffuseColor.set(0, 0, 0)
                    mat.ambientColor.set(col[0], col[1], col[2])
                    mat.alpha = alpha
                    rendering._camScreen.setEnabled(true)
                }
            }
        }
        this._camLocBlock = id
    }
}
