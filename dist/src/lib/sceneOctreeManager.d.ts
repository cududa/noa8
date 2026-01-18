/**
 * Internal representation of OctreeBlock for rebase operations.
 * Includes private Babylon.js properties we need to access.
 * We cast to this type when accessing Babylon internals.
 * @typedef {object} OctreeBlockInternal
 * @property {Vector3} minPoint
 * @property {Vector3} maxPoint
 * @property {Vector3[]} _boundingVectors - Private Babylon.js property
 * @property {OctreeBlockInternal[]} [blocks] - Child blocks (optional)
 */
/**
 * Parent node in octree hierarchy (Octree or OctreeBlock with children)
 * @typedef {object} OctreeParent
 * @property {OctreeBlockInternal[]} blocks
 */
/** @internal */
export class SceneOctreeManager {
    /** @internal */
    constructor(rendering: any, blockSize: any);
    /** @param {Vector3} offset */
    rebase: (offset: Vector3) => void;
    addMesh: (mesh: any, isStatic: any, pos: any, chunk: any) => void;
    removeMesh: (mesh: any) => void;
    setMeshVisibility: (mesh: any, visible?: boolean) => void;
}
/**
 * Internal representation of OctreeBlock for rebase operations.
 * Includes private Babylon.js properties we need to access.
 * We cast to this type when accessing Babylon internals.
 */
export type OctreeBlockInternal = {
    minPoint: Vector3;
    maxPoint: Vector3;
    /**
     * - Private Babylon.js property
     */
    _boundingVectors: Vector3[];
    /**
     * - Child blocks (optional)
     */
    blocks?: OctreeBlockInternal[];
};
/**
 * Parent node in octree hierarchy (Octree or OctreeBlock with children)
 */
export type OctreeParent = {
    blocks: OctreeBlockInternal[];
};
import { Vector3 } from './babylonExports.js';
