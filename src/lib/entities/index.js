/**
 * Entities module - manages entities and components.
 * @module entities
 */

import ECS from 'ent-comp'
import * as vec3 from 'gl-vec3'

// Component definitions
import collideEntitiesComp from '../../components/collideEntities.js'
import collideTerrainComp from '../../components/collideTerrain.js'
import fadeOnZoomComp from '../../components/fadeOnZoom.js'
import followsEntityComp from '../../components/followsEntity.js'
import labelComp from '../../components/label.js'
import meshComp from '../../components/mesh.js'
import movementComp from '../../components/movement.js'
import physicsComp from '../../components/physics.js'
import positionComp from '../../components/position.js'
import receivesInputsComp from '../../components/receivesInputs.js'
import shadowComp from '../../components/shadow.js'
import smoothCameraComp from '../../components/smoothCamera.js'

// Sub-modules
import { defaultOptions } from './entitiesUtils.js'
import { setupAccessors, clearAccessors } from './entityAccessors.js'
import { EntityPositions } from './entityPositions.js'
import { EntityQueryImpl, EntitySpatialQueries } from './entityQueries.js'


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

    // ============ ACCESSOR PROPERTY DECLARATIONS ============
    // These are assigned dynamically in setupAccessors() but declared
    // here for TypeScript recognition.

    /** @internal @type {(id:number) => boolean} */
    cameraSmoothed

    /**
     * Returns whether the entity has a physics body.
     * @type {(id:number) => boolean}
     */
    hasPhysics

    /**
     * Returns whether the entity has a position.
     * @type {(id:number) => boolean}
     */
    hasPosition

    /**
     * Returns whether the entity has a mesh.
     * @type {(id:number) => boolean}
     */
    hasMesh

    /**
     * Returns the entity's position component state.
     * @type {(id:number) => null | import("../../components/position.js").PositionState}
     */
    getPositionData

    /**
     * Returns the entity's position vector.
     * @type {(id:number) => number[] | null}
     */
    getPosition

    /**
     * Get the entity's `physics` component state.
     * @type {(id:number) => null | import("../../components/physics.js").PhysicsState}
     */
    getPhysics

    /**
     * Returns the entity's physics body.
     * Note, will throw if the entity doesn't have the position component!
     * @type {(id:number) => null | import("voxel-physics-engine").RigidBody}
     */
    getPhysicsBody

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
    getAABB

    /**
     * Returns the entity's `mesh` component state.
     * @type {(id:number) => {mesh:any, offset:number[]}}
     */
    getMeshData

    /**
     * Returns the entity's `movement` component state.
     * @type {(id:number) => import('../../components/movement.js').MovementState}
     */
    getMovement

    /**
     * Returns the entity's `collideTerrain` component state.
     * @type {(id:number) => {callback: function}}
     */
    getCollideTerrain

    /**
     * Returns the entity's `collideEntities` component state.
     * @type {(id:number) => {
     *      cylinder:boolean, collideBits:number,
     *      collideMask:number, callback: function}}
     */
    getCollideEntities

    /**
     * Returns the entity's `label` component state.
     * @type {(id:number) => null | import("../../components/label.js").LabelState}
     */
    getLabel

    /**
     * Returns the entity's position in world coordinates.
     * Returns center X/Z and base Y of the entity's AABB.
     *
     * @example
     * const [worldX, worldY, worldZ] = noa.entities.getWorldPosition(playerId)
     *
     * @type {(id:number) => number[] | null}
     */
    getWorldPosition

    /**
     * Returns the entity's world position (cached version for hot paths).
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     *
     * @type {(id:number, out?: number[]) => number[] | null}
     */
    getWorldPositionCached

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
    isInWorldBounds

    /**
     * Pairwise collideEntities event - assign your own function to this
     * property if you want to handle entity-entity overlap events.
     * @type {(id1:number, id2:number) => void}
     */
    onPairwiseEntityCollision


    /** @internal */
    constructor(noa, opts) {
        super()
        opts = Object.assign({}, defaultOptions, opts)

        /**
         * @internal
         * @type {import('../../index.js').Engine}
         */
        this.noa = noa

        /** @internal */
        this._disposed = false

        /**
         * Hash containing the component names of built-in components.
         * @type {{ [key:string]: string }}
         */
        this.names = {}

        // Register all built-in components
        this._registerComponents(opts)

        // Initialize sub-modules
        /** @internal */
        this._positions = new EntityPositions(this)
        /** @internal */
        this._spatialQueries = new EntitySpatialQueries(this)

        // Setup all accessor methods (runs once, no runtime overhead)
        setupAccessors(this)
    }


    // ============ COMPONENT REGISTRATION ============

    /**
     * Register all built-in components.
     * Calls `createComponent` on all component definitions, and
     * stores their names in `ents.names`.
     * @internal
     * @param {import('./entitiesUtils.js').EntitiesOptions} opts
     */
    _registerComponents(opts) {
        // optional arguments to supply to component creation functions
        var componentArgs = {
            'shadow': opts.shadowDistance,
        }

        var compDefs = {
            collideEntities: collideEntitiesComp,
            collideTerrain: collideTerrainComp,
            fadeOnZoom: fadeOnZoomComp,
            followsEntity: followsEntityComp,
            label: labelComp,
            mesh: meshComp,
            movement: movementComp,
            physics: physicsComp,
            position: positionComp,
            receivesInputs: receivesInputsComp,
            shadow: shadowComp,
            smoothCamera: smoothCameraComp,
        }

        Object.keys(compDefs).forEach(bareName => {
            var arg = componentArgs[bareName] || undefined
            var compFn = compDefs[bareName]
            var compDef = compFn(this.noa, arg)
            this.names[bareName] = this.createComponent(compDef)
        })
    }


    // ============ QUERY API ============

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
    query(componentName) {
        return new EntityQueryImpl(this, componentName)
    }


    // ============ POSITION API ============

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
        this._positions.setPosition(id, pos, y, z)
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
        this._positions.setEntitySize(id, xs, ys, zs)
    }

    /**
     * Called when engine rebases its local coords.
     * @internal
     * @param {number[]} delta
     */
    _rebaseOrigin(delta) {
        this._positions._rebaseOrigin(delta)
    }

    /**
     * @internal
     * @param {number} id
     * @returns {number[]}
     */
    _localGetPosition(id) {
        return this._positions._localGetPosition(id)
    }

    /**
     * @internal
     * @param {number} id
     * @param {number[]} pos
     */
    _localSetPosition(id, pos) {
        this._positions._localSetPosition(id, pos)
    }

    /**
     * Helper to update everything derived from `_localPosition`.
     * @internal
     * @param {number} id
     * @param {import('../../components/position.js').PositionState} posDat
     */
    _updateDerivedPositionData(id, posDat) {
        this._positions._updateDerivedPositionData(id, posDat)
    }


    // ============ SPATIAL QUERIES ============

    /**
     * Checks whether a voxel is obstructed by any entity (with the
     * `collidesTerrain` component).
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    isTerrainBlocked(x, y, z) {
        return this._spatialQueries.isTerrainBlocked(x, y, z)
    }

    /**
     * Gets an array of all entities overlapping the given AABB.
     *
     * @param {{ base: number[], max: number[] }} box
     * @param {string} [withComponent] - Optional component filter
     * @returns {number[]}
     */
    getEntitiesInAABB(box, withComponent) {
        return this._spatialQueries.getEntitiesInAABB(box, withComponent)
    }


    // ============ ENTITY MANAGEMENT ============
    // Note: most entity APIs are on the base ECS module (ent-comp).
    // These are noa-specific extras.

    /**
     * Safely add a component - if the entity already had the
     * component, this will remove and re-add it.
     *
     * @param {number} id
     * @param {string} name
     * @param {object} [state]
     */
    addComponentAgain(id, name, state) {
        if (this.hasComponent(id, name)) this.removeComponent(id, name)
        this.addComponent(id, name, state)
    }


    // ============ ENTITY FACTORY ============

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
    add(position = null, width = 1, height = 1,
        mesh = null, meshOffset = null, doPhysics = false, shadow = false) {

        var self = this

        // new entity
        var eid = this.createEntity()

        // position component
        this.addComponent(eid, this.names.position, {
            position: position || vec3.create(),
            width: width,
            height: height,
        })

        // rigid body in physics simulator
        if (doPhysics) {
            this.addComponent(eid, this.names.physics)
            var body = this.getPhysics(eid).body

            // handler for physics engine to call on auto-step
            var smoothName = this.names.smoothCamera
            body.onStep = function () {
                self.addComponentAgain(eid, smoothName)
            }
        }

        // mesh for the entity
        if (mesh) {
            if (!meshOffset) meshOffset = vec3.create()
            this.addComponent(eid, this.names.mesh, {
                mesh: mesh,
                offset: meshOffset
            })
        }

        // add shadow-drawing component
        if (shadow) {
            this.addComponent(eid, this.names.shadow, { size: width })
        }

        return eid
    }


    // ============ LIFECYCLE ============

    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Clear accessor function references
        clearAccessors(this)

        // Delete all entities (triggers onRemove handlers for cleanup)
        var ids = new Set()
        if (this._storage) {
            Object.keys(this._storage).forEach(compName => {
                var store = this._storage[compName]
                if (!store || !store.hash) return
                Object.keys(store.hash).forEach(id => {
                    if (store.hash[id]) ids.add(Number(id))
                })
            })
        }
        ids.forEach(id => this.deleteEntity(id))

        // Run deferred cleanup synchronously so pending timers don't touch disposed stores
        try {
            this.tick(0)
            this.render(0)
        } catch (err) { /* ignore cleanup errors during disposal */ }

        // Flush any remaining pending removals before disposing stores
        if (this._storage) {
            Object.keys(this._storage).forEach(compName => {
                var store = this._storage[compName]
                if (store && typeof store.flush === 'function') store.flush()
            })
        }

        // Dispose component stores
        if (this._storage) {
            Object.keys(this._storage).forEach(compName => {
                var store = this._storage[compName]
                if (store && typeof store.dispose === 'function') store.dispose()
            })
        }

        // Clear remaining references
        this.components = {}
        this.comps = this.components
        this._systems.length = 0
        this._renderSystems.length = 0
        this.names = null
        this.noa = null
        this._positions = null
        this._spatialQueries = null
    }
}
