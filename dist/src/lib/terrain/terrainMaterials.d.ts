/**
 * Material management for terrain meshes.
 * @module terrain/terrainMaterials
 */
/**
 * Creates and manages Materials for terrain meshes.
 * Maps block face materials to terrain material IDs for mesh merging,
 * and creates the materials when needed.
 * @internal
 */
export class TerrainMatManager {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent: import("./index.js").TerrainMesher);
    /** @type {import('./index.js').TerrainMesher} */
    parent: import("./index.js").TerrainMesher;
    _defaultMat: import("@babylonjs/core").StandardMaterial;
    /** @type {import('@babylonjs/core').Material[]} */
    allMaterials: import("@babylonjs/core").Material[];
    /** @internal @type {number} */
    _idCounter: number;
    /** @internal @type {Object.<number, number>} */
    _blockMatIDtoTerrainID: {
        [x: number]: number;
    };
    /** @internal @type {Object.<number, import('@babylonjs/core').Material>} */
    _terrainIDtoMatObject: {
        [x: number]: import("@babylonjs/core").Material;
    };
    /** @internal @type {Object.<string, number>} */
    _texURLtoTerrainID: {
        [x: string]: number;
    };
    /** @internal @type {Map<import('@babylonjs/core').Material, number>} */
    _renderMatToTerrainID: Map<import("@babylonjs/core").Material, number>;
    /**
     * Maps a given `matID` (from noa.registry) to a unique ID of which
     * terrain material can be used for that block material.
     * This lets the terrain mesher map which blocks can be merged into
     * the same meshes.
     * Internally, this accessor also creates the material for each
     * terrainMatID as they are first encountered.
     * @param {number} blockMatID
     * @returns {number}
     */
    getTerrainMatId(blockMatID: number): number;
    /**
     * Get a Babylon Material object, given a terrainMatID (gotten from this module)
     * @param {number} [terrainMatID=1]
     * @returns {import('@babylonjs/core').Material}
     */
    getMaterial(terrainMatID?: number): import("@babylonjs/core").Material;
}
