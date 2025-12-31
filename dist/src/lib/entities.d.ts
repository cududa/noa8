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
    /**
     * @internal
     * @type {import('../index').Engine}
    */
    noa: import("../index").Engine;
    /** @internal */
    _disposed: boolean;
    /** Hash containing the component names of built-in components.
     * @type {{ [key:string]: string }}
    */
    names: {
        [key: string]: string;
    };
    /** @internal */
    cameraSmoothed: (id: any) => boolean;
    /**
     * Returns whether the entity has a physics body
     * @type {(id:number) => boolean}
    */
    hasPhysics: (id: number) => boolean;
    /**
     * Returns whether the entity has a position
     * @type {(id:number) => boolean}
    */
    hasPosition: (id: number) => boolean;
    /**
     * Returns the entity's position component state
     * @type {(id:number) => null | import("../components/position").PositionState}
    */
    getPositionData: (id: number) => null | import("../components/position").PositionState;
    /**
     * Returns the entity's position vector.
     * @type {(id:number) => number[]}
    */
    getPosition: (id: number) => number[];
    /**
     * Get the entity's `physics` component state.
     * @type {(id:number) => null | import("../components/physics").PhysicsState}
    */
    getPhysics: (id: number) => null | import("../components/physics").PhysicsState;
    /**
     * Returns the entity's physics body
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
     * Returns whether the entity has a mesh
     * @type {(id:number) => boolean}
    */
    hasMesh: (id: number) => boolean;
    /**
     * Returns the entity's `mesh` component state
     * @type {(id:number) => {mesh:any, offset:number[]}}
    */
    getMeshData: (id: number) => {
        mesh: any;
        offset: number[];
    };
    /**
     * Returns the entity's `movement` component state
     * @type {(id:number) => import('../components/movement').MovementState}
    */
    getMovement: (id: number) => import("../components/movement").MovementState;
    /**
     * Returns the entity's `collideTerrain` component state
     * @type {(id:number) => {callback: function}}
    */
    getCollideTerrain: (id: number) => {
        callback: Function;
    };
    /**
     * Returns the entity's `collideEntities` component state
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
     * Returns the entity's `label` component state
     * @type {(id:number) => null | import("../components/label").LabelState}
     */
    getLabel: (id: number) => null | import("../components/label").LabelState;
    /**
     * Pairwise collideEntities event - assign your own function to this
     * property if you want to handle entity-entity overlap events.
     * @type {(id1:number, id2:number) => void}
     */
    onPairwiseEntityCollision: (id1: number, id2: number) => void;
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
    /** Set an entity's position, and update all derived state.
     *
     * In general, always use this to set an entity's position unless
     * you're familiar with engine internals.
     *
     * ```js
     * noa.ents.setPosition(playerEntity, [5, 6, 7])
     * noa.ents.setPosition(playerEntity, 5, 6, 7)  // also works
     * ```
     *
     * @param {number} id
     */
    setPosition(id: number, pos: any, y?: number, z?: number): void;
    /** Set an entity's size
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
    */
    setEntitySize(id: any, xs: number, ys: number, zs: number): void;
    /**
     * called when engine rebases its local coords
     * @internal
     */
    _rebaseOrigin(delta: any): void;
    /** @internal */
    _localGetPosition(id: any): number[];
    /** @internal */
    _localSetPosition(id: any, pos: any): void;
    /**
     * helper to update everything derived from `_localPosition`
     * @internal
    */
    _updateDerivedPositionData(id: any, posDat: any): void;
    /**
     * Safely add a component - if the entity already had the
     * component, this will remove and re-add it.
    */
    addComponentAgain(id: any, name: any, state: any): void;
    /**
     * Checks whether a voxel is obstructed by any entity (with the
     * `collidesTerrain` component)
    */
    isTerrainBlocked(x: any, y: any, z: any): boolean;
    /**
     * Gets an array of all entities overlapping the given AABB
    */
    getEntitiesInAABB(box: any, withComponent: any): any[];
    /**
     * Helper to set up a general entity, and populate with some common components depending on arguments.
    */
    add(position?: any, width?: number, height?: number, mesh?: any, meshOffset?: any, doPhysics?: boolean, shadow?: boolean): number;
    dispose(): void;
}
import ECS from 'ent-comp';
/**
 * Query object for iterating over entities with specific components.
 * Supports iterator protocol, forEach, and component chaining.
 */
declare class EntityQueryImpl {
    constructor(ecs: any, name: any);
    _ecs: any;
    _names: any[];
    /**
     * Chain another component requirement to the query.
     * @param {string} name Component name
     * @returns {EntityQueryImpl}
     */
    withComponent(name: string): EntityQueryImpl;
    /**
     * Iterate with a callback function.
     * @param {function({id:number, state:object}):void} cb
     */
    forEach(cb: (arg0: {
        id: number;
        state: object;
    }) => void): void;
    /**
     * Get array of entity IDs matching the query.
     * @returns {number[]}
     */
    getIds(): number[];
    /**
     * Count entities matching the query.
     * @returns {number}
     */
    count(): number;
    [Symbol.iterator](): Generator<{
        id: any;
        state: any;
    }, void, unknown>;
}
export {};
