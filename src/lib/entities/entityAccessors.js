/**
 * Entity accessor factory - creates accessor methods on Entities instance.
 * Called once at construction time, no runtime overhead.
 * @module entities/entityAccessors
 *
 * These accessors provide convenient getters for component state.
 * They are moderately faster than `ents.getState(componentName)`.
 */

import { _cachedEntityWorldPos, _boundsCheckPos } from './entitiesUtils.js'


/**
 * Sets up all entity accessor methods on the Entities instance.
 * This runs once during construction - no runtime overhead.
 *
 * @param {import('./index.js').Entities} ents
 */
export function setupAccessors(ents) {
    var names = ents.names

    // ============ COMPONENT EXISTENCE CHECKS ============

    /** @internal */
    ents.cameraSmoothed = ents.getComponentAccessor(names.smoothCamera)

    /**
     * Returns whether the entity has a physics body.
     * @type {(id:number) => boolean}
     */
    ents.hasPhysics = ents.getComponentAccessor(names.physics)

    /**
     * Returns whether the entity has a position.
     * @type {(id:number) => boolean}
     */
    ents.hasPosition = ents.getComponentAccessor(names.position)

    /**
     * Returns whether the entity has a mesh.
     * @type {(id:number) => boolean}
     */
    ents.hasMesh = ents.getComponentAccessor(names.mesh)


    // ============ COMPONENT STATE GETTERS ============

    /**
     * Returns the entity's position component state.
     * @type {(id:number) => null | import("../../components/position.js").PositionState}
     */
    ents.getPositionData = ents.getStateAccessor(names.position)

    /**
     * Returns the entity's position vector.
     * @type {(id:number) => number[] | null}
     */
    ents.getPosition = (id) => {
        var state = ents.getPositionData(id)
        return (state) ? state.position : null
    }

    /**
     * Get the entity's `physics` component state.
     * @type {(id:number) => null | import("../../components/physics.js").PhysicsState}
     */
    ents.getPhysics = ents.getStateAccessor(names.physics)

    /**
     * Returns the entity's physics body.
     * Note: will throw if the entity doesn't have the position component!
     * @type {(id:number) => null | import("voxel-physics-engine").RigidBody}
     */
    ents.getPhysicsBody = (id) => {
        var state = ents.getPhysics(id)
        return (state) ? state.body : null
    }

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
    ents.getAABB = (id) => {
        var body = ents.getPhysicsBody(id)
        if (!body || !body.aabb) return null
        return body.aabb
    }

    /**
     * Returns the entity's `mesh` component state.
     * @type {(id:number) => {mesh:any, offset:number[]}}
     */
    ents.getMeshData = ents.getStateAccessor(names.mesh)

    /**
     * Returns the entity's `movement` component state.
     * @type {(id:number) => import('../../components/movement.js').MovementState}
     */
    ents.getMovement = ents.getStateAccessor(names.movement)

    /**
     * Returns the entity's `collideTerrain` component state.
     * @type {(id:number) => {callback: function}}
     */
    ents.getCollideTerrain = ents.getStateAccessor(names.collideTerrain)

    /**
     * Returns the entity's `collideEntities` component state.
     * @type {(id:number) => {
     *      cylinder:boolean, collideBits:number,
     *      collideMask:number, callback: function}}
     */
    ents.getCollideEntities = ents.getStateAccessor(names.collideEntities)

    /**
     * Returns the entity's `label` component state.
     * @type {(id:number) => null | import("../../components/label.js").LabelState}
     */
    ents.getLabel = ents.getStateAccessor(names.label)


    // ============ WORLD POSITION HELPERS ============

    /**
     * Returns the entity's position in world coordinates.
     * Returns center X/Z and base Y of the entity's AABB.
     *
     * @example
     * const [worldX, worldY, worldZ] = noa.entities.getWorldPosition(playerId)
     *
     * @type {(id:number) => number[] | null}
     */
    ents.getWorldPosition = (id) => {
        var aabb = ents.getAABB(id)
        if (!aabb) return null
        var off = ents.noa.worldOriginOffset
        return [
            (aabb.base[0] + aabb.max[0]) / 2 + off[0],
            aabb.base[1] + off[1],
            (aabb.base[2] + aabb.max[2]) / 2 + off[2]
        ]
    }

    /**
     * Returns the entity's world position (cached version for hot paths).
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     *
     * @type {(id:number, out?: number[]) => number[] | null}
     */
    ents.getWorldPositionCached = (id, out) => {
        var aabb = ents.getAABB(id)
        if (!aabb) return null
        var off = ents.noa.worldOriginOffset
        out = out || _cachedEntityWorldPos
        out[0] = (aabb.base[0] + aabb.max[0]) / 2 + off[0]
        out[1] = aabb.base[1] + off[1]
        out[2] = (aabb.base[2] + aabb.max[2]) / 2 + off[2]
        return out
    }

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
    ents.isInWorldBounds = (id, bounds) => {
        // Uses separate cache to avoid corrupting user's getWorldPositionCached() result
        var pos = ents.getWorldPositionCached(id, _boundsCheckPos)
        if (!pos) return false
        if (bounds.xMin !== undefined && pos[0] < bounds.xMin) return false
        if (bounds.xMax !== undefined && pos[0] > bounds.xMax) return false
        if (bounds.yMin !== undefined && pos[1] < bounds.yMin) return false
        if (bounds.yMax !== undefined && pos[1] > bounds.yMax) return false
        if (bounds.zMin !== undefined && pos[2] < bounds.zMin) return false
        if (bounds.zMax !== undefined && pos[2] > bounds.zMax) return false
        return true
    }


    // ============ COLLISION CALLBACK ============

    /**
     * Pairwise collideEntities event - assign your own function to this
     * property if you want to handle entity-entity overlap events.
     * @type {(id1:number, id2:number) => void}
     */
    ents.onPairwiseEntityCollision = function (id1, id2) { }
}


/**
 * Clears accessor references during disposal.
 *
 * @param {import('./index.js').Entities} ents
 */
export function clearAccessors(ents) {
    ents.cameraSmoothed = null
    ents.hasPhysics = null
    ents.hasPosition = null
    ents.getPositionData = null
    ents.getPosition = null
    ents.getPhysics = null
    ents.getPhysicsBody = null
    ents.getAABB = null
    ents.hasMesh = null
    ents.getMeshData = null
    ents.getMovement = null
    ents.getCollideTerrain = null
    ents.getCollideEntities = null
    ents.getLabel = null
    ents.getWorldPosition = null
    ents.getWorldPositionCached = null
    ents.isInWorldBounds = null
    ents.onPairwiseEntityCollision = null
}
