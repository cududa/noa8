/**
 * Shadow instance tracking.
 * Manages Map of textId -> shadow data.
 */

/**
 * @typedef {object} ShadowData
 * @property {object} textHandle - Reference to text handle
 * @property {object} shadow - Babylon InstancedMesh
 * @property {object} opts - Shadow options
 * @property {number} width - Shadow width
 * @property {number} depth - Shadow depth
 * @property {number} centerOffsetX - X offset from mesh origin
 * @property {number} centerOffsetZ - Z offset from mesh origin
 */

export class ShadowInstances {
    constructor() {
        /** @type {Map<number, ShadowData>} */
        this._instances = new Map()
    }

    /**
     * Get shadow data by text ID.
     * @param {number} textId
     * @returns {ShadowData|undefined}
     */
    get(textId) {
        return this._instances.get(textId)
    }

    /**
     * Check if shadow exists for text ID.
     * @param {number} textId
     * @returns {boolean}
     */
    has(textId) {
        return this._instances.has(textId)
    }

    /**
     * Set shadow data for text ID.
     * @param {number} textId
     * @param {ShadowData} data
     */
    set(textId, data) {
        this._instances.set(textId, data)
    }

    /**
     * Delete shadow data for text ID.
     * @param {number} textId
     * @returns {boolean}
     */
    delete(textId) {
        return this._instances.delete(textId)
    }

    /**
     * Get iterator over all entries.
     * @returns {IterableIterator<[number, ShadowData]>}
     */
    entries() {
        return this._instances.entries()
    }

    /**
     * Get iterator over all keys (text IDs).
     * @returns {IterableIterator<number>}
     */
    keys() {
        return this._instances.keys()
    }

    /**
     * Get number of shadows.
     * @returns {number}
     */
    get size() {
        return this._instances.size
    }

    /**
     * Clear all instances.
     */
    clear() {
        this._instances.clear()
    }

    /**
     * Iterate over entries with forEach.
     * @param {(value: ShadowData, key: number, map: Map<number, ShadowData>) => void} callback
     */
    forEach(callback) {
        this._instances.forEach(callback)
    }
}
