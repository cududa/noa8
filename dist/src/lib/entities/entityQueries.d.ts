/**
 * Query object for iterating over entities with specific components.
 * Supports iterator protocol, forEach, and component chaining.
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
 */
export class EntityQueryImpl {
    /**
     * @param {import('./index.js').Entities} ecs
     * @param {string} name
     */
    constructor(ecs: import("./index.js").Entities, name: string);
    /** @internal */
    _ecs: import("./index.js").Entities;
    /** @internal */
    _names: string[];
    /**
     * Chain another component requirement to the query.
     * @param {string} name - Component name
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
/**
 * Spatial query methods for entity lookups.
 */
export class EntitySpatialQueries {
    /**
     * @param {import('./index.js').Entities} entities
     */
    constructor(entities: import("./index.js").Entities);
    /** @internal @type {import('./index.js').Entities} */
    _entities: import("./index.js").Entities;
    /**
     * Checks whether a voxel is obstructed by any entity
     * (with the `collidesTerrain` component).
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
}
