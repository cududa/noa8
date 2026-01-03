/**
 * Handles lazy loading of the meshwriter module and font registration.
 * Encapsulates the optional dependency pattern.
 */
/**
 * @typedef {object} MeshWriterResult
 * @property {object} Writer - MeshWriter instance (created via createAsync)
 * @property {Function} registerFont - Font registration function
 * @property {object} MeshWriter - MeshWriter module reference
 * @property {object|null} contrastUtils - Color contrast utilities or null
 */
/**
 * Load and initialize MeshWriter with the default font.
 * @param {object} scene - Babylon scene
 * @param {object} opts - Options { scale }
 * @returns {Promise<MeshWriterResult>}
 * @throws {Error} If meshwriter is not available
 */
export function loadMeshWriter(scene: object, opts: object): Promise<MeshWriterResult>;
export type MeshWriterResult = {
    /**
     * - MeshWriter instance (created via createAsync)
     */
    Writer: object;
    /**
     * - Font registration function
     */
    registerFont: Function;
    /**
     * - MeshWriter module reference
     */
    MeshWriter: object;
    /**
     * - Color contrast utilities or null
     */
    contrastUtils: object | null;
};
