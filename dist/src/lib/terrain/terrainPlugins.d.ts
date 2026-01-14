/**
 * Babylon.js material plugins for terrain rendering.
 * @module terrain/terrainPlugins
 */
/**
 * Babylon material plugin - twiddles the defines/shaders/etc so that
 * a standard material can use textures from a 2D texture atlas.
 */
export class TerrainMaterialPlugin extends MaterialPluginBase {
    /**
     * @param {import('@babylonjs/core').Material} material
     * @param {import('@babylonjs/core').Texture} texture
     */
    constructor(material: import("@babylonjs/core").Material, texture: import("@babylonjs/core").Texture);
    /** @type {import('@babylonjs/core').RawTexture2DArray | null} */
    _atlasTextureArray: import("@babylonjs/core").RawTexture2DArray | null;
    /** @type {import('@babylonjs/core').Observer<import('@babylonjs/core').Texture> | null} */
    _textureLoadObserver: import("@babylonjs/core").Observer<import("@babylonjs/core").Texture> | null;
    /**
     * @param {import('@babylonjs/core').Texture} texture
     */
    setTextureArrayData(texture: import("@babylonjs/core").Texture): void;
    prepareDefines(defines: any, scene: any, mesh: any): void;
    getSamplers(samplers: any): void;
    getAttributes(attributes: any): void;
    getUniforms(): {
        ubo: any[];
    };
    bindForSubMesh(uniformBuffer: any, scene: any, engine: any, subMesh: any): void;
    getCustomCode(shaderType: any): {
        CUSTOM_VERTEX_MAIN_BEGIN: string;
        CUSTOM_VERTEX_DEFINITIONS: string;
        '!baseColor\\\\=texture2D\\\\(diffuseSampler,vDiffuseUV\\\\+uvOffset\\\\);'?: undefined;
        CUSTOM_FRAGMENT_DEFINITIONS?: undefined;
    } | {
        '!baseColor\\\\=texture2D\\\\(diffuseSampler,vDiffuseUV\\\\+uvOffset\\\\);': string;
        CUSTOM_FRAGMENT_DEFINITIONS: string;
        CUSTOM_VERTEX_MAIN_BEGIN?: undefined;
        CUSTOM_VERTEX_DEFINITIONS?: undefined;
    };
}
/**
 * Flow Animation Plugin - adds vertex offset for conveyor belt effect.
 * Uses simple repeating pattern mode where offset wraps every patternLength blocks.
 */
export class FlowAnimationPlugin extends MaterialPluginBase {
    /**
     * @param {import('@babylonjs/core').Material} material
     * @param {number} flowSpeed
     * @param {number[]} flowDirection
     * @param {number} [patternLength=10]
     */
    constructor(material: import("@babylonjs/core").Material, flowSpeed: number, flowDirection: number[], patternLength?: number);
    /** @type {number} */
    _flowSpeed: number;
    /** @type {number[]} */
    _flowDirection: number[];
    /** @type {number} */
    _patternLength: number;
    /** @type {number} */
    _time: number;
    /** @type {import('@babylonjs/core').Observer<import('@babylonjs/core').Scene> | null} */
    _renderObserver: import("@babylonjs/core").Observer<import("@babylonjs/core").Scene> | null;
    prepareDefines(defines: any, scene: any, mesh: any): void;
    getUniforms(): {
        ubo: {
            name: string;
            size: number;
            type: string;
        }[];
    };
    bindForSubMesh(uniformBuffer: any, scene: any, engine: any, subMesh: any): void;
    getCustomCode(shaderType: any): {
        CUSTOM_VERTEX_DEFINITIONS: string;
        CUSTOM_VERTEX_UPDATE_POSITION: string;
    };
}
import { MaterialPluginBase } from '../babylonExports.js';
