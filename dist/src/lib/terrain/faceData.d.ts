/**
 * Intermediate face data structures for terrain meshing.
 * @module terrain/faceData
 */
/**
 * Intermediate struct to hold data for a bunch of merged block faces.
 * The greedy mesher produces these (one per terrainID),
 * and the mesh builder turns each one into a Mesh instance.
 */
export class MeshedFaceData {
    /** @type {number} */
    terrainID: number;
    /** @type {number} */
    numFaces: number;
    /** @type {number[]} */
    matIDs: number[];
    /** @type {number[]} */
    dirs: number[];
    /** @type {number[]} */
    is: number[];
    /** @type {number[]} */
    js: number[];
    /** @type {number[]} */
    ks: number[];
    /** @type {number[]} */
    wids: number[];
    /** @type {number[]} */
    hts: number[];
    /** @type {number[]} */
    packedAO: number[];
}
export namespace faceDataPool {
    export { get };
    export { reset };
}
declare function get(): MeshedFaceData;
declare function reset(): void;
export {};
