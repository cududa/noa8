/**
 * Factory for creating and configuring text lighting.
 */
/**
 * @typedef {object} LightConfig
 * @property {number} intensity - Light intensity
 * @property {Color3} diffuse - Diffuse color
 * @property {Color3} specular - Specular color
 * @property {number} ambientIntensity - Ambient light intensity
 * @property {Color3} ambientColor - Ambient light color
 */
/**
 * @typedef {object} CreatedLights
 * @property {DirectionalLight} textLight - Main directional light
 * @property {HemisphericLight} textAmbient - Ambient fill light
 */
/**
 * Create the text lighting setup.
 * @param {object} scene - Babylon scene
 * @param {LightConfig} config - Light configuration
 * @returns {CreatedLights}
 */
export function createLights(scene: object, config: LightConfig): CreatedLights;
/**
 * Dispose lights and clean up.
 * @param {DirectionalLight|null} textLight
 * @param {HemisphericLight|null} textAmbient
 */
export function disposeLights(textLight: DirectionalLight | null, textAmbient: HemisphericLight | null): void;
/**
 * Add mesh to light's includedOnlyMeshes array if not already present.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 */
export function addMeshToLight(light: object, mesh: object): void;
/**
 * Remove mesh from light's includedOnlyMeshes array.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 */
export function removeMeshFromLight(light: object, mesh: object): void;
export type LightConfig = {
    /**
     * - Light intensity
     */
    intensity: number;
    /**
     * - Diffuse color
     */
    diffuse: Color3;
    /**
     * - Specular color
     */
    specular: Color3;
    /**
     * - Ambient light intensity
     */
    ambientIntensity: number;
    /**
     * - Ambient light color
     */
    ambientColor: Color3;
};
export type CreatedLights = {
    /**
     * - Main directional light
     */
    textLight: DirectionalLight;
    /**
     * - Ambient fill light
     */
    textAmbient: HemisphericLight;
};
import { DirectionalLight } from '../../babylonExports.js';
import { HemisphericLight } from '../../babylonExports.js';
import { Color3 } from '../../babylonExports.js';
