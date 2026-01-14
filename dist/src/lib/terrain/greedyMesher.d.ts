/**
 * Greedy meshing algorithm for terrain.
 * @module terrain/greedyMesher
 *
 * Originally based on algorithm by Mikola Lysenko:
 *     http://0fps.net/2012/07/07/meshing-minecraft-part-2/
 * but probably no code remaining from there anymore.
 * Ad-hoc AO handling made of cobwebs and dreams.
 *
 * Takes in a Chunk instance, and returns an object containing
 * GeometryData structs, keyed by terrain material ID,
 * which the terrain builder can then make into meshes.
 */
/**
 * Greedy mesher - takes a Chunk instance and returns face data
 * keyed by terrain material ID.
 * @internal
 */
export class GreedyMesher {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent: import("./index.js").TerrainMesher);
    /** @type {import('./index.js').TerrainMesher} */
    parent: import("./index.js").TerrainMesher;
    /** @type {Int16Array} */
    _maskCache: Int16Array;
    /** @type {Int16Array} */
    _aoMaskCache: Int16Array;
    /**
     * Entry point - mesh a chunk and return face data by terrain ID
     * @param {import('../chunk.js').Chunk} chunk
     * @param {boolean} ignoreMaterials
     * @returns {Object.<string, MeshedFaceData>} keyed by terrain material ID
     */
    mesh(chunk: import("../chunk.js").Chunk, ignoreMaterials: boolean): {
        [x: string]: MeshedFaceData;
    };
    /**
     * Build a 2D array of mask values representing whether a mesh face is needed at each position.
     * Each mask value is a terrain material ID, negative if the face needs to point
     * in the -i direction (towards voxel arr A).
     * @returns {number} number of mesh faces found
     */
    _constructMeshMask(d: any, arrA: any, iA: any, arrB: any, iB: any, noa: any, wholeLayerVoxel?: any): number;
    /**
     * Greedy meshing inner loop - construct geometry data from the masks
     */
    _constructGeometryFromMasks(i: any, d: any, u: any, v: any, len1: any, len2: any, numFaces: any, faceDataSet: any, terrainIDgetter: any, noa: any): void;
}
import { MeshedFaceData } from './faceData.js';
