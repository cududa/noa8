/**
 * Entity query and spatial search functionality.
 * @module entities/entityQueries
 */

import { extentsOverlap } from './entitiesUtils.js'


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
    constructor(ecs, name) {
        /** @internal */
        this._ecs = ecs
        /** @internal */
        this._names = [name]
    }

    *[Symbol.iterator]() {
        const states = this._ecs.getStatesList(this._names[0])
        for (const state of states) {
            if (!state) continue
            const id = state.__id
            if (this._names.length === 1) {
                yield { id, state }
            } else {
                let merged = { ...state }
                let valid = true
                for (let i = 1; i < this._names.length; i++) {
                    const other = this._ecs.getState(id, this._names[i])
                    if (!other) { valid = false; break }
                    merged = { ...merged, ...other }
                }
                if (valid) yield { id, state: merged }
            }
        }
    }

    /**
     * Chain another component requirement to the query.
     * @param {string} name - Component name
     * @returns {EntityQueryImpl}
     */
    withComponent(name) {
        const q = new EntityQueryImpl(this._ecs, this._names[0])
        q._names = [...this._names, name]
        return q
    }

    /**
     * Iterate with a callback function.
     * @param {function({id:number, state:object}):void} cb
     */
    forEach(cb) {
        for (const r of this) cb(r)
    }

    /**
     * Get array of entity IDs matching the query.
     * @returns {number[]}
     */
    getIds() {
        return Array.from(this).map(r => r.id)
    }

    /**
     * Count entities matching the query.
     * @returns {number}
     */
    count() {
        let c = 0
        for (const _ of this) c++
        return c
    }
}


/**
 * Spatial query methods for entity lookups.
 */
export class EntitySpatialQueries {

    /**
     * @param {import('./index.js').Entities} entities
     */
    constructor(entities) {
        /** @internal @type {import('./index.js').Entities} */
        this._entities = entities
    }

    /**
     * Checks whether a voxel is obstructed by any entity
     * (with the `collidesTerrain` component).
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    isTerrainBlocked(x, y, z) {
        var ents = this._entities
        var off = ents.noa.worldOriginOffset
        var xlocal = Math.floor(x - off[0])
        var ylocal = Math.floor(y - off[1])
        var zlocal = Math.floor(z - off[2])
        var blockExt = [
            xlocal + 0.001, ylocal + 0.001, zlocal + 0.001,
            xlocal + 0.999, ylocal + 0.999, zlocal + 0.999,
        ]
        var list = ents.getStatesList(ents.names.collideTerrain)
        for (var i = 0; i < list.length; i++) {
            var id = list[i].__id
            var ext = ents.getPositionData(id)._extents
            if (extentsOverlap(blockExt, ext)) return true
        }
        return false
    }

    /**
     * Gets an array of all entities overlapping the given AABB.
     *
     * @param {{ base: number[], max: number[] }} box
     * @param {string} [withComponent] - Optional component filter
     * @returns {number[]}
     */
    getEntitiesInAABB(box, withComponent) {
        var ents = this._entities
        var off = ents.noa.worldOriginOffset
        var testExtents = [
            box.base[0] - off[0], box.base[1] - off[1], box.base[2] - off[2],
            box.max[0] - off[0], box.max[1] - off[1], box.max[2] - off[2],
        ]

        var entStates
        if (withComponent) {
            entStates = []
            for (var compState of ents.getStatesList(withComponent)) {
                var pdat = ents.getPositionData(compState.__id)
                if (pdat) entStates.push(pdat)
            }
        } else {
            entStates = ents.getStatesList(ents.names.position)
        }

        var hits = []
        for (var i = 0; i < entStates.length; i++) {
            var state = entStates[i]
            if (extentsOverlap(testExtents, state._extents)) {
                hits.push(state.__id)
            }
        }
        return hits
    }
}
