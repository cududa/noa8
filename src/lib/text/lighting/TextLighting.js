/**
 * TextLighting - Camera-relative lighting system for 3D text
 *
 * Creates a dedicated DirectionalLight that follows the camera,
 * ensuring consistent edge definition on extruded text from all viewing angles.
 * Critical for dyslexic accessibility.
 */

import { Color3 } from '../../babylonExports.js'
import { PRESETS, getPresetNames, validatePreset, getOffsets } from './LightPresets.js'
import { createLights, disposeLights, addMeshToLight, removeMeshFromLight } from './LightFactory.js'
import { MeshRegistry } from './MeshRegistry.js'
import {
    registerSceneLightObserver,
    unregisterSceneLightObserver,
    excludeMeshFromLight,
    excludeMeshFromAllWorldLights,
    includeMeshInAllWorldLights
} from './SceneLightIsolation.js'
import { updateLightDirection, distanceSquared } from './DirectionController.js'
import { log } from '../logging.js'


/**
 * TextLighting manages a camera-relative light for all text meshes.
 *
 * Usage:
 * - Text system creates this automatically
 * - Meshes are registered via addTextMesh() when text is created
 * - Light direction updates each frame based on camera angle + preset/custom offsets
 * - LOD switching moves distant text to world lighting for performance
 */
export class TextLighting {

    /**
     * @param {import('../../../index').Engine} noa - The noa engine instance
     * @param {object} [opts] - Configuration options
     */
    constructor(noa, opts = {}) {
        /** @internal */
        this.noa = noa
        /** @internal */
        this._disposed = false

        // Configuration
        /** Whether camera-relative lighting is enabled */
        this._enabled = opts.enabled !== false
        /** Current preset name */
        this._preset = opts.preset || 'above-front'
        /** Custom azimuth offset (degrees) - used when preset is 'custom' */
        this._customAzimuth = opts.customAzimuthDeg || 0
        /** Custom elevation offset (degrees) - used when preset is 'custom' */
        this._customElevation = opts.customElevationDeg || -45
        /** Light intensity */
        this._intensity = opts.intensity !== undefined ? opts.intensity : 1.0
        /** Distance beyond which text falls back to world lighting */
        this._lodDistance = opts.lodDistance || 50
        /** Hysteresis buffer to prevent LOD flickering */
        this._lodHysteresis = opts.lodHysteresis || 5

        // Light colors
        this._diffuse = opts.diffuse || new Color3(1, 1, 1)
        this._specular = opts.specular || new Color3(0.1, 0.1, 0.1)

        // Scene ambient isolation - when true, text materials have ambient zeroed
        this._isolateFromSceneAmbient = opts.isolateFromSceneAmbient ?? false

        // Text-specific ambient light settings
        this._ambientIntensity = opts.ambientIntensity !== undefined ? opts.ambientIntensity : 0.2
        this._ambientColor = opts.ambientColor || new Color3(1, 1, 1)

        // Lights (created when scene ready)
        /** @type {import('@babylonjs/core').DirectionalLight|null} */
        this._textLight = null
        /** @type {import('@babylonjs/core').HemisphericLight|null} */
        this._textAmbient = null

        // Mesh registry
        this._meshRegistry = new MeshRegistry()

        // Scene light observer
        this._sceneLightObserver = null

        // Squared distances for faster comparisons
        this._lodDistanceSq = this._lodDistance * this._lodDistance
        this._lodHysteresisSq = this._lodHysteresis * this._lodHysteresis

        // Initialize light when scene is ready
        this._initWhenReady()
    }


    /** @internal */
    _initWhenReady() {
        this.noa.rendering.onSceneReady(() => {
            if (this._disposed) return
            this._createLight()
        })
    }


    /** @internal */
    _createLight() {
        var scene = this.noa.rendering.getScene()
        if (!scene) return

        var lights = createLights(scene, {
            intensity: this._intensity,
            diffuse: this._diffuse,
            specular: this._specular,
            ambientIntensity: this._ambientIntensity,
            ambientColor: this._ambientColor
        })

        this._textLight = lights.textLight
        this._textAmbient = lights.textAmbient

        // Watch for new scene lights
        this._sceneLightObserver = registerSceneLightObserver(scene, (light) => {
            this._handleNewSceneLight(light)
        })

        log('TextLighting initialized with preset:', this._preset, 'isolateFromSceneAmbient:', this._isolateFromSceneAmbient)
    }


    /**
     * Get the text light (for external configuration)
     * @returns {import('@babylonjs/core').DirectionalLight|null}
     */
    getLight() {
        return this._textLight
    }


    /**
     * Enable or disable camera-relative text lighting.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled
        if (!enabled) {
            // Move all meshes to world lighting
            for (var mesh of this._meshRegistry) {
                this._switchToWorldLight(mesh)
            }
        } else {
            // Move nearby meshes back to text light
            this._updateAllMeshLOD()
        }
    }


    /**
     * Check if camera-relative lighting is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this._enabled
    }


    /**
     * Set the lighting preset
     * @param {'above-front' | 'headlamp' | 'above-left' | 'above-right' | 'custom'} preset
     */
    setPreset(preset) {
        this._preset = validatePreset(preset)
    }


    /**
     * Get the current preset
     * @returns {string}
     */
    getPreset() {
        return this._preset
    }


    /**
     * Get available preset names
     * @returns {string[]}
     */
    getPresetNames() {
        return getPresetNames()
    }


    /**
     * Set custom azimuth and elevation offsets (for 'custom' preset mode)
     * @param {number} azimuthDeg - Horizontal offset in degrees (-180 to 180)
     * @param {number} elevationDeg - Vertical offset in degrees (-89 to 89)
     */
    setOffsets(azimuthDeg, elevationDeg) {
        this._customAzimuth = azimuthDeg
        this._customElevation = elevationDeg
    }


    /**
     * Get current offsets
     * @returns {{azimuth: number, elevation: number}}
     */
    getOffsets() {
        return getOffsets(this._preset, this._customAzimuth, this._customElevation)
    }


    /**
     * Set light intensity
     * @param {number} intensity
     */
    setIntensity(intensity) {
        this._intensity = intensity
        if (this._textLight) {
            this._textLight.intensity = intensity
        }
    }


    /**
     * Get light intensity
     * @returns {number}
     */
    getIntensity() {
        return this._intensity
    }


    /**
     * Set LOD distance threshold
     * @param {number} distance - Distance in world units
     */
    setLODDistance(distance) {
        this._lodDistance = distance
        this._lodDistanceSq = distance * distance
    }


    /**
     * Get LOD distance threshold
     * @returns {number}
     */
    getLODDistance() {
        return this._lodDistance
    }


    /**
     * Set whether text should be isolated from scene ambient color.
     * @param {boolean} isolated
     */
    setIsolateFromSceneAmbient(isolated) {
        this._isolateFromSceneAmbient = isolated
    }


    /**
     * Check if text is isolated from scene ambient color
     * @returns {boolean}
     */
    isIsolatedFromSceneAmbient() {
        return this._isolateFromSceneAmbient
    }


    /**
     * Set text-specific ambient light intensity
     * @param {number} intensity
     */
    setAmbientIntensity(intensity) {
        this._ambientIntensity = intensity
        if (this._textAmbient) {
            this._textAmbient.intensity = intensity
        }
    }


    /**
     * Get text-specific ambient light intensity
     * @returns {number}
     */
    getAmbientIntensity() {
        return this._ambientIntensity
    }


    /**
     * Register a text mesh with the lighting system.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    addTextMesh(mesh) {
        if (!mesh || this._meshRegistry.has(mesh)) return

        this._meshRegistry.add(mesh)

        // Start with text light if enabled and within LOD distance
        if (this._enabled && this._textLight) {
            var camPos = this.noa.camera.getPosition()
            var meshPos = mesh.absolutePosition || mesh.position
            var distSq = distanceSquared(camPos, meshPos)

            if (distSq < this._lodDistanceSq) {
                this._switchToTextLight(mesh)
            } else {
                this._switchToWorldLight(mesh)
            }
        }
    }


    /**
     * Unregister a text mesh from the lighting system.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    removeTextMesh(mesh) {
        if (!mesh) return

        this._meshRegistry.remove(mesh)

        // Remove from text light's includedOnlyMeshes
        removeMeshFromLight(this._textLight, mesh)

        // Re-include in main light (cleanup)
        this.noa.rendering.includeMeshInMainLight(mesh, false)
    }


    /**
     * Per-frame update. Updates light direction and handles LOD switching.
     */
    update() {
        if (this._disposed || !this._textLight || !this._enabled) return

        // Update light direction based on camera
        var offsets = this.getOffsets()
        updateLightDirection(this._textLight, this.noa.camera, offsets.azimuth, offsets.elevation)

        // Update LOD for all meshes
        this._updateAllMeshLOD()
    }


    /** @internal */
    _updateAllMeshLOD() {
        if (!this._enabled || !this._textLight) return

        var camPos = this.noa.camera.getPosition()
        var lodSq = this._lodDistanceSq
        var hystSq = this._lodHysteresisSq

        // Prune disposed meshes
        this._meshRegistry.pruneDisposed()

        for (var mesh of this._meshRegistry) {
            var meshPos = mesh.absolutePosition || mesh.position
            var distSq = distanceSquared(camPos, meshPos)
            var usingTextLight = this._meshRegistry.getLODState(mesh)

            if (usingTextLight) {
                // Currently on text light - switch to world at lodDistance + hysteresis
                if (distSq > lodSq + hystSq * 2) {
                    this._switchToWorldLight(mesh)
                }
            } else {
                // Currently on world light - switch to text at lodDistance - hysteresis
                if (distSq < lodSq - hystSq * 2) {
                    this._switchToTextLight(mesh)
                }
            }
        }
    }


    /** @internal */
    _switchToTextLight(mesh) {
        if (!this._textLight || !mesh) return
        if (this._meshRegistry.getLODState(mesh)) return // Already using text light

        // Add to text light's includedOnlyMeshes
        addMeshToLight(this._textLight, mesh)

        // Add to text ambient's includedOnlyMeshes
        addMeshToLight(this._textAmbient, mesh)

        // Exclude from main world light (sun)
        this.noa.rendering.excludeMeshFromMainLight(mesh, false)

        // Exclude from all other scene lights
        var scene = this.noa.rendering.getScene()
        excludeMeshFromAllWorldLights(scene, mesh, this._textLight, this._textAmbient)

        this._meshRegistry.setLODState(mesh, true)
    }


    /** @internal */
    _switchToWorldLight(mesh) {
        if (!mesh) return
        if (!this._meshRegistry.getLODState(mesh)) return // Already using world light

        // Remove from text light's includedOnlyMeshes
        removeMeshFromLight(this._textLight, mesh)

        // Remove from text ambient's includedOnlyMeshes
        removeMeshFromLight(this._textAmbient, mesh)

        // Re-include in main world light
        this.noa.rendering.includeMeshInMainLight(mesh, false)

        // Re-include in all other scene lights
        var scene = this.noa.rendering.getScene()
        includeMeshInAllWorldLights(scene, mesh, this._textLight, this._textAmbient)

        this._meshRegistry.setLODState(mesh, false)
    }


    /** @internal */
    _handleNewSceneLight(light) {
        if (!light) return
        if (light === this._textLight) return
        if (light === this._textAmbient) return
        if (light.name === 'characterKey') return

        for (var mesh of this._meshRegistry) {
            if (this._meshRegistry.getLODState(mesh)) {
                excludeMeshFromLight(light, mesh, this._textLight, this._textAmbient)
            }
        }
    }


    /**
     * Dispose the lighting system
     */
    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Clear all mesh registrations and re-include in world lights
        var scene = this.noa.rendering.getScene()
        for (var mesh of this._meshRegistry) {
            this.noa.rendering.includeMeshInMainLight(mesh, false)
            includeMeshInAllWorldLights(scene, mesh, this._textLight, this._textAmbient)
        }
        this._meshRegistry.clear()

        // Dispose the lights
        disposeLights(this._textLight, this._textAmbient)
        this._textLight = null
        this._textAmbient = null

        // Unsubscribe observer
        unregisterSceneLightObserver(scene, this._sceneLightObserver)
        this._sceneLightObserver = null

        log('TextLighting disposed')
    }
}
