/**
 * Manages initialization state and deferred callbacks for the text subsystem.
 * Centralizes ready/failed state tracking and callback handling.
 */
export class ReadyState {
    /** Whether text system is available and initialized */
    ready: boolean;
    /** Whether initialization permanently failed (e.g., meshwriter missing) */
    initFailed: boolean;
    /** @internal Deferred callbacks waiting for initialization */
    _callbacks: any[];
    /**
     * Mark the system as ready and flush callbacks.
     */
    setReady(): void;
    /**
     * Mark initialization as permanently failed.
     * Clears any pending callbacks.
     */
    setFailed(): void;
    /**
     * Reset state (for dispose).
     */
    reset(): void;
    /**
     * Register a callback to run when ready.
     * If already ready, fires immediately.
     * If failed, does nothing.
     * @param {Function} callback
     */
    onReady(callback: Function): void;
    /**
     * @internal Execute all pending callbacks.
     */
    _flush(): void;
    /**
     * @internal Execute callback with error handling.
     * @param {Function} callback
     */
    _safeCall(callback: Function): void;
}
