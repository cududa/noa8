import { warn } from './logging.js'

/**
 * Handle for managing a text instance.
 * Provides methods to modify and dispose the text.
 */
export class TextHandle {

    /**
     * @internal
     * @param {object} config - Configuration object
     * @param {Function} config.removeText - Callback to remove from registry
     * @param {Function} config.removeShadows - Callback to remove shadows
     * @param {Function} config.removeFromLighting - Callback to remove from lighting
     * @param {Function} config.removeMeshFromScene - Callback to remove mesh from scene
     * @param {number} id - Unique ID
     * @param {object} textInstance - MeshWriter text instance
     * @param {import('@babylonjs/core').Mesh} mesh - Babylon mesh
     * @param {string} content - Text content
     * @param {object} options - Creation options
     */
    constructor(config, id, textInstance, mesh, content, options) {
        /** @internal */
        this._config = config
        /** @internal */
        this._id = id
        /** @internal */
        this._textInstance = textInstance
        /** @internal */
        this._disposed = false
        /** @internal */
        this._billboard = false
        /** @internal */
        this._options = options

        /** The Babylon mesh for this text */
        this.mesh = mesh
        /** The text content */
        this.content = content
    }

    /**
     * Set the text color
     * @param {string} color - Hex color string (e.g., '#FF0000')
     */
    setColor(color) {
        if (this._disposed) return
        this._textInstance.setColor(color)
    }

    /**
     * Set the text alpha/transparency
     * @param {number} alpha - Transparency value (0-1)
     */
    setAlpha(alpha) {
        if (this._disposed) return
        this._textInstance.setAlpha(alpha)
    }

    /**
     * Get the underlying Babylon mesh
     * @returns {import('@babylonjs/core').Mesh}
     */
    getMesh() {
        return this.mesh
    }

    /** Dispose this text instance and clean up resources */
    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Remove from text lighting BEFORE disposing mesh
        if (this.mesh) {
            this._config.removeFromLighting(this.mesh)
        }

        if (this._textInstance && typeof this._textInstance.dispose === 'function') {
            try {
                this._textInstance.dispose()
            } catch (err) {
                warn('Failed to dispose text instance:', err)
            }
        }

        if (this.mesh) {
            try {
                this._config.removeMeshFromScene(this.mesh)
            } catch (err) {
                // ignore - mesh may not be registered
            }
            var disposed = false
            if (typeof this.mesh.isDisposed === 'function') {
                try {
                    disposed = this.mesh.isDisposed()
                } catch (err) {
                    disposed = false
                }
            }
            if (!disposed && typeof this.mesh.dispose === 'function') {
                try {
                    this.mesh.dispose()
                } catch (err) {
                    warn('Failed to dispose text mesh:', err)
                }
            }
        }

        // Remove shadows
        this._config.removeShadows(this._id)

        // Remove from registry
        this._config.removeText(this._id)

        this._textInstance = null
        this.mesh = null
    }
}
