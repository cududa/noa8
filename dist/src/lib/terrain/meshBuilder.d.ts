/**
 * Mesh construction from greedy mesher output.
 * @module terrain/meshBuilder
 *
 * Consumes all the raw data in faceDataSet to build
 * Babylon.js mesh/submeshes, ready to be added to the scene.
 */
/**
 * Mesh Builder - consumes raw face data to build
 * Babylon.js mesh/submeshes ready to be added to the scene.
 * @internal
 */
export class MeshBuilder {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent: import("./index.js").TerrainMesher);
    /** @type {import('./index.js').TerrainMesher} */
    parent: import("./index.js").TerrainMesher;
    /**
     * Consume the intermediate FaceData struct and produce
     * actual meshes the 3D engine can render
     * @param {import('../chunk.js').Chunk} chunk
     * @param {Object.<string, MeshedFaceData>} faceDataSet
     * @param {boolean} ignoreMaterials
     * @returns {import('@babylonjs/core').Mesh[]}
     */
    buildMesh(chunk: import("../chunk.js").Chunk, faceDataSet: {
        [x: string]: MeshedFaceData;
    }, ignoreMaterials: boolean): import("@babylonjs/core").Mesh[];
}
import { MeshedFaceData } from './faceData.js';
