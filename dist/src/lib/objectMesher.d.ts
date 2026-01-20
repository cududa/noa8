/**
 * Handles per-chunk creation/disposal of static meshes associated with voxel IDs.
 * @internal
 */
export class ObjectMesher {
    /**
     * @internal
     * @param {import('../index').Engine} noa
     */
    constructor(noa: import("../index").Engine);
    /** @internal @type {import('../index').Engine} */
    _noa: import("../index").Engine;
    /** @type {TransformNode} - Root node for all instance meshes */
    rootNode: TransformNode;
    /** @type {Mesh[]} - List of known base meshes */
    allBaseMeshes: Mesh[];
    /** @internal @type {number[]} - Tracking rebase amount inside matrix data */
    _rebaseOffset: number[];
    /** @internal @type {boolean} - Flag to trigger rebuild after chunk disposal */
    _rebuildNextTick: boolean;
    /** @internal @type {TransformNode} - Mock object for customMesh handler transforms */
    _transformObj: TransformNode;
    /** @internal @type {Object.<number, InstanceManager>} - Instance managers keyed by block ID */
    _managers: {
        [x: number]: InstanceManager;
    };
    /** @internal @type {number} - Unique key seed for chunk instance keys */
    _nextChunkKey: number;
    /** @internal @type {number} - Packed key stride (chunk volume) */
    _chunkKeyStride: number;
    /**
     * Get or create an InstanceManager for the given block ID.
     * Dedupes by mesh since Babylon chokes on separate instance sets for same geometry.
     * @internal
     * @param {number} id - Block ID
     * @returns {InstanceManager}
     */
    _getManager(id: number): InstanceManager;
    /**
     * Initialize chunk properties for object meshing.
     * @param {import('./chunk').Chunk} chunk
     */
    initChunk(chunk: import("./chunk").Chunk): void;
    /**
     * Handle an object block being set or cleared.
     * Called by world when an object block changes.
     * @param {import('./chunk').Chunk} chunk
     * @param {number} blockID - New block ID (0 if clearing)
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     */
    setObjectBlock(chunk: import("./chunk").Chunk, blockID: number, i: number, j: number, k: number): void;
    /**
     * Rebuild dirty instance meshes.
     * Called by world when objects have been updated.
     */
    buildObjectMeshes(): void;
    /**
     * Clean up chunk's object blocks at end of chunk lifecycle.
     * @param {import('./chunk').Chunk} chunk
     */
    disposeChunk(chunk: import("./chunk").Chunk): void;
    /**
     * Tick handler - catches case where objects are dirty due to disposal.
     */
    tick(): void;
    /**
     * Handle world origin rebase.
     * @internal
     * @param {number[]} delta - Rebase offset [x, y, z]
     */
    _rebaseOrigin(delta: number[]): void;
}
export type Mesh = import("@babylonjs/core").Mesh;
import { TransformNode } from './babylonExports.js';
/**
 * Manager class for thin instances of a given object block ID.
 * @internal
 */
declare class InstanceManager {
    /**
     * @param {import('../index').Engine} noa
     * @param {Mesh} mesh
     */
    constructor(noa: import("../index").Engine, mesh: Mesh);
    /** @type {import('../index').Engine} */
    noa: import("../index").Engine;
    /** @type {Mesh} */
    mesh: Mesh;
    /** @type {Float32Array|null} */
    buffer: Float32Array | null;
    /** @type {number} */
    capacity: number;
    /** @type {number} */
    count: number;
    /** @type {boolean} */
    dirty: boolean;
    /** @type {boolean} */
    rebased: boolean;
    /** @type {boolean} */
    disposed: boolean;
    /** @type {Map<number, number>|null} - Map keys (locations) to buffer indices */
    keyToIndex: Map<number, number> | null;
    /** @type {Float64Array|null} - Map buffer locations to keys */
    locToKey: Float64Array | null;
    /**
     * Clean up and dispose the mesh.
     */
    dispose(): void;
    /**
     * Add an instance at the given location.
     * @param {import('./chunk').Chunk} chunk
     * @param {number} key - Location key
     * @param {number} i - Local x coordinate
     * @param {number} j - Local y coordinate
     * @param {number} k - Local z coordinate
     * @param {TransformNode|null} transform - Optional transform from handler
     * @param {number[]} rebaseVec - Current rebase offset
     */
    addInstance(chunk: import("./chunk").Chunk, key: number, i: number, j: number, k: number, transform: TransformNode | null, rebaseVec: number[]): void;
    /**
     * Remove an instance by key.
     * @param {import('./chunk').Chunk} chunk
     * @param {number} key - Location key
     */
    removeInstance(chunk: import("./chunk").Chunk, key: number): void;
    /**
     * Push buffer updates to mesh.
     */
    updateMatrix(): void;
    /**
     * Resize the instance buffer.
     * @param {number} [size=4] - New capacity
     */
    setCapacity(size?: number): void;
}
export {};
