/**
 * Position management class for the Entities module.
 * Handles setting entity positions and updating all derived state.
 */
export class EntityPositions {
    /**
     * @param {import('./index.js').Entities} entities
     */
    constructor(entities: import("./index.js").Entities);
    /** @internal @type {import('./index.js').Entities} */
    _entities: import("./index.js").Entities;
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
}
