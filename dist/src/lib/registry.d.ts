/**
 * `noa.registry` - Where you register your voxel types,
 * materials, properties, and events.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 *
 * ```js
 * var defaults = {
 *     texturePath: ''
 * }
 * ```
*/
export class Registry {
    /**
     * @internal
     * @param {import('../index').Engine} noa
    */
    constructor(noa: import("../index").Engine, opts: any);
    /** @internal */
    noa: import("../index").Engine;
    /** @internal */
    _texturePath: any;
    /**
     * Register (by integer ID) a block type and its parameters.
     *  `id` param: integer, currently 1..65535. Generally you should
     * specify sequential values for blocks, without gaps, but this
     * isn't technically necessary.
     *
     * @param {number} id - sequential integer ID (from 1)
     * @param {Partial<BlockOptions>} [options]
     * @returns the `id` value specified
     */
    registerBlock: (id?: number, options?: Partial<BlockOptions>) => number;
    /**
     * Register (by name) a material and its parameters.
     *
     * @param {string} name of this material
     * @param {Partial<MaterialOptions>} [options]
     */
    registerMaterial: (name?: string, options?: Partial<MaterialOptions>) => number;
    /**
     * Block solidity (for physics purposes).
     * @param {number} id
     * @returns {boolean}
     */
    getBlockSolidity: (id: number) => boolean;
    /**
     * Block opacity - whether it fully obscures the voxel (like dirt)
     * or can be partially seen through (like a fencepost).
     * @param {number} id
     * @returns {boolean}
     */
    getBlockOpacity: (id: number) => boolean;
    /**
     * Whether the block is a fluid.
     * @param {number} id
     * @returns {boolean}
     */
    getBlockFluidity: (id: number) => boolean;
    /**
     * Get block property object passed in at registration.
     * @param {number} id
     * @returns {object|null|undefined}
     */
    getBlockProps: (id: number) => object | null | undefined;
    /**
     * Look up a block ID's face material.
     * @param {number} blockId
     * @param {number} dir - Face direction 0..5: [+x, -x, +y, -y, +z, -z]
     * @returns {number} Material ID
     */
    getBlockFaceMaterial: (blockId: number, dir: number) => number;
    /**
     * General lookup for all properties of a block material
     * @param {number} matID
     * @returns {MatDef|undefined}
     */
    getMaterialData: (matID: number) => {
        color: number[];
        alpha: number;
        texture: string;
        texHasAlpha: boolean;
        atlasIndex: number;
        renderMat: any;
        flowSpeed: number;
        flowDirection: number[];
        flowPatternLength: number;
    } | undefined;
    /**
     * Given a texture URL, check if any material using that texture needs alpha.
     * @internal
     * @param {string} tex
     * @returns {boolean}
     */
    _textureNeedsAlpha: (tex?: string) => boolean;
    /** @internal */
    _solidityLookup: boolean[];
    /** @internal */
    _opacityLookup: boolean[];
    /** @internal */
    _fluidityLookup: boolean[];
    /** @internal */
    _objectLookup: boolean[];
    /** @internal */
    _blockMeshLookup: any[];
    /** @internal */
    _blockHandlerLookup: any[];
    /** @internal */
    _blockIsPlainLookup: boolean[];
    /** @internal */
    _materialColorLookup: any[];
    /** @internal */
    _matAtlasIndexLookup: number[];
}
export type TransformNode = import("@babylonjs/core").TransformNode;
/**
 * Default options when registering a block type.
 */
declare class BlockOptions {
    /**
     * @param {boolean} [isFluid=false]
     */
    constructor(isFluid?: boolean);
    /** Solidity for physics purposes.
     * @type {boolean} */
    solid: boolean;
    /** Whether the block fully obscures neighboring blocks.
     * @type {boolean} */
    opaque: boolean;
    /** Whether a nonsolid block is a fluid (buoyant, viscous..).
     * @type {boolean} */
    fluid: boolean;
    /**
     * The block material(s) for this voxel's faces. May be:
     *   - one (String) material name
     *   - array of 2 names: [top/bottom, sides]
     *   - array of 3 names: [top, bottom, sides]
     *   - array of 6 names: [+x, -x, +y, -y, +z, -z]
     * @type {string|string[]|null}
     */
    material: string | string[] | null;
    /** Specifies a custom mesh for this voxel, instead of terrain.
     * @type {*} */
    blockMesh: any;
    /** Fluid density parameter for fluid blocks.
     * @type {number} */
    fluidDensity: number;
    /** Viscosity parameter for fluid blocks.
     * @type {number} */
    viscosity: number;
    /** Callback when block's chunk is loaded.
     * @type {((x:number, y:number, z:number) => void)|null} */
    onLoad: ((x: number, y: number, z: number) => void) | null;
    /** Callback when block's chunk is unloaded.
     * @type {((x:number, y:number, z:number) => void)|null} */
    onUnload: ((x: number, y: number, z: number) => void) | null;
    /** Callback when block is set/placed.
     * @type {((x:number, y:number, z:number) => void)|null} */
    onSet: ((x: number, y: number, z: number) => void) | null;
    /** Callback when block is unset/removed.
     * @type {((x:number, y:number, z:number) => void)|null} */
    onUnset: ((x: number, y: number, z: number) => void) | null;
    /** Callback when custom mesh is created for this block.
     * @type {((mesh:TransformNode, x:number, y:number, z:number) => void)|null} */
    onCustomMeshCreate: ((mesh: TransformNode, x: number, y: number, z: number) => void) | null;
}
/** @typedef {import('@babylonjs/core').TransformNode} TransformNode */
/**
 * Default options when registering a block material.
 */
declare class MaterialOptions {
    /**
     * An array of 0..1 floats, either [R,G,B] or [R,G,B,A].
     * @type {number[]|null}
     */
    color: number[] | null;
    /**
     * Filename of texture image, if any.
     * @type {string|null}
     */
    textureURL: string | null;
    /**
     * Whether the texture image has alpha.
     * @type {boolean}
     */
    texHasAlpha: boolean;
    /**
     * Index into a (vertical strip) texture atlas, if applicable.
     * @type {number}
     */
    atlasIndex: number;
    /**
     * An optional Babylon.js `Material`. If specified, terrain for this voxel
     * will be rendered with the supplied material (this can impact performance).
     * @type {*}
     */
    renderMaterial: any;
    /**
     * Flow/conveyor animation speed in blocks per second.
     * If > 0, the material will animate smoothly. Default is 0 (no animation).
     * @type {number}
     */
    flowSpeed: number;
    /**
     * Flow/conveyor animation direction as [x, y, z]. Only used if flowSpeed > 0.
     * Example: [1, 0, 0] flows in +X direction, [0, 0, -1] flows in -Z direction.
     * @type {number[]}
     */
    flowDirection: number[];
    /**
     * Pattern length in blocks for repeating flow animations.
     * The vertex offset will wrap every N blocks. Default is 10.
     * Set this to match your prebaked texture/block pattern length for seamless wrapping.
     * @type {number}
     */
    flowPatternLength: number;
}
export {};
