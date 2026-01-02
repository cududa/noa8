import { error } from './logging.js'

/**
 * Manages initialization state and deferred callbacks for the text subsystem.
 * Centralizes ready/failed state tracking and callback handling.
 */
export class ReadyState {
    constructor() {
        /** Whether text system is available and initialized */
        this.ready = false
        /** Whether initialization permanently failed (e.g., meshwriter missing) */
        this.initFailed = false
        /** @internal Deferred callbacks waiting for initialization */
        this._callbacks = []
    }

    /**
     * Mark the system as ready and flush callbacks.
     */
    setReady() {
        this.ready = true
        this.initFailed = false
        this._flush()
    }

    /**
     * Mark initialization as permanently failed.
     * Clears any pending callbacks.
     */
    setFailed() {
        this.ready = false
        this.initFailed = true
        this._callbacks.length = 0
    }

    /**
     * Reset state (for dispose).
     */
    reset() {
        this.ready = false
        this.initFailed = false
        this._callbacks.length = 0
    }

    /**
     * Register a callback to run when ready.
     * If already ready, fires immediately.
     * If failed, does nothing.
     * @param {Function} callback
     */
    onReady(callback) {
        if (typeof callback !== 'function') return
        if (this.ready) {
            this._safeCall(callback)
            return
        }
        if (this.initFailed) return
        this._callbacks.push(callback)
    }

    /**
     * @internal Execute all pending callbacks.
     */
    _flush() {
        if (!this._callbacks.length) return
        var callbacks = this._callbacks.slice()
        this._callbacks.length = 0
        callbacks.forEach((cb) => this._safeCall(cb))
    }

    /**
     * @internal Execute callback with error handling.
     * @param {Function} callback
     */
    _safeCall(callback) {
        try {
            callback()
        } catch (err) {
            error('onReady callback error:', err)
        }
    }
}
