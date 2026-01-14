/**
 * Entity position management - setting positions and derived state updates.
 * @module entities/entityPositions
 */

import * as vec3 from 'gl-vec3'
import { updatePositionExtents } from '../../components/position.js'
import { setPhysicsFromPosition } from '../../components/physics.js'
import { nudgePosition } from './entitiesUtils.js'


/**
 * Position management class for the Entities module.
 * Handles setting entity positions and updating all derived state.
 */
export class EntityPositions {

    /**
     * @param {import('./index.js').Entities} entities
     */
    constructor(entities) {
        /** @internal @type {import('./index.js').Entities} */
        this._entities = entities
    }

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
    setPosition(id, pos, y = 0, z = 0) {
        if (typeof pos === 'number') pos = [pos, y, z]
        var loc = this._entities.noa.globalToLocal(pos, null, [])
        this._localSetPosition(id, loc)
    }

    /**
     * Set an entity's size.
     *
     * @param {number} id
     * @param {number} xs
     * @param {number} ys
     * @param {number} zs
     */
    setEntitySize(id, xs, ys, zs) {
        var posDat = this._entities.getPositionData(id)
        posDat.width = (xs + zs) / 2
        posDat.height = ys
        this._updateDerivedPositionData(id, posDat)
    }

    /**
     * Called when engine rebases its local coords.
     * @internal
     * @param {number[]} delta
     */
    _rebaseOrigin(delta) {
        var ents = this._entities
        for (var state of ents.getStatesList(ents.names.position)) {
            var locPos = state._localPosition
            var hw = state.width / 2
            nudgePosition(locPos, 0, -hw, hw, state.__id)
            nudgePosition(locPos, 1, 0, state.height, state.__id)
            nudgePosition(locPos, 2, -hw, hw, state.__id)
            vec3.sub(locPos, locPos, delta)
            this._updateDerivedPositionData(state.__id, state)
        }
    }

    /**
     * @internal
     * @param {number} id
     * @returns {number[]}
     */
    _localGetPosition(id) {
        return this._entities.getPositionData(id)._localPosition
    }

    /**
     * @internal
     * @param {number} id
     * @param {number[]} pos
     */
    _localSetPosition(id, pos) {
        var posDat = this._entities.getPositionData(id)
        vec3.copy(posDat._localPosition, pos)
        this._updateDerivedPositionData(id, posDat)
    }

    /**
     * Helper to update everything derived from `_localPosition`.
     * @internal
     * @param {number} id
     * @param {import('../../components/position.js').PositionState} posDat
     */
    _updateDerivedPositionData(id, posDat) {
        var ents = this._entities
        vec3.copy(posDat._renderPosition, posDat._localPosition)
        var offset = ents.noa.worldOriginOffset
        vec3.add(posDat.position, posDat._localPosition, offset)
        updatePositionExtents(posDat)
        var physDat = ents.getPhysics(id)
        if (physDat) setPhysicsFromPosition(physDat, posDat)
    }
}
