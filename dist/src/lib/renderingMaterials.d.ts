/**
 * @typedef {object} StandardMaterialOptions
 * @property {number[] | import('@babylonjs/core').Color3} [diffuseColor]
 * @property {number[] | import('@babylonjs/core').Color3} [emissiveColor]
 * @property {number[] | import('@babylonjs/core').Color3} [specularColor]
 * @property {number} [specularPower]
 * @property {number} [alpha]
 * @property {boolean} [wireframe]
 * @property {boolean} [backFaceCulling]
 * @property {number} [maxSimultaneousLights]
 */
/**
 * @typedef {object} ShaderMaterialOptions
 * @property {string[]} [attributes]
 * @property {string[]} [uniforms]
 * @property {string[]} [samplers]
 * @property {string[]} [defines]
 * @property {string[]} [uniformBuffers]
 * @property {boolean} [needInstancing]
 * @property {boolean} [needAlphaBlending]
 * @property {boolean} [backFaceCulling]
 * @property {number} [alphaMode]
 */
/**
 * Material factory helpers.
 * Keeps Babylon material creation details isolated from the main renderer.
 */
export class RenderingMaterials {
    /** @param {import('./rendering').Rendering} rendering */
    constructor(rendering: import("./rendering").Rendering);
    /** @type {import('./rendering').Rendering} */
    rendering: import("./rendering").Rendering;
    /** Access to Babylon MeshBuilder for callers creating primitives */
    get meshBuilder(): {
        CreateBox: typeof import("@babylonjs/core").CreateBox;
        CreateTiledBox: typeof import("@babylonjs/core").CreateTiledBox;
        CreateSphere: typeof import("@babylonjs/core").CreateSphere;
        CreateDisc: typeof import("@babylonjs/core").CreateDisc;
        CreateIcoSphere: typeof import("@babylonjs/core").CreateIcoSphere;
        CreateRibbon: typeof import("@babylonjs/core").CreateRibbon;
        CreateCylinder: typeof import("@babylonjs/core").CreateCylinder;
        CreateTorus: typeof import("@babylonjs/core").CreateTorus;
        CreateTorusKnot: typeof import("@babylonjs/core").CreateTorusKnot;
        CreateLineSystem: typeof import("@babylonjs/core").CreateLineSystem;
        CreateLines: typeof import("@babylonjs/core").CreateLines;
        CreateDashedLines: typeof import("@babylonjs/core").CreateDashedLines;
        ExtrudeShape: typeof import("@babylonjs/core").ExtrudeShape;
        ExtrudeShapeCustom: typeof import("@babylonjs/core").ExtrudeShapeCustom;
        CreateLathe: typeof import("@babylonjs/core").CreateLathe;
        CreateTiledPlane: typeof import("@babylonjs/core").CreateTiledPlane;
        CreatePlane: typeof import("@babylonjs/core").CreatePlane;
        CreateGround: typeof import("@babylonjs/core").CreateGround;
        CreateTiledGround: typeof import("@babylonjs/core").CreateTiledGround;
        CreateGroundFromHeightMap: typeof import("@babylonjs/core").CreateGroundFromHeightMap;
        CreatePolygon: typeof import("@babylonjs/core").CreatePolygon;
        ExtrudePolygon: typeof import("@babylonjs/core").ExtrudePolygon;
        CreateTube: typeof import("@babylonjs/core").CreateTube;
        CreatePolyhedron: typeof import("@babylonjs/core").CreatePolyhedron;
        CreateGeodesic: typeof import("@babylonjs/core").CreateGeodesic;
        CreateGoldberg: typeof import("@babylonjs/core").CreateGoldberg;
        CreateDecal: typeof import("@babylonjs/core").CreateDecal;
        CreateCapsule: typeof import("@babylonjs/core").CreateCapsule;
        CreateText: typeof import("@babylonjs/core").CreateText;
    };
    /** Create a flat, non-specular StandardMaterial using noa defaults */
    makeStandardMaterial(name: any): StandardMaterial;
    /**
     * Convenience factory for StandardMaterial with common options.
     * @param {string} name
     * @param {StandardMaterialOptions} [options]
     * @returns {import('@babylonjs/core').StandardMaterial}
     */
    createStandardMaterial(name: string, options?: StandardMaterialOptions): import("@babylonjs/core").StandardMaterial;
    /**
     * Convenience factory for ShaderMaterial with common defaults.
     * @param {string} name
     * @param {string} vertexSource
     * @param {string} fragmentSource
     * @param {ShaderMaterialOptions} [options]
     * @returns {import('@babylonjs/core').ShaderMaterial}
     */
    createShaderMaterial(name: string, vertexSource: string, fragmentSource: string, options?: ShaderMaterialOptions): import("@babylonjs/core").ShaderMaterial;
}
export type StandardMaterialOptions = {
    diffuseColor?: number[] | import("@babylonjs/core").Color3;
    emissiveColor?: number[] | import("@babylonjs/core").Color3;
    specularColor?: number[] | import("@babylonjs/core").Color3;
    specularPower?: number;
    alpha?: number;
    wireframe?: boolean;
    backFaceCulling?: boolean;
    maxSimultaneousLights?: number;
};
export type ShaderMaterialOptions = {
    attributes?: string[];
    uniforms?: string[];
    samplers?: string[];
    defines?: string[];
    uniformBuffers?: string[];
    needInstancing?: boolean;
    needAlphaBlending?: boolean;
    backFaceCulling?: boolean;
    alphaMode?: number;
};
import { StandardMaterial } from './babylonExports.js';
