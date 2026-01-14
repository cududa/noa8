/**
 * Terrain meshing module - manages terrain mesh generation and materials.
 * @module terrain
 *
 * Top-level entry point: takes a chunk, passes it to the greedy mesher,
 * gets back an intermediate struct of face data, passes that to the mesh
 * builder, gets back an array of Mesh objects, and finally puts those
 * into the 3D engine.
 */
/**
 * `noa._terrainMesher` - Top-level terrain meshing coordinator.
 * @internal
 */
export class TerrainMesher {
    /**
     * @param {import('../../index.js').Engine} noa
     */
    constructor(noa: import("../../index.js").Engine);
    /** @type {import('../../index.js').Engine} */
    noa: import("../../index.js").Engine;
    /** @internal */
    _matManager: TerrainMatManager;
    /** @internal */
    _greedyMesher: GreedyMesher;
    /** @internal */
    _meshBuilder: MeshBuilder;
    /** @type {import('@babylonjs/core').Material[]} */
    allTerrainMaterials: import("@babylonjs/core").Material[];
    /** @internal */
    _defaultMaterial: import("@babylonjs/core").StandardMaterial;
    /**
     * Set or clean up any per-chunk properties needed for terrain meshing
     * @param {import('../chunk.js').Chunk} chunk
     */
    initChunk(chunk: import("../chunk.js").Chunk): void;
    /**
     * Dispose all terrain meshes for a chunk
     * @param {import('../chunk.js').Chunk} chunk
     */
    disposeChunk(chunk: import("../chunk.js").Chunk): void;
    /**
     * Meshing entry point and high-level flow
     * @param {import('../chunk.js').Chunk} chunk
     * @param {boolean} [ignoreMaterials=false]
     */
    meshChunk(chunk: import("../chunk.js").Chunk, ignoreMaterials?: boolean): void;
}
import { TerrainMatManager } from './terrainMaterials.js';
import { GreedyMesher } from './greedyMesher.js';
import { MeshBuilder } from './meshBuilder.js';
