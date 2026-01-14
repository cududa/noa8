/**
 * Handles chunk lifecycle operations.
 */
export class WorldLifecycle {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world: import("./index.js").World);
    /** @type {import('./index.js').World} */
    world: import("./index.js").World;
    /**
     * Tells noa to discard voxel data within a given `AABB` (e.g. because
     * the game client received updated data from a server).
     * The engine will mark all affected chunks for removal, and will later emit
     * new `worldDataNeeded` events (if the chunk is still in draw range).
     * @param {{ base: number[], max: number[] }} box
     */
    invalidateVoxelsInAABB(box: {
        base: number[];
        max: number[];
    }): void;
    /**
     * When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be created and loaded.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyLoadChunk(x?: number, y?: number, z?: number): void;
    /**
     * When manually controlling chunk loading, tells the engine that the
     * chunk containing the specified (x,y,z) needs to be unloaded and disposed.
     * > Note: throws unless `noa.world.manuallyControlChunkLoading` is set.
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    manuallyUnloadChunk(x?: number, y?: number, z?: number): void;
    /**
     * Returns whether the initial chunk load has completed.
     * This becomes true when all initially requested chunks are loaded and meshed
     * (when both pending and mesh queues are empty for the first time).
     * @returns {boolean}
     */
    isInitialLoadComplete(): boolean;
    /**
     * Clients should call this after creating a chunk's worth of data (as an ndarray).
     * If userData is passed in it will be attached to the chunk.
     * @param {string} id - the string specified when the chunk was requested
     * @param {*} array - an ndarray of voxel data
     * @param {*} [userData=null] - an arbitrary value for game client use
     * @param {number} [fillVoxelID=-1] - specify a voxel ID here if you want to signify that
     * the entire chunk should be solidly filled with that voxel (e.g. `0` for air).
     * If you do this, the voxel array data will be overwritten and the engine will
     * take a fast path through some initialization steps.
     */
    setChunkData(id: string, array: any, userData?: any, fillVoxelID?: number): void;
    /**
     * Create chunk object and request voxel data from client.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     */
    requestNewChunk(i: number, j: number, k: number): void;
    /**
     * Called when client sets a chunk's voxel data.
     * If userData is passed in it will be attached to the chunk.
     * @param {string} reqID
     * @param {*} array
     * @param {*} userData
     * @param {number} fillVoxelID
     */
    setChunkDataInternal(reqID: string, array: any, userData: any, fillVoxelID: number): void;
    /**
     * Remove a chunk that wound up in the remove queue.
     * @param {number} i - Chunk X index
     * @param {number} j - Chunk Y index
     * @param {number} k - Chunk Z index
     */
    removeChunk(i: number, j: number, k: number): void;
    /**
     * Remesh a chunk.
     * @param {import('../chunk.js').Chunk} chunk
     */
    doChunkRemesh(chunk: import("../chunk.js").Chunk): void;
    /**
     * Keep neighbor data updated when chunk is added or removed.
     * @param {number} ci - Chunk X index
     * @param {number} cj - Chunk Y index
     * @param {number} ck - Chunk Z index
     * @param {import('../chunk.js').Chunk|null} chunk - The chunk or null if removed
     */
    updateNeighborsOfChunk(ci: number, cj: number, ck: number, chunk: import("../chunk.js").Chunk | null): void;
}
