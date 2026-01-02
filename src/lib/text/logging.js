/**
 * Namespaced logger utility for the text subsystem.
 * Provides consistent prefix for all text-related console output.
 */

const PREFIX = '[noa.text]'

export function log(...args) {
    console.log(PREFIX, ...args)
}

export function warn(...args) {
    console.warn(PREFIX, ...args)
}

export function error(...args) {
    console.error(PREFIX, ...args)
}
