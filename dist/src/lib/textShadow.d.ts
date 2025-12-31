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
    constructor(noa: import("../index").Engine);
    /** @internal */
    noa: import("../index").Engine;
    /** @internal - Source disc mesh for instancing */
    _sourceMesh: import("@babylonjs/core/Meshes/mesh.js").Mesh;
    /** @internal - Shared shadow material */
    _shadowMat: import("@babylonjs/core/Materials/standardMaterial").StandardMaterial;
    /** @internal - Radial opacity texture */
    _shadowTexture: DynamicTexture;
    /** @internal - Map of textId -> shadow data */
    _shadows: Map<any, any>;
    /** @internal - Whether manager is initialized */
    _initialized: boolean;
    /** Default shadow options */
    defaultOptions: {
        enabled: boolean;
        blur: number;
        opacity: number;
        maxDistance: number;
    };
    /**
     * Initialize the shadow manager (call after scene is ready)
     */
    initialize(): void;
    /**
     * @internal
     */
    _createShadowTexture(scene: any): DynamicTexture;
    /**
     * Update default options
     * @param {Partial<TextShadowOptions>} opts
     */
    setDefaults(opts: Partial<TextShadowOptions>): void;
    /**
     * Create shadow for a text handle
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    createShadowsForText(textHandle: object, options?: TextShadowOptions | boolean): void;
    /**
     * Re-measure/update the shadow for a text handle (e.g. when content changes)
     * @param {object} textHandle
     * @param {TextShadowOptions|boolean} [options]
     */
    refreshShadowsForText(textHandle: object, options?: TextShadowOptions | boolean): void;
    /** @internal */
    _createOrUpdateShadow(textHandle: any, options: any): void;
    /** @internal */
    _measureTextMesh(mesh: any): {
        width: number;
        depth: number;
        centerOffsetX: number;
        centerOffsetZ: number;
    };
    /**
     * Update all shadows (call each frame)
     */
    updateShadows(): void;
    /**
     * Remove shadows for a text instance
     * @param {number} textId
     */
    removeShadows(textId: number): void;
    /**
     * Check if shadows exist for a text instance
     * @param {number} textId
     * @returns {boolean}
     */
    hasShadows(textId: number): boolean;
    /**
     * @internal
     * Called by noa when world origin is rebased.
     * @param {number[]} delta
     */
    _rebaseOrigin(delta: number[]): void;
    /**
     * Dispose all shadows and cleanup
     */
    dispose(): void;
}
export type TextShadowOptions = {
    /**
     * - Whether shadows are enabled
     */
    enabled?: boolean;
    /**
     * - Shadow blur/softness (0-1)
     */
    blur?: number;
    /**
     * - Shadow opacity (0-1)
     */
    opacity?: number;
    /**
     * - Max raycast distance to find ground
     */
    maxDistance?: number;
};
import { DynamicTexture } from './babylonExports.js';
