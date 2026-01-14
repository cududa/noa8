/**
 * Sets up all entity accessor methods on the Entities instance.
 * This runs once during construction - no runtime overhead.
 *
 * @param {import('./index.js').Entities} ents
 */
export function setupAccessors(ents: import("./index.js").Entities): void;
/**
 * Clears accessor references during disposal.
 *
 * @param {import('./index.js').Entities} ents
 */
export function clearAccessors(ents: import("./index.js").Entities): void;
