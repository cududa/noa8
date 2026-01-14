/**
 * Rendering configuration passed in via the Engine constructor.
 * Options here intentionally mirror the historical monolithic renderer defaults.
 * @typedef {object} RenderingOptions
 * @property {boolean} [showFPS]
 * @property {boolean} [antiAlias]
 * @property {[number, number, number]} [clearColor]
 * @property {[number, number, number]} [ambientColor]
 * @property {[number, number, number]} [lightDiffuse]
 * @property {[number, number, number]} [lightSpecular]
 * @property {[number, number, number]} [lightVector]
 * @property {boolean} [useAO]
 * @property {[number, number, number]} [AOmultipliers]
 * @property {number} [reverseAOmultiplier]
 * @property {boolean} [preserveDrawingBuffer]
 * @property {number} [octreeBlockSize]
 * @property {boolean} [renderOnResize]
 */
/**
 * `noa.rendering` - Manages all rendering and Babylon scene objects.
 *
 * The following options may be provided via the main Engine constructor:
 * ```js
 * {
 *     showFPS: false,
 *     antiAlias: true,
 *     clearColor: [0.8, 0.9, 1],
 *     ambientColor: [0.5, 0.5, 0.5],
 *     lightDiffuse: [1, 1, 1],
 *     lightSpecular: [1, 1, 1],
 *     lightVector: [1, -1, 0.5],
 *     useAO: true,
 *     AOmultipliers: [0.93, 0.8, 0.5],
 *     reverseAOmultiplier: 1.0,
 *     preserveDrawingBuffer: true,
 *     octreeBlockSize: 2,
 *     renderOnResize: true,
 * }
 * ```
 */
export class Rendering {
    /**
     * @internal
     * @param {import('../../index.js').Engine} noa
     * @param {RenderingOptions} opts
     * @param {HTMLCanvasElement} canvas
    */
    constructor(noa: import("../../index.js").Engine, opts: RenderingOptions, canvas: HTMLCanvasElement);
    /** Primary noa engine handle */
    /** @internal */ noa: import("../../index.js").Engine;
    /** Whether to redraw the screen when the game is resized while paused */
    renderOnResize: boolean;
    /** @internal */ useAO: boolean;
    /** @internal */ aoVals: [number, number, number];
    /** @internal */ revAoVal: number;
    /** @internal */ meshingCutoffTime: number;
    /** @internal */ _disposed: boolean;
    /** @type {import('@babylonjs/core').Engine | null} */ engine: import("@babylonjs/core").Engine | null;
    /** @type {import('@babylonjs/core').Scene | null} */ scene: import("@babylonjs/core").Scene | null;
    /** @type {import('@babylonjs/core').DirectionalLight | null} */ light: import("@babylonjs/core").DirectionalLight | null;
    /** @type {import('@babylonjs/core').FreeCamera | null} */ camera: import("@babylonjs/core").FreeCamera | null;
    /** @internal legacy hook for highlight mesh (managed by RenderingUtils) */ _highlightMesh: any;
    /** @type {import('../sceneOctreeManager.js').SceneOctreeManager | null} */ _octreeManager: import("../sceneOctreeManager.js").SceneOctreeManager | null;
    /** @type {import('@babylonjs/core').TransformNode | null} */ _cameraHolder: import("@babylonjs/core").TransformNode | null;
    /** @type {import('@babylonjs/core').Mesh | null} */ _camScreen: import("@babylonjs/core").Mesh | null;
    /** @type {import('@babylonjs/core').StandardMaterial | null} */ _camScreenMat: import("@babylonjs/core").StandardMaterial | null;
    /** @internal */ _errorLogged: boolean;
    /** @internal */ _sceneIsReady: boolean;
    /** @internal */ _sceneReadyCallbacks: (() => void)[];
    /** Promise that resolves when the Babylon scene reports ready */
    /** @type {Promise<void> | null} */ sceneReady: Promise<void> | null;
    _core: RenderingCore;
    /** @internal */ _lighting: RenderingLighting;
    /** @internal */ _meshes: RenderingMeshes;
    /** @internal */ _materials: RenderingMaterials;
    /** @internal */ _models: RenderingModels;
    /** @internal */ _coords: RenderingCoords;
    /** @internal */ _utils: RenderingUtils;
    /** @internal */ _camera: RenderingCamera;
    /** The Babylon `scene` object representing the game world. */
    getScene(): import("@babylonjs/core").Scene;
    /**
     * Whether the Babylon scene has finished initializing (including shader compilation).
     * Check this when you need synchronous access to Babylon objects.
     */
    isSceneReady(): boolean;
    onSceneReady(callback: any): void;
    /**
     * Allow callers to tweak or disable the built-in directional light.
     * @param {object} opts
     * @param {import('@babylonjs/core').Vector3} [opts.direction]
     * @param {number} [opts.intensity]
     * @param {import('@babylonjs/core').Color3} [opts.diffuse]
     * @param {import('@babylonjs/core').Color3} [opts.specular]
     */
    setMainLightOptions(opts: {
        direction?: import("@babylonjs/core").Vector3;
        intensity?: number;
        diffuse?: import("@babylonjs/core").Color3;
        specular?: import("@babylonjs/core").Color3;
    }): void;
    /** Exclude a mesh (and optionally its descendants) from the main directional light */
    excludeMeshFromMainLight(mesh: any, includeDescendants?: boolean): void;
    /** Re-include a mesh (and optionally its descendants) in the main directional light */
    includeMeshInMainLight(mesh: any, includeDescendants?: boolean): void;
    /** Create an ad-hoc directional or hemispheric light in the scene */
    createLight(type: any, name: any): import("@babylonjs/core").DirectionalLight | import("@babylonjs/core").HemisphericLight;
    /** @internal */
    tick(dt: any): void;
    /**
     * @internal
     * Per-frame render loop: updates camera, validates mesh bounds to avoid Babylon crashes,
     * executes Babylon render, and records simple profiling hooks.
     */
    render(): void;
    /** @internal */
    postRender(): void;
    /**
     * Dispose Babylon resources and clear internal references.
     * Safe to call multiple times.
     */
    dispose(): void;
    /**
     * Resize the Babylon engine/scene. When paused and renderOnResize is true,
     * force a single render to keep the paused frame up to date.
     * @internal
     */
    resize(): void;
    /**
     * Pick terrain from the camera position along the camera direction.
     * @param {number} [distance=-1] optional max distance; defaults to blockTestDistance
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainFromCamera(distance?: number): import("@babylonjs/core").PickingInfo | null;
    /**
     * Cast a ray for terrain picking from an origin/direction.
     * @param {number[]} origin world or local coords
     * @param {number[]} direction unit-ish direction vector
     * @param {number} [distance=-1] optional max distance
     * @param {boolean} [originIsLocal=false] whether origin is already local coords
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainWithRay(origin: number[], direction: number[], distance?: number, originIsLocal?: boolean): import("@babylonjs/core").PickingInfo | null;
    /**
     * Draw or hide the translucent block-face highlight used by the selector.
     * @param {boolean} show
     * @param {number[]} [posArr] world coords of the targeted block position
     * @param {number[]} [normArr] face normal (length 3) pointing outward
     */
    highlightBlockFace(show: boolean, posArr?: number[], normArr?: number[]): void;
    /**
     * Adds a mesh to the engine's selection/octree logic so that it renders.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [isStatic]
     * @param {number[] | null} [pos]
     * @param {import('../chunk').Chunk | null} [containingChunk]
     */
    addMeshToScene(mesh: import("@babylonjs/core").AbstractMesh, isStatic?: boolean, pos?: number[] | null, containingChunk?: import("../chunk").Chunk | null): void;
    /**
     * Remove a mesh from noa's scene management without disposing it.
     * Mesh can be re-added later with addMeshToScene.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     */
    removeMeshFromScene(mesh: import("@babylonjs/core").AbstractMesh): void;
    /**
     * Toggle visibility of a mesh without disposing/removing it.
     * @param {import('@babylonjs/core').AbstractMesh} mesh
     * @param {boolean} [visible]
     */
    setMeshVisibility(mesh: import("@babylonjs/core").AbstractMesh, visible?: boolean): void;
    /** Create a default flat non-specular material */
    makeStandardMaterial(name: any): import("@babylonjs/core").StandardMaterial;
    /** Access to Babylon MeshBuilder */
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
    /** Convenience factory for StandardMaterial with common options */
    createStandardMaterial(name: any, options: any): import("@babylonjs/core").StandardMaterial;
    /** Convenience factory for ShaderMaterial from inline GLSL */
    createShaderMaterial(name: any, vertexSource: any, fragmentSource: any, options: any): import("@babylonjs/core").ShaderMaterial;
    /**
     * Load a GLB/glTF model and register its meshes with noa.
     * @param {string} url
     * @param {import('./renderingModels.js').LoadModelOptions} [options]
     */
    loadModel(url: string, options?: import("./renderingModels.js").LoadModelOptions): Promise<import("./renderingModels.js").LoadedModel>;
    /** Convert world coordinates to local (rendering) coordinates */
    worldToLocal(x: any, y: any, z: any): number[];
    /** Cached world-to-local conversion for hot paths */
    worldToLocalCached(x: any, y: any, z: any, out: any): number[];
    /** Convert local (rendering) coordinates to world coordinates */
    localToWorld(x: any, y: any, z: any): any[];
    /** Cached local-to-world conversion for hot paths */
    localToWorldCached(x: any, y: any, z: any, out: any): number[];
    /** Set a mesh position using world coordinates */
    setMeshWorldPosition(mesh: any, x: any, y: any, z: any): void;
    /** Get a mesh's world position */
    getMeshWorldPosition(mesh: any): any[];
    /** Cached variant of getMeshWorldPosition */
    getMeshWorldPositionCached(mesh: any, out: any): number[];
    /** Copy of current world origin offset */
    getWorldOriginOffset(): number[];
    /** Cached world origin offset */
    getWorldOriginOffsetCached(out: any): any;
    /** Push world origin offset into a shader uniform */
    updateShaderWorldOrigin(material: any, uniformName: any): void;
    /** @internal */
    _rebaseOrigin(delta: any): void;
    /** @internal */
    prepareChunkForRendering(chunk: any): void;
    /** @internal */
    disposeChunkForRendering(chunk: any): void;
    /** @internal */
    debug_SceneCheck(): string;
    /** @internal */
    debug_MeshCount(): void;
}
/**
 * Rendering configuration passed in via the Engine constructor.
 * Options here intentionally mirror the historical monolithic renderer defaults.
 */
export type RenderingOptions = {
    showFPS?: boolean;
    antiAlias?: boolean;
    clearColor?: [number, number, number];
    ambientColor?: [number, number, number];
    lightDiffuse?: [number, number, number];
    lightSpecular?: [number, number, number];
    lightVector?: [number, number, number];
    useAO?: boolean;
    AOmultipliers?: [number, number, number];
    reverseAOmultiplier?: number;
    preserveDrawingBuffer?: boolean;
    octreeBlockSize?: number;
    renderOnResize?: boolean;
};
import { RenderingCore } from './renderingCore.js';
import { RenderingLighting } from './renderingLighting.js';
import { RenderingMeshes } from './renderingMeshes.js';
import { RenderingMaterials } from './renderingMaterials.js';
import { RenderingModels } from './renderingModels.js';
import { RenderingCoords } from './renderingCoords.js';
import { RenderingUtils } from './renderingUtils.js';
import { RenderingCamera } from './renderingCamera.js';
