/**
 * TextShadowManager - Simple shadow system for 3D text
 *
 * Follows the same pattern as the entity shadow component:
 * - Use mesh.position directly (already in local coords)
 * - Raycast down to find ground
 * - Position shadow at ground level
 * - No complex coordinate conversions
 */

import { ShadowInstances } from './ShadowInstances.js'
import { createShadowResources, disposeShadowResources, fixBoundingInfo, updateMaterialOpacity } from './ShadowResources.js'
import { measureTextMesh } from './ShadowMeasurement.js'
import { updateShadows } from './ShadowUpdater.js'


/**
 * @typedef {object} TextShadowOptions
 * @property {boolean} [enabled=true] - Whether shadows are enabled
 * @property {number} [blur=0.5] - Shadow blur/softness (0-1)
 * @property {number} [opacity=0.4] - Shadow opacity (0-1)
 * @property {number} [maxDistance=10] - Max raycast distance to find ground
 */


/**
 * Manages shadows for text instances.
 */
export class TextShadowManager {

    /**
     * @param {import('../../../index').Engine} noa
     */
    constructor(noa) {
        /** @internal */
        this.noa = noa

        /** @internal - Source disc mesh for instancing */
        this._sourceMesh = null

        /** @internal - Shared shadow material */
        this._shadowMat = null

        /** @internal - Radial opacity texture */
        this._shadowTexture = null

        /** @internal - Shadow instance tracking */
        this._instances = new ShadowInstances()

        /** @internal - Whether manager is initialized */
        this._initialized = false

        /** Default shadow options */
        this.defaultOptions = {
            enabled: true,
            blur: 0.5,
            opacity: 0.4,
            maxDistance: 10,
        }
    }


    /**
     * Initialize the shadow manager (call after scene is ready)
     */
    initialize() {
        if (this._initialized) return
        this._initialized = true

        var scene = this.noa.rendering.getScene()
        var resources = createShadowResources(scene, this.noa.rendering, this.defaultOptions.opacity)

        this._sourceMesh = resources.sourceMesh
        this._shadowMat = resources.material
        this._shadowTexture = resources.texture
    }


    /**
     * Update default options
     * @param {Partial<TextShadowOptions>} opts
     */
    setDefaults(opts) {
        Object.assign(this.defaultOptions, opts)
        if (opts.opacity !== undefined) {
            updateMaterialOpacity(this._shadowMat, opts.opacity)
        }
    }


    /**
     * Create shadow for a text handle
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    createShadowsForText(textHandle, options = {}) {
        this._createOrUpdateShadow(textHandle, options)
    }


    /**
     * Re-measure/update the shadow for a text handle (e.g. when content changes)
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    refreshShadowsForText(textHandle, options = {}) {
        this._createOrUpdateShadow(textHandle, options)
    }


    /** @internal */
    _createOrUpdateShadow(textHandle, options) {
        if (!this._initialized) this.initialize()
        if (options === false) {
            this.removeShadows(textHandle._id)
            return
        }

        var opts = Object.assign({}, this.defaultOptions, options)
        if (!opts.enabled) {
            this.removeShadows(textHandle._id)
            return
        }

        var mesh = textHandle.mesh
        if (!mesh) {
            this.removeShadows(textHandle._id)
            return
        }

        var metrics = measureTextMesh(mesh)
        var existing = this._instances.get(textHandle._id)
        if (existing) {
            existing.opts = opts
            existing.width = metrics.width
            existing.depth = metrics.depth
            existing.centerOffsetX = metrics.centerOffsetX
            existing.centerOffsetZ = metrics.centerOffsetZ
            existing.textHandle = textHandle
            return
        }

        // Create shadow instance
        var shadow = this._sourceMesh.createInstance('text_shadow_' + textHandle._id)
        shadow.setEnabled(false)
        this.noa.rendering.addMeshToScene(shadow)

        if (shadow.onDisposeObservable) {
            shadow.onDisposeObservable.add(() => {
                this._instances.delete(textHandle._id)
            })
        }

        // Fix Babylon.js 8 SubMesh issue
        fixBoundingInfo(shadow)

        this._instances.set(textHandle._id, {
            textHandle,
            shadow,
            opts,
            width: metrics.width,
            depth: metrics.depth,
            centerOffsetX: metrics.centerOffsetX,
            centerOffsetZ: metrics.centerOffsetZ,
        })
    }


    /**
     * Update all shadows (call each frame)
     */
    updateShadows() {
        if (!this._initialized) return

        var toRemove = updateShadows(this.noa, this._instances)

        // Cleanup disposed texts
        for (var i = 0; i < toRemove.length; i++) {
            this.removeShadows(toRemove[i])
        }
    }


    /**
     * Remove shadows for a text instance
     * @param {number} textId
     */
    removeShadows(textId) {
        var data = this._instances.get(textId)
        if (!data) return

        if (data.shadow) {
            this.noa.rendering.removeMeshFromScene(data.shadow)
            data.shadow.dispose()
        }
        this._instances.delete(textId)
    }


    /**
     * Check if shadows exist for a text instance
     * @param {number} textId
     * @returns {boolean}
     */
    hasShadows(textId) {
        return this._instances.has(textId)
    }


    /**
     * @internal
     * Called by noa when world origin is rebased.
     * @param {number[]} delta
     */
    _rebaseOrigin(delta) {
        // No action needed - we use mesh.position directly which is
        // already rebased by the rendering system
    }


    /**
     * Dispose all shadows and cleanup
     */
    dispose() {
        for (var id of this._instances.keys()) {
            this.removeShadows(id)
        }
        this._instances.clear()

        disposeShadowResources(this.noa.rendering, this._sourceMesh, this._shadowMat, this._shadowTexture)
        this._sourceMesh = null
        this._shadowMat = null
        this._shadowTexture = null
        this._initialized = false
    }
}
