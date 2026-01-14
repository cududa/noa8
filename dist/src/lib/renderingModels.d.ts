/**
 * @typedef {object} LoadModelOptions
 * @property {number | [number, number, number]} [scale]
 * @property {boolean} [convertToStandard]
 * @property {(material: import('@babylonjs/core').Material, mesh: import('@babylonjs/core').AbstractMesh) => import('@babylonjs/core').Material} [onMaterialLoaded]
 * @property {boolean} [registerMeshes]
 */
/**
 * @typedef {object} LoadedModel
 * @property {import('@babylonjs/core').AbstractMesh} rootMesh
 * @property {import('@babylonjs/core').AbstractMesh[]} meshes
 * @property {import('@babylonjs/core').Skeleton[]} skeletons
 * @property {import('@babylonjs/core').AnimationGroup[]} animationGroups
 * @property {() => void} cleanup
 */
export class RenderingModels {
    /** @param {import('./rendering').Rendering} rendering */
    constructor(rendering: import("./rendering").Rendering);
    /** @type {import('./rendering').Rendering} */
    rendering: import("./rendering").Rendering;
    /**
     * Load a GLB/glTF model and register its meshes with noa.
     * @param {string} url
     * @param {LoadModelOptions} [options]
     * @returns {Promise<LoadedModel>}
     */
    loadModel(url: string, options?: LoadModelOptions): Promise<LoadedModel>;
}
export type LoadModelOptions = {
    scale?: number | [number, number, number];
    convertToStandard?: boolean;
    onMaterialLoaded?: (material: import("@babylonjs/core").Material, mesh: import("@babylonjs/core").AbstractMesh) => import("@babylonjs/core").Material;
    registerMeshes?: boolean;
};
export type LoadedModel = {
    rootMesh: import("@babylonjs/core").AbstractMesh;
    meshes: import("@babylonjs/core").AbstractMesh[];
    skeletons: import("@babylonjs/core").Skeleton[];
    animationGroups: import("@babylonjs/core").AnimationGroup[];
    cleanup: () => void;
};
