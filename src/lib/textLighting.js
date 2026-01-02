/**
 * TextLighting - Camera-relative lighting system for 3D text
 *
 * Creates a dedicated DirectionalLight that follows the camera,
 * ensuring consistent edge definition on extruded text from all viewing angles.
 * Critical for dyslexic accessibility.
 */

import { DirectionalLight, HemisphericLight, Vector3, Color3, Quaternion } from './babylonExports.js'

// Light direction presets (azimuth, elevation relative to camera forward)
const PRESETS = {
    'above-front': { azimuth: 0, elevation: -45 },      // Classic readability
    'headlamp': { azimuth: 0, elevation: 0 },           // From camera position
    'above-left': { azimuth: -45, elevation: -45 },     // Dramatic left shadows
    'above-right': { azimuth: 45, elevation: -45 },     // Dramatic right shadows
}

const DEG_TO_RAD = Math.PI / 180

// Reusable vectors for calculations (avoid per-frame allocations)
const _tempForward = new Vector3()
const _tempRight = new Vector3()
const _tempLightDir = new Vector3()
const _tempQuat = new Quaternion()


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
     * @param {import('../index').Engine} noa - The noa engine instance
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
        // so scene.ambientColor has no effect on text
        this._isolateFromSceneAmbient = opts.isolateFromSceneAmbient ?? false

        // Text-specific ambient light settings
        this._ambientIntensity = opts.ambientIntensity !== undefined ? opts.ambientIntensity : 0.2
        this._ambientColor = opts.ambientColor || new Color3(1, 1, 1)

        // The dedicated text light
        /** @type {DirectionalLight|null} */
        this._textLight = null

        // Text-specific ambient/fill light (HemisphericLight)
        /** @type {HemisphericLight|null} */
        this._textAmbient = null

        // Track all text meshes and their LOD state
        /** @type {Set<import('@babylonjs/core').Mesh>} */
        this._allTextMeshes = new Set()
        /** @type {WeakMap<import('@babylonjs/core').Mesh, boolean>} */
        this._meshUsingTextLight = new WeakMap()

        // Track observer for scene light changes so new lights don't re-light text meshes
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
        const scene = this.noa.rendering.getScene()
        if (!scene) return

        // Create directional text light (camera-relative)
        this._textLight = new DirectionalLight('textLight', new Vector3(0, -1, 0.5), scene)
        this._textLight.intensity = this._intensity
        this._textLight.diffuse = this._diffuse.clone()
        this._textLight.specular = this._specular.clone()

        // Initially, no meshes are included (empty array means light affects nothing)
        this._textLight.includedOnlyMeshes = []

        // Create text-specific ambient/fill light
        this._textAmbient = new HemisphericLight('textAmbient', new Vector3(0, 1, 0), scene)
        this._textAmbient.intensity = this._ambientIntensity
        this._textAmbient.diffuse = this._ambientColor.clone()
        this._textAmbient.groundColor = new Color3(0.1, 0.1, 0.1)
        this._textAmbient.specular = new Color3(0, 0, 0)
        this._textAmbient.includedOnlyMeshes = []

        // Watch for new scene lights (ambient, dev lights, etc.) so we can keep meshes isolated
        this._registerSceneLightObserver(scene)

        console.log('[noa.text] TextLighting initialized with preset:', this._preset, 'isolateFromSceneAmbient:', this._isolateFromSceneAmbient)
    }


    /**
     * Get the text light (for external configuration)
     * @returns {DirectionalLight|null}
     */
    getLight() {
        return this._textLight
    }


    /**
     * Enable or disable camera-relative text lighting.
     * When disabled, text uses world lighting.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled
        if (!enabled) {
            // Move all meshes to world lighting
            for (const mesh of this._allTextMeshes) {
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
        if (preset !== 'custom' && !PRESETS[preset]) {
            console.warn('[noa.text] Unknown preset:', preset, '- using above-front')
            preset = 'above-front'
        }
        this._preset = preset
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
        return [...Object.keys(PRESETS), 'custom']
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
        if (this._preset === 'custom') {
            return { azimuth: this._customAzimuth, elevation: this._customElevation }
        }
        return PRESETS[this._preset] || PRESETS['above-front']
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
     * When true, text materials have their ambient color zeroed so scene.ambientColor has no effect.
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
     * Called automatically by Text class when creating text.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    addTextMesh(mesh) {
        if (!mesh || this._allTextMeshes.has(mesh)) return

        this._allTextMeshes.add(mesh)

        // Start with text light if enabled and within LOD distance
        if (this._enabled && this._textLight) {
            const camPos = this.noa.camera.getPosition()
            const meshPos = mesh.absolutePosition || mesh.position
            const distSq = this._distanceSquared(camPos, meshPos)

            if (distSq < this._lodDistanceSq) {
                this._switchToTextLight(mesh)
            } else {
                this._switchToWorldLight(mesh)
            }
        }
    }


    /**
     * Unregister a text mesh from the lighting system.
     * Called automatically by TextHandle.dispose().
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    removeTextMesh(mesh) {
        if (!mesh) return

        this._allTextMeshes.delete(mesh)
        this._meshUsingTextLight.delete(mesh)

        // Remove from text light's includedOnlyMeshes
        if (this._textLight && this._textLight.includedOnlyMeshes) {
            const idx = this._textLight.includedOnlyMeshes.indexOf(mesh)
            if (idx >= 0) {
                this._textLight.includedOnlyMeshes.splice(idx, 1)
            }
        }

        // Re-include in main light (cleanup)
        this.noa.rendering.includeMeshInMainLight(mesh, false)
    }


    /**
     * Per-frame update. Updates light direction and handles LOD switching.
     * Called from Text class render observer.
     */
    update() {
        if (this._disposed || !this._textLight || !this._enabled) return

        // Update light direction based on camera
        this._updateLightDirection()

        // Update LOD for all meshes
        this._updateAllMeshLOD()
    }


    /** @internal */
    _updateLightDirection() {
        const camera = this.noa.camera
        if (!camera) return

        // Get camera forward direction (vec3 array)
        const camDir = camera.getDirection()
        _tempForward.copyFromFloats(camDir[0], camDir[1], camDir[2])

        // Get offsets from preset or custom
        const { azimuth, elevation } = this.getOffsets()
        const azRad = azimuth * DEG_TO_RAD
        const elRad = elevation * DEG_TO_RAD

        // Calculate right vector (cross of up and forward)
        Vector3.CrossToRef(Vector3.Up(), _tempForward, _tempRight)
        _tempRight.normalize()

        // Start with forward direction
        _tempLightDir.copyFrom(_tempForward)

        // Rotate by azimuth around world Y axis
        if (azRad !== 0) {
            Quaternion.RotationAxisToRef(Vector3.Up(), azRad, _tempQuat)
            _tempLightDir.rotateByQuaternionToRef(_tempQuat, _tempLightDir)
        }

        // Rotate by elevation around camera's right axis
        if (elRad !== 0) {
            Quaternion.RotationAxisToRef(_tempRight, elRad, _tempQuat)
            _tempLightDir.rotateByQuaternionToRef(_tempQuat, _tempLightDir)
        }

        // Light direction points FROM light source TO object (negate for "light shining on text")
        this._textLight.direction.copyFromFloats(
            -_tempLightDir.x,
            -_tempLightDir.y,
            -_tempLightDir.z
        )
    }


    /** @internal */
    _updateAllMeshLOD() {
        if (!this._enabled || !this._textLight) return

        const camPos = this.noa.camera.getPosition()
        const lodSq = this._lodDistanceSq
        const hystSq = this._lodHysteresisSq

        for (const mesh of this._allTextMeshes) {
            // Skip disposed meshes
            if (mesh.isDisposed && mesh.isDisposed()) {
                this._allTextMeshes.delete(mesh)
                continue
            }

            const meshPos = mesh.absolutePosition || mesh.position
            const distSq = this._distanceSquared(camPos, meshPos)
            const usingTextLight = this._meshUsingTextLight.get(mesh) || false

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
        if (this._meshUsingTextLight.get(mesh)) return // Already using text light

        // Add to text light's includedOnlyMeshes
        if (this._textLight.includedOnlyMeshes.indexOf(mesh) === -1) {
            this._textLight.includedOnlyMeshes.push(mesh)
        }

        // Add to text ambient's includedOnlyMeshes
        if (this._textAmbient && this._textAmbient.includedOnlyMeshes.indexOf(mesh) === -1) {
            this._textAmbient.includedOnlyMeshes.push(mesh)
        }

        // Exclude from main world light (sun)
        this.noa.rendering.excludeMeshFromMainLight(mesh, false)

        // Exclude from all other scene lights (ambient, etc.)
        this._excludeFromAllWorldLights(mesh)

        this._meshUsingTextLight.set(mesh, true)
    }


    /** @internal */
    _switchToWorldLight(mesh) {
        if (!mesh) return
        if (!this._meshUsingTextLight.get(mesh)) return // Already using world light

        // Remove from text light's includedOnlyMeshes
        if (this._textLight && this._textLight.includedOnlyMeshes) {
            const idx = this._textLight.includedOnlyMeshes.indexOf(mesh)
            if (idx >= 0) {
                this._textLight.includedOnlyMeshes.splice(idx, 1)
            }
        }

        // Remove from text ambient's includedOnlyMeshes
        if (this._textAmbient && this._textAmbient.includedOnlyMeshes) {
            const idx = this._textAmbient.includedOnlyMeshes.indexOf(mesh)
            if (idx >= 0) {
                this._textAmbient.includedOnlyMeshes.splice(idx, 1)
            }
        }

        // Re-include in main world light
        this.noa.rendering.includeMeshInMainLight(mesh, false)

        // Re-include in all other scene lights
        this._includeInAllWorldLights(mesh)

        this._meshUsingTextLight.set(mesh, false)
    }


    /** @internal - Exclude mesh from all world lights except text lights */
    _excludeFromAllWorldLights(mesh) {
        const scene = this.noa.rendering.getScene()
        if (!scene) return

        for (const light of scene.lights) {
            this._excludeLightFromMesh(light, mesh)
        }
    }


    /** @internal - Re-include mesh in all world lights */
    _includeInAllWorldLights(mesh) {
        const scene = this.noa.rendering.getScene()
        if (!scene) return

        for (const light of scene.lights) {
            // Skip text lights
            if (light === this._textLight) continue
            if (light === this._textAmbient) continue
            // Skip character light
            if (light.name === 'characterKey') continue

            // Remove from excludedMeshes if present
            if (light.excludedMeshes) {
                const idx = light.excludedMeshes.indexOf(mesh)
                if (idx >= 0) {
                    light.excludedMeshes.splice(idx, 1)
                }
            }
        }
    }


    /** @internal */
    _registerSceneLightObserver(scene) {
        if (!scene || this._sceneLightObserver) return

        this._sceneLightObserver = scene.onNewLightAddedObservable.add((light) => {
            this._handleNewSceneLight(light)
        })
    }


    /** @internal */
    _handleNewSceneLight(light) {
        if (this._shouldIgnoreLight(light)) return

        for (const mesh of this._allTextMeshes) {
            if (this._meshUsingTextLight.get(mesh)) {
                this._excludeLightFromMesh(light, mesh)
            }
        }
    }


    /** @internal */
    _shouldIgnoreLight(light) {
        if (!light) return true
        if (light === this._textLight) return true
        if (light === this._textAmbient) return true
        if (light.name === 'characterKey') return true
        return false
    }


    /** @internal */
    _excludeLightFromMesh(light, mesh) {
        if (!light || !mesh) return
        if (this._shouldIgnoreLight(light)) return

        if (!light.excludedMeshes) {
            light.excludedMeshes = []
        }
        if (light.excludedMeshes.indexOf(mesh) === -1) {
            light.excludedMeshes.push(mesh)
        }
    }


    /** @internal - Calculate squared distance between camera position (array) and mesh position (Vector3) */
    _distanceSquared(camPos, meshPos) {
        const dx = camPos[0] - meshPos.x
        const dy = camPos[1] - meshPos.y
        const dz = camPos[2] - meshPos.z
        return dx * dx + dy * dy + dz * dz
    }


    /**
     * Dispose the lighting system
     */
    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Clear all mesh registrations and re-include in world lights
        for (const mesh of this._allTextMeshes) {
            this.noa.rendering.includeMeshInMainLight(mesh, false)
            this._includeInAllWorldLights(mesh)
        }
        this._allTextMeshes.clear()

        // Dispose the lights
        if (this._textLight) {
            this._textLight.dispose()
            this._textLight = null
        }
        if (this._textAmbient) {
            this._textAmbient.dispose()
            this._textAmbient = null
        }

        const scene = this.noa.rendering.getScene()
        if (scene && this._sceneLightObserver) {
            scene.onNewLightAddedObservable.remove(this._sceneLightObserver)
            this._sceneLightObserver = null
        }

        console.log('[noa.text] TextLighting disposed')
    }
}
