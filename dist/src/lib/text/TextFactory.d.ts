/**
 * Factory functions for creating text meshes.
 * Encapsulates mesh creation logic separate from the Text class.
 */
/**
 * Create a 3D text mesh at a world position.
 * @param {object} params - Creation parameters
 * @param {string} params.content - Text string to render
 * @param {object} params.options - Merged options
 * @param {object} params.Writer - MeshWriter instance
 * @param {object} params.noa - Engine reference
 * @param {object|null} params.textLighting - TextLighting instance
 * @param {object} params.shadowManager - TextShadowManager instance
 * @param {object|null} params.contrastUtils - Color contrast utilities
 * @param {number} params.nextId - Next unique ID
 * @param {Function} params.registerHandle - Callback to register handle
 * @param {Function} params.removeText - Callback to remove text
 * @returns {{handle: TextHandle, nextId: number}|null}
 */
export function createWorldText(params: {
    content: string;
    options: object;
    Writer: object;
    noa: object;
    textLighting: object | null;
    shadowManager: object;
    contrastUtils: object | null;
    nextId: number;
    registerHandle: Function;
    removeText: Function;
}): {
    handle: TextHandle;
    nextId: number;
} | null;
/**
 * Create billboarded text that always faces the camera.
 * @param {object} params - Same as createWorldText
 * @returns {{handle: TextHandle, nextId: number}|null}
 */
export function createBillboardText(params: object): {
    handle: TextHandle;
    nextId: number;
} | null;
/**
 * Update text content (dispose old, create new).
 * @param {TextHandle} handle - Existing text handle
 * @param {string} newContent - New text content
 * @param {object} noa - Engine reference
 * @param {object} createParams - Base params for create functions (without content/options)
 * @returns {TextHandle|null}
 */
export function updateText(handle: TextHandle, newContent: string, noa: object, createParams: object): TextHandle | null;
import { TextHandle } from './TextHandle.js';
