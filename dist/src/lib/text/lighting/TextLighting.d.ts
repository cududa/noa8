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
    constructor(noa: import("../../../index").Engine, opts?: object);
    /** @internal */
    noa: import("../../../index").Engine;
    /** @internal */
    _disposed: boolean;
    /** Whether camera-relative lighting is enabled */
    _enabled: boolean;
    /** Current preset name */
    _preset: any;
    /** Custom azimuth offset (degrees) - used when preset is 'custom' */
    _customAzimuth: any;
    /** Custom elevation offset (degrees) - used when preset is 'custom' */
    _customElevation: any;
    /** Light intensity */
    _intensity: any;
    /** Distance beyond which text falls back to world lighting */
    _lodDistance: any;
    /** Hysteresis buffer to prevent LOD flickering */
    _lodHysteresis: any;
    _diffuse: any;
    _specular: any;
    _isolateFromSceneAmbient: any;
    _ambientIntensity: any;
    _ambientColor: any;
    /** @type {import('@babylonjs/core').DirectionalLight|null} */
    _textLight: import("@babylonjs/core").DirectionalLight | null;
    /** @type {import('@babylonjs/core').HemisphericLight|null} */
    _textAmbient: import("@babylonjs/core").HemisphericLight | null;
    _meshRegistry: MeshRegistry;
    _meshDisposeObservers: WeakMap<object, any>;
    _sceneLightObserver: any;
    _lodDistanceSq: number;
    /** @internal */
    _initWhenReady(): void;
    /** @internal */
    _createLight(): void;
    /**
     * Get the text light (for external configuration)
     * @returns {import('@babylonjs/core').DirectionalLight|null}
     */
    getLight(): import("@babylonjs/core").DirectionalLight | null;
    /**
     * Enable or disable camera-relative text lighting.
     * @param {boolean} enabled
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if camera-relative lighting is enabled
     * @returns {boolean}
     */
    isEnabled(): boolean;
    /**
     * Set the lighting preset
     * @param {'above-front' | 'headlamp' | 'above-left' | 'above-right' | 'custom'} preset
     */
    setPreset(preset: "above-front" | "headlamp" | "above-left" | "above-right" | "custom"): void;
    /**
     * Get the current preset
     * @returns {string}
     */
    getPreset(): string;
    /**
     * Get available preset names
     * @returns {string[]}
     */
    getPresetNames(): string[];
    /**
     * Set custom azimuth and elevation offsets (for 'custom' preset mode)
     * @param {number} azimuthDeg - Horizontal offset in degrees (-180 to 180)
     * @param {number} elevationDeg - Vertical offset in degrees (-89 to 89)
     */
    setOffsets(azimuthDeg: number, elevationDeg: number): void;
    /**
     * Get current offsets
     * @returns {{azimuth: number, elevation: number}}
     */
    getOffsets(): {
        azimuth: number;
        elevation: number;
    };
    /**
     * Set light intensity
     * @param {number} intensity
     */
    setIntensity(intensity: number): void;
    /**
     * Get light intensity
     * @returns {number}
     */
    getIntensity(): number;
    /**
     * Set LOD distance threshold
     * @param {number} distance - Distance in world units
     */
    setLODDistance(distance: number): void;
    /**
     * Get LOD distance threshold
     * @returns {number}
     */
    getLODDistance(): number;
    /**
     * Set whether text should be isolated from scene ambient color.
     * @param {boolean} isolated
     */
    setIsolateFromSceneAmbient(isolated: boolean): void;
    /**
     * Check if text is isolated from scene ambient color
     * @returns {boolean}
     */
    isIsolatedFromSceneAmbient(): boolean;
    /**
     * Set text-specific ambient light intensity
     * @param {number} intensity
     */
    setAmbientIntensity(intensity: number): void;
    /**
     * Get text-specific ambient light intensity
     * @returns {number}
     */
    getAmbientIntensity(): number;
    /**
     * Register a text mesh with the lighting system.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    addTextMesh(mesh: import("@babylonjs/core").Mesh): void;
    /**
     * Unregister a text mesh from the lighting system.
     * @param {import('@babylonjs/core').Mesh} mesh
     */
    removeTextMesh(mesh: import("@babylonjs/core").Mesh): void;
    /**
     * Per-frame update. Updates light direction and handles LOD switching.
     */
    update(): void;
    /** @internal */
    _updateAllMeshLOD(): void;
    /** @internal */
    _switchToTextLight(mesh: any): void;
    /** @internal */
    _switchToWorldLight(mesh: any): void;
    /** @internal */
    _handleNewSceneLight(light: any): void;
    /**
     * Dispose the lighting system
     */
    dispose(): void;
}
import { MeshRegistry } from './MeshRegistry.js';
