/**
 * `noa.entities` - manages entities and components.
 *
 * This class extends [ent-comp](https://github.com/fenomas/ent-comp),
 * a general-purpose ECS. It's also decorated with noa-specific helpers and
 * accessor functions for querying entity positions, etc.
 *
 * Expects entity definitions in a specific format - see source `components`
 * folder for examples.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 *
 * ```js
 * var defaults = {
 *     shadowDistance: 10,
 * }
 * ```
 */
export class Entities extends ECS {
    /** @internal */
    constructor(noa: any, opts: any);
    /** @internal @type {(id:number) => boolean} */
    cameraSmoothed: (id: number) => boolean;
    /**
     * Returns whether the entity has a physics body.
     * @type {(id:number) => boolean}
     */
    hasPhysics: (id: number) => boolean;
    /**
     * Returns whether the entity has a position.
     * @type {(id:number) => boolean}
     */
    hasPosition: (id: number) => boolean;
    /**
     * Returns whether the entity has a mesh.
     * @type {(id:number) => boolean}
     */
    hasMesh: (id: number) => boolean;
    /**
     * Returns the entity's position component state.
     * @type {(id:number) => null | import("../../components/position.js").PositionState}
     */
    getPositionData: (id: number) => null | import("../../components/position.js").PositionState;
    /**
     * Returns the entity's position vector.
     * @type {(id:number) => number[] | null}
     */
    getPosition: (id: number) => number[] | null;
    /**
     * Get the entity's `physics` component state.
     * @type {(id:number) => null | import("../../components/physics.js").PhysicsState}
     */
    getPhysics: (id: number) => null | import("../../components/physics.js").PhysicsState;
    /**
     * Returns the entity's physics body.
     * Note, will throw if the entity doesn't have the position component!
     * @type {(id:number) => null | import("voxel-physics-engine").RigidBody}
     */
    getPhysicsBody: (id: number) => null | import("voxel-physics-engine").RigidBody;
    /**
     * Returns the entity's axis-aligned bounding box (AABB) in local coordinates.
     * The AABB represents the entity's collision box position relative to the
     * current world origin offset. To get world coordinates, add noa.worldOriginOffset.
     *
     * **Note:** Returns a direct reference to the physics body's internal AABB.
     * Modifying the returned object will mutate the entity's physics state.
     *
     * @type {(id:number) => null | {base: number[], max: number[]}}
     */
    getAABB: (id: number) => null | {
        base: number[];
        max: number[];
    };
    /**
     * Returns the entity's `mesh` component state.
     * @type {(id:number) => {mesh:any, offset:number[]}}
     */
    getMeshData: (id: number) => {
        mesh: any;
        offset: number[];
    };
    /**
     * Returns the entity's `movement` component state.
     * @type {(id:number) => import('../../components/movement.js').MovementState}
     */
    getMovement: (id: number) => import("../../components/movement.js").MovementState;
    /**
     * Returns the entity's `collideTerrain` component state.
     * @type {(id:number) => {callback: function}}
     */
    getCollideTerrain: (id: number) => {
        callback: Function;
    };
    /**
     * Returns the entity's `collideEntities` component state.
     * @type {(id:number) => {
     *      cylinder:boolean, collideBits:number,
     *      collideMask:number, callback: function}}
     */
    getCollideEntities: (id: number) => {
        cylinder: boolean;
        collideBits: number;
        collideMask: number;
        callback: Function;
    };
    /**
     * Returns the entity's `label` component state.
     * @type {(id:number) => null | import("../../components/label.js").LabelState}
     */
    getLabel: (id: number) => null | import("../../components/label.js").LabelState;
    /**
     * Returns the entity's position in world coordinates.
     * Returns center X/Z and base Y of the entity's AABB.
     *
     * @example
     * const [worldX, worldY, worldZ] = noa.entities.getWorldPosition(playerId)
     *
     * @type {(id:number) => number[] | null}
     */
    getWorldPosition: (id: number) => number[] | null;
    /**
     * Returns the entity's world position (cached version for hot paths).
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     *
     * @type {(id:number, out?: number[]) => number[] | null}
     */
    getWorldPositionCached: (id: number, out?: number[]) => number[] | null;
    /**
     * Check if an entity is within world-coordinate bounds.
     *
     * @example
     * const inRiver = noa.entities.isInWorldBounds(playerId, {
     *     xMin: -5, xMax: 5,
     *     yMin: 0, yMax: 3,
     *     zMin: -50, zMax: 50
     * })
     *
     * @type {(id:number, bounds: {xMin?:number, xMax?:number, yMin?:number, yMax?:number, zMin?:number, zMax?:number}) => boolean}
     */
    isInWorldBounds: (id: number, bounds: {
        xMin?: number;
        xMax?: number;
        yMin?: number;
        yMax?: number;
        zMin?: number;
        zMax?: number;
    }) => boolean;
    /**
     * Pairwise collideEntities event - assign your own function to this
     * property if you want to handle entity-entity overlap events.
     * @type {(id1:number, id2:number) => void}
     */
    onPairwiseEntityCollision: (id1: number, id2: number) => void;
    /**
     * @internal
     * @type {import('../../index.js').Engine}
     */
    noa: import("../../index.js").Engine;
    /** @internal */
    _disposed: boolean;
    /**
     * Hash containing the component names of built-in components.
     * @type {{ [key:string]: string }}
     */
    names: {
        [key: string]: string;
    };
    /** @internal */
    _positions: EntityPositions;
    /** @internal */
    _spatialQueries: EntitySpatialQueries;
    /**
     * Register all built-in components.
     * Calls `createComponent` on all component definitions, and
     * stores their names in `ents.names`.
     * @internal
     * @param {import('./entitiesUtils.js').EntitiesOptions} opts
     */
    _registerComponents(opts: import("./entitiesUtils.js").EntitiesOptions): void;
    /**
     * Query entities by component name.
     * Returns an iterable query object for efficient iteration.
     *
     * @example
     * // Iterate over all entities with physics
     * for (const { id, state } of noa.entities.query('physics')) {
     *   console.log(id, state.body)
     * }
     *
     * // With forEach
     * noa.entities.query('physics').forEach(({ id, state }) => {
     *   console.log(id, state)
     * })
     *
     * // Chain multiple components
     * noa.entities.query('physics').withComponent('mesh').forEach(...)
     *
     * @param {string} componentName
     * @returns {EntityQueryImpl}
     */
    query(componentName: string): EntityQueryImpl;
    /**
     * Set an entity's position, and update all derived state.
     *
     * In general, always use this to set an entity's position unless
     * you're familiar with engine internals.
     *
     * @example
     * noa.ents.setPosition(playerEntity, [5, 6, 7])
     * noa.ents.setPosition(playerEntity, 5, 6, 7)  // also works
     *
     * @param {number} id
     * @param {number|number[]} pos
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    setPosition(id: number, pos: number | number[], y?: number, z?: number): void;
    /**
     * Set an entity's size.
     *
     * @param {number} id
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
     */
    setEntitySize(id: number, xs: number, ys: number, zs: number): void;
    /**
     * Called when engine rebases its local coords.
     * @internal
     * @param {number[]} delta
     */
    _rebaseOrigin(delta: number[]): void;
    /**
     * @internal
     * @param {number} id
     * @returns {number[]}
     */
    _localGetPosition(id: number): number[];
    /**
     * @internal
     * @param {number} id
     * @param {number[]} pos
     */
    _localSetPosition(id: number, pos: number[]): void;
    /**
     * Helper to update everything derived from `_localPosition`.
     * @internal
     * @param {number} id
     * @param {import('../../components/position.js').PositionState} posDat
     */
    _updateDerivedPositionData(id: number, posDat: import("../../components/position.js").PositionState): void;
    /**
     * Checks whether a voxel is obstructed by any entity (with the
     * `collidesTerrain` component).
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    isTerrainBlocked(x: number, y: number, z: number): boolean;
    /**
     * Gets an array of all entities overlapping the given AABB.
     *
     * @param {{ base: number[], max: number[] }} box
     * @param {string} [withComponent] - Optional component filter
     * @returns {number[]}
     */
    getEntitiesInAABB(box: {
        base: number[];
        max: number[];
    }, withComponent?: string): number[];
    /**
     * Safely add a component - if the entity already had the
     * component, this will remove and re-add it.
     *
     * @param {number} id
     * @param {string} name
     * @param {object} [state]
     */
    addComponentAgain(id: number, name: string, state?: object): void;
    /**
     * Helper to set up a general entity, and populate with some
     * common components depending on arguments.
     *
     * @param {number[] | null} [position=null]
     * @param {number} [width=1]
     * @param {number} [height=1]
     * @param {*} [mesh=null]
     * @param {number[] | null} [meshOffset=null]
     * @param {boolean} [doPhysics=false]
     * @param {boolean} [shadow=false]
     * @returns {number} Entity ID
     */
    add(position?: number[] | null, width?: number, height?: number, mesh?: any, meshOffset?: number[] | null, doPhysics?: boolean, shadow?: boolean): number;
    dispose(): void;
}
import ECS from 'ent-comp';
import { EntityPositions } from './entityPositions.js';
import { EntitySpatialQueries } from './entityQueries.js';
import { EntityQueryImpl } from './entityQueries.js';
