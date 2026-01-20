/**
 * Calculate the flat neighbor array index for a given offset.
 * @param {number} di
 * @param {number} dj
 * @param {number} dk
 * @returns {number}
 */
export function getNeighborIndex(di: number, dj: number, dk: number): number;
/**
 * Stores and manages voxel IDs and flags for each voxel within a chunk.
 */
export class Chunk {
    /**
     * Create a new voxel data array for a chunk.
     * @param {number} size - Chunk size
     * @returns {NdArray}
     */
    static _createVoxelArray(size: number): NdArray;
    /**
     * @param {import('../index').Engine} noa
     * @param {string} requestID - ID sent to game client
     * @param {number} ci - Chunk index i
     * @param {number} cj - Chunk index j
     * @param {number} ck - Chunk index k
     * @param {number} size - Chunk size
     * @param {NdArray} dataArray - Voxel data array
     * @param {number} [fillVoxelID=-1] - ID to fill voxels with, or -1 for no fill
     */
    constructor(noa: import("../index").Engine, requestID: string, ci: number, cj: number, ck: number, size: number, dataArray: NdArray, fillVoxelID?: number);
    /** @type {import('../index').Engine} */
    noa: import("../index").Engine;
    /** @type {boolean} */
    isDisposed: boolean;
    /** @type {*} - Arbitrary data passed in by client when generating world */
    userData: any;
    /** @type {string} - ID sent to game client */
    requestID: string;
    /** @type {NdArray} */
    voxels: NdArray;
    /** @type {number} - Chunk index i */
    i: number;
    /** @type {number} - Chunk index j */
    j: number;
    /** @type {number} - Chunk index k */
    k: number;
    /** @type {number} */
    size: number;
    /** @type {number} - World x coordinate */
    x: number;
    /** @type {number} - World y coordinate */
    y: number;
    /** @type {number} - World z coordinate */
    z: number;
    /** @type {number[]} - World position [x, y, z] */
    pos: number[];
    /** @internal @type {boolean} - Flag to track if terrain needs re-meshing */
    _terrainDirty: boolean;
    /** @internal @type {boolean} - Flag to track if objects need re-meshing */
    _objectsDirty: boolean;
    /** @internal @type {import('@babylonjs/core').Mesh[]} */
    _terrainMeshes: import("@babylonjs/core").Mesh[];
    /** @internal @type {Map<number, number>|null} */
    _objectBlocks: Map<number, number> | null;
    /** @internal @type {number} - Base offset for object instance keys */
    _objectKeyBase: number;
    /** @internal @type {boolean} - Whether chunk is entirely opaque */
    _isFull: boolean;
    /** @internal @type {boolean} - Whether chunk is entirely air */
    _isEmpty: boolean;
    /** @internal @type {Int32Array|null} - Tracks if a layer has a constant voxel ID */
    _wholeLayerVoxel: Int32Array | null;
    /** @internal @type {Array<Chunk|null>} - References to neighboring chunks */
    _neighbors: Array<Chunk | null>;
    /** @internal @type {number} - Count of neighboring chunks */
    _neighborCount: number;
    /** @internal @type {number} - Number of times this chunk has been meshed */
    _timesMeshed: number;
    /** @internal @type {VoxelLocationQueue} - Queue of voxels with block handlers */
    _blockHandlerLocs: VoxelLocationQueue;
    /**
     * Update the voxel data array with new data.
     * @internal
     * @param {NdArray} dataArray - New voxel data array
     * @param {number} [fillVoxelID=-1] - ID to fill voxels with, or -1 for no fill
     */
    _updateVoxelArray(dataArray: NdArray, fillVoxelID?: number): void;
    /**
     * Get the block ID at a local position within the chunk.
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @returns {number} Block ID at the position
     */
    get(i: number, j: number, k: number): number;
    /**
     * Get the solidity value at a local position within the chunk.
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @returns {boolean} Solidity value at the position
     */
    getSolidityAt(i: number, j: number, k: number): boolean;
    /**
     * Set the block ID at a local position within the chunk.
     * Handles block lifecycle (onSet/onUnset handlers), object blocks,
     * terrain/object dirty flags, and neighbor chunk updates.
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @param {number} newID - New block ID to set
     */
    set(i: number, j: number, k: number, newID: number): void;
    /**
     * Update terrain and object meshes if they are dirty.
     * Called by World when this chunk has been queued for remeshing.
     */
    updateMeshes(): void;
    /**
     * Dispose the chunk and clean up all resources.
     * Calls onUnload handlers for all blocks, disposes meshes,
     * and nullifies references to allow garbage collection.
     */
    dispose(): void;
}
export type NdArray = any;
import { VoxelLocationQueue } from './util';
