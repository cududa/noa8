/**
 * TextShadowManager - Simple shadow system for 3D text
 *
 * Follows the same pattern as the entity shadow component:
 * - Use mesh.position directly (already in local coords)
 * - Raycast down to find ground
 * - Position shadow at ground level
 * - No complex coordinate conversions
 */

import * as vec3 from 'gl-vec3'
import { CreateDisc, DynamicTexture, Texture } from './babylonExports.js'

var down = vec3.fromValues(0, -1, 0)


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
     * @param {import('../index').Engine} noa
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

        /** @internal - Map of textId -> shadow data */
        this._shadows = new Map()

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

        // Create source disc mesh
        this._sourceMesh = CreateDisc('text_shadow_source', {
            radius: 0.5,
            tessellation: 16,
        }, scene)
        this._sourceMesh.rotation.x = Math.PI / 2

        // Create shadow material
        this._shadowMat = this.noa.rendering.makeStandardMaterial('text_shadow_mat')
        this._shadowMat.diffuseColor.set(0, 0, 0)
        this._shadowMat.ambientColor.set(0, 0, 0)
        this._shadowMat.emissiveColor.set(0, 0, 0)
        this._shadowMat.specularColor.set(0, 0, 0)
        this._shadowMat.backFaceCulling = false
        this._shadowMat.alpha = this.defaultOptions.opacity

        // Create radial texture for soft edges
        this._shadowTexture = this._createShadowTexture(scene)
        if (this._shadowTexture) {
            this._shadowTexture.hasAlpha = true
            this._shadowMat.opacityTexture = this._shadowTexture
        }

        this._shadowMat.freeze()
        this._sourceMesh.material = this._shadowMat

        // Fix Babylon.js 8 SubMesh.getBoundingInfo() issue
        this._sourceMesh.refreshBoundingInfo()
        var bi = this._sourceMesh.getBoundingInfo()
        if (this._sourceMesh.subMeshes && bi) {
            this._sourceMesh.subMeshes.forEach(sm => {
                /** @type {any} */ (sm)._boundingInfo = bi
            })
        }

        // Hide source mesh
        this.noa.rendering.setMeshVisibility(this._sourceMesh, false)
    }


    /**
     * @internal
     */
    _createShadowTexture(scene) {
        try {
            var size = 128
            var texture = new DynamicTexture('text_shadow_texture', { width: size, height: size }, scene, false, Texture.BILINEAR_SAMPLINGMODE)
            var ctx = texture.getContext()
            if (ctx) {
                var half = size / 2
                var gradient = ctx.createRadialGradient(half, half, half * 0.2, half, half, half)
                gradient.addColorStop(0, 'rgba(255,255,255,1)')
                gradient.addColorStop(1, 'rgba(255,255,255,0)')
                ctx.clearRect(0, 0, size, size)
                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, size, size)
                texture.update(false)
            }
            texture.wrapU = Texture.CLAMP_ADDRESSMODE
            texture.wrapV = Texture.CLAMP_ADDRESSMODE
            return texture
        } catch (err) {
            return null
        }
    }


    /**
     * Update default options
     * @param {Partial<TextShadowOptions>} opts
     */
    setDefaults(opts) {
        Object.assign(this.defaultOptions, opts)
        if (opts.opacity !== undefined && this._shadowMat) {
            this._shadowMat.unfreeze()
            this._shadowMat.alpha = opts.opacity
            this._shadowMat.freeze()
        }
    }


    /**
     * Create shadow for a text handle
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    createShadowsForText(textHandle, options = {}) {
        if (!this._initialized) this.initialize()
        if (options === false) return

        var opts = Object.assign({}, this.defaultOptions, options)
        if (!opts.enabled) return

        var mesh = textHandle.mesh
        if (!mesh) return

        // Create shadow instance
        var shadow = this._sourceMesh.createInstance('text_shadow_' + textHandle._id)
        shadow.setEnabled(false)
        this.noa.rendering.addMeshToScene(shadow)

        // Fix Babylon.js 8 SubMesh issue
        var bi = this._sourceMesh.getBoundingInfo()
        if (shadow.subMeshes && bi) {
            shadow.subMeshes.forEach(sm => {
                /** @type {any} */ (sm)._boundingInfo = bi
            })
        }

        // Measure text size and center offset once at creation
        var width = 1
        var depth = 0.3
        var centerOffsetX = 0
        var centerOffsetZ = 0

        mesh.computeWorldMatrix(true)
        mesh.refreshBoundingInfo()
        var boundingInfo = mesh.getBoundingInfo()
        if (boundingInfo && boundingInfo.boundingBox) {
            var bb = boundingInfo.boundingBox
            width = Math.max(0.5, bb.extendSize.x * 2)
            depth = Math.max(0.2, bb.extendSize.z * 2, width * 0.15)

            // Compute offset from mesh origin to visual center in SCENE coords
            // This is constant and doesn't change with rebase
            centerOffsetX = bb.centerWorld.x - mesh.position.x
            centerOffsetZ = bb.centerWorld.z - mesh.position.z
        }

        this._shadows.set(textHandle._id, {
            textHandle,
            shadow,
            opts,
            width,
            depth,
            centerOffsetX,
            centerOffsetZ,
        })
    }


    /**
     * Update all shadows (call each frame)
     */
    updateShadows() {
        if (!this._initialized) return

        var toRemove = []

        for (var [id, data] of this._shadows) {
            var textMesh = data.textHandle.mesh
            if (!textMesh || data.textHandle._disposed) {
                toRemove.push(id)
                continue
            }

            // Use mesh.position (properly rebased) + stored center offset
            // This avoids centerWorld which has timing issues after rebase
            var pos = textMesh.position
            var localX = pos.x + data.centerOffsetX
            var localY = pos.y
            var localZ = pos.z + data.centerOffsetZ

            // Raycast down to find ground
            var pickPos = [localX, localY, localZ]
            var result = this.noa._localPick(pickPos, down, data.opts.maxDistance)

            if (!result) {
                data.shadow.setEnabled(false)
                continue
            }

            // Convert ground Y from world to local
            var localGroundY = result.position[1] - this.noa.worldOriginOffset[1]
            var height = localY - localGroundY

            // Fade out when too high
            var heightFade = 1 - Math.min(height / data.opts.maxDistance, 1)
            if (heightFade < 0.05) {
                data.shadow.setEnabled(false)
                continue
            }

            // Position and scale shadow
            var blur = data.opts.blur
            var scaleFactor = 0.75 + heightFade * 0.25

            data.shadow.position.x = localX
            data.shadow.position.y = localGroundY + 0.02 + blur * 0.01
            data.shadow.position.z = localZ

            data.shadow.scaling.x = data.width * (0.9 + blur * 0.6) * scaleFactor
            data.shadow.scaling.z = data.depth * (0.5 + blur * 0.5) * scaleFactor
            data.shadow.setEnabled(true)
        }

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
        var data = this._shadows.get(textId)
        if (!data) return

        if (data.shadow) {
            this.noa.rendering.removeMeshFromScene(data.shadow)
            data.shadow.dispose()
        }
        this._shadows.delete(textId)
    }


    /**
     * Check if shadows exist for a text instance
     * @param {number} textId
     * @returns {boolean}
     */
    hasShadows(textId) {
        return this._shadows.has(textId)
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
        for (var id of this._shadows.keys()) {
            this.removeShadows(id)
        }
        this._shadows.clear()

        if (this._sourceMesh) {
            this.noa.rendering.removeMeshFromScene(this._sourceMesh)
            this._sourceMesh.dispose()
            this._sourceMesh = null
        }
        if (this._shadowMat) {
            this._shadowMat.dispose()
            this._shadowMat = null
        }
        if (this._shadowTexture) {
            this._shadowTexture.dispose()
            this._shadowTexture = null
        }
        this._initialized = false
    }
}
