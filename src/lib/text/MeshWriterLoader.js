import { log, warn } from './logging.js'

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
export async function loadMeshWriter(scene, opts) {
    // Dynamic import to handle optional dependency
    var meshwriter = await import('meshwriter')
    var { MeshWriter, registerFont } = meshwriter

    // Import and register default font
    try {
        var helvetica = await import('meshwriter/fonts/helvetica')
        registerFont('Helvetica', helvetica.default)
    } catch (e) {
        warn('Could not load default Helvetica font:', e)
    }

    // Create MeshWriter instance (async for Babylon 8 CSG2)
    var Writer = await MeshWriter.createAsync(scene, { scale: opts.scale })

    // Extract color contrast utilities
    var contrastUtils = null
    try {
        contrastUtils = {
            deriveEdgeColors: meshwriter.deriveEdgeColors,
            adjustForContrast: meshwriter.adjustForContrast,
            hexToRgb: meshwriter.hexToRgb
        }
    } catch (e) {
        warn('Color contrast utilities not available:', e.message)
    }

    log('Text subsystem initialized')

    return {
        Writer,
        registerFont,
        MeshWriter,
        contrastUtils
    }
}
