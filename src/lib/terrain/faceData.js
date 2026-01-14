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
    constructor() {
        /** @type {number} */
        this.terrainID = 0
        /** @type {number} */
        this.numFaces = 0
        // following arrays are all one element per quad
        /** @type {number[]} */
        this.matIDs = []
        /** @type {number[]} */
        this.dirs = []
        /** @type {number[]} */
        this.is = []
        /** @type {number[]} */
        this.js = []
        /** @type {number[]} */
        this.ks = []
        /** @type {number[]} */
        this.wids = []
        /** @type {number[]} */
        this.hts = []
        /** @type {number[]} */
        this.packedAO = []
    }
}

/**
 * Extremely naive object pool for MeshedFaceData objects.
 * Avoids allocations in the hot meshing path.
 */
export var faceDataPool = (() => {
    /** @type {MeshedFaceData[]} */
    var arr = []
    var ix = 0
    var get = () => {
        if (ix >= arr.length) arr.push(new MeshedFaceData())
        ix++
        return arr[ix - 1]
    }
    var reset = () => { ix = 0 }
    return { get, reset }
})()
