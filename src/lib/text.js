
import * as vec3 from 'gl-vec3'


var defaults = {
    defaultFont: 'Helvetica',
    scale: 1,
    enabled: true,
}


/**
 * `noa.text` - 3D text rendering subsystem (optional)
 *
 * Provides factory methods for creating 3D text meshes in the world.
 * Uses meshwriter-cudu for text-to-mesh conversion with Babylon.js.
 *
 * This module is optional - it only initializes if meshwriter is available.
 * If meshwriter is not installed, `noa.text.ready` will be false and
 * text creation methods will return null.
 *
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * ```js
 * {
 *     defaultFont: 'Helvetica',
 *     scale: 1,
 *     enabled: true,
 * }
 * ```
 */

export class Text {

    /**
     * @internal
     * @param {import('../index').Engine} noa
     * @param {object} opts
     */
    constructor(noa, opts) {
        opts = Object.assign({}, defaults, opts)

        /** @internal */
        this.noa = noa

        /** Whether text system is available and initialized */
        this.ready = false

        /** @internal */
        this._disposed = false
        /** Whether initialization permanently failed (e.g., meshwriter missing) */
        this.initFailed = false
        /** Deferred callbacks waiting for initialization */
        this._readyCallbacks = []

        /** @internal - MeshWriter constructor (set after init) */
        this._Writer = null

        /** @internal - registerFont function from meshwriter */
        this._registerFont = null

        /** @internal - MeshWriter module reference */
        this._MeshWriter = null

        /** @internal - Registry of active text instances for cleanup */
        this._activeTexts = new Map()

        /** @internal - Next unique ID for text instances */
        this._nextId = 1

        /** Default options for text creation */
        this.defaultOptions = {
            font: opts.defaultFont,
            scale: opts.scale,
            letterHeight: 1,
            letterThickness: 0.1,
            color: '#FFFFFF',
            alpha: 1,
            /** @type {'left' | 'center' | 'right'} */
            anchor: /** @type {'center'} */ ('center'),
        }

        // Attempt lazy initialization when scene is ready
        if (opts.enabled) {
            this._initWhenReady()
        }
    }


    /** @internal */
    _initWhenReady() {
        this.noa.rendering.onSceneReady(async () => {
            await this._initialize()
        })
    }


    /** @internal */
    async _initialize() {
        try {
            // Dynamic import to handle optional dependency
            const meshwriter = await import('meshwriter')
            const { MeshWriter, registerFont } = meshwriter

            // Store for font registration API
            this._registerFont = registerFont
            this._MeshWriter = MeshWriter

            // Import and register default font
            try {
                const helvetica = await import('meshwriter/fonts/helvetica')
                registerFont('Helvetica', helvetica.default)
            } catch (e) {
                console.warn('[noa.text] Could not load default Helvetica font:', e)
            }

            // Create MeshWriter instance (async for Babylon 8 CSG2)
            this._Writer = await MeshWriter.createAsync(
                this.noa.rendering.getScene(),
                { scale: this.defaultOptions.scale }
            )

            this.ready = true
            this.initFailed = false
            console.log('[noa.text] Text subsystem initialized')
            this._flushReadyCallbacks()
        } catch (e) {
            console.warn('[noa.text] MeshWriter not available, text features disabled:', e.message)
            this.ready = false
            this.initFailed = true
            this._readyCallbacks.length = 0
        }
    }

    /** @internal */
    _flushReadyCallbacks() {
        if (!this._readyCallbacks.length) return
        const callbacks = this._readyCallbacks.slice()
        this._readyCallbacks.length = 0
        callbacks.forEach((cb) => {
            try {
                cb()
            } catch (err) {
                console.error('[noa.text] onReady callback error:', err)
            }
        })
    }

    /**
     * Register a callback to run when the text system becomes ready.
     * If initialization already completed, the callback fires immediately.
     */
    onReady(callback) {
        if (typeof callback !== 'function') return
        if (this.ready) {
            try {
                callback()
            } catch (err) {
                console.error('[noa.text] onReady callback error:', err)
            }
            return
        }
        if (this.initFailed) return
        this._readyCallbacks.push(callback)
    }


    /**
     * Register a font for use with text rendering.
     * Fonts must be registered before they can be used.
     *
     * @example
     * ```js
     * import jura from 'meshwriter/fonts/jura'
     * noa.text.registerFont('Jura', jura)
     * ```
     *
     * @param {string} name - Font name to register
     * @param {object} fontData - Font data (FontSpec object) from meshwriter/fonts
     */
    registerFont(name, fontData) {
        if (!this._registerFont) {
            console.warn('[noa.text] Cannot register font - text system not initialized')
            return
        }
        this._registerFont(name, fontData)
    }


    /**
     * Create 3D text mesh at a world position.
     * Returns a TextHandle for manipulation and disposal.
     *
     * @example
     * ```js
     * const sign = noa.text.createWorldText('Welcome!', {
     *     position: [100, 10, 50],
     *     letterHeight: 2,
     *     color: '#8B4513',
     * })
     * sign.mesh.rotation.y = Math.PI / 4
     * ```
     *
     * @param {string} content - Text string to render
     * @param {TextOptions} [options] - Text options
     * @returns {TextHandle|null} - Handle for the text, or null if not ready
     */
    createWorldText(content, options = {}) {
        if (this.initFailed) return null
        if (!this.ready || !this._Writer) {
            console.warn('[noa.text] Text system not ready')
            return null
        }

        var opts = Object.assign({}, this.defaultOptions, options)
        var position = opts.position || [0, 0, 0]

        // Create meshwriter text instance
        var textInstance = new this._Writer(content, {
            'font-family': opts.font,
            'letter-height': opts.letterHeight,
            'letter-thickness': opts.letterThickness,
            'color': opts.color,
            'alpha': opts.alpha,
            'anchor': opts.anchor,
            'position': { x: 0, y: 0, z: 0 }
        })

        var mesh = textInstance.getMesh()
        if (!mesh) {
            console.warn('[noa.text] Failed to create text mesh')
            return null
        }

        // Add to noa scene management
        this.noa.rendering.addMeshToScene(mesh, false, position)

        // Position mesh in world (convert global to local)
        var localPos = this.noa.globalToLocal(position, null, [])
        mesh.position.copyFromFloats(localPos[0], localPos[1], localPos[2])

        // Text renders in XZ plane by default, rotate to be vertical (upright)
        mesh.rotation.x = -Math.PI / 2

        // Create handle for management
        var id = this._nextId++
        var handle = new TextHandle(this, id, textInstance, mesh, content, opts)
        this._activeTexts.set(id, handle)

        return handle
    }


    /**
     * Create billboarded text that always faces the camera.
     * Useful for entity labels and floating names.
     *
     * @example
     * ```js
     * const label = noa.text.createBillboardText('Player Name', {
     *     position: [10, 5, 10],
     *     letterHeight: 0.5,
     *     color: '#FFFF00',
     * })
     * ```
     *
     * @param {string} content - Text string
     * @param {TextOptions} [options] - Same as createWorldText
     * @returns {TextHandle|null}
     */
    createBillboardText(content, options = {}) {
        var handle = this.createWorldText(content, options)
        if (handle) {
            handle._billboard = true
            handle.mesh.billboardMode = 7 // BABYLON.Mesh.BILLBOARDMODE_ALL
        }
        return handle
    }


    /**
     * Update text content (dispose old, create new).
     * MeshWriter doesn't support in-place updates, so this recreates the mesh.
     * Position, rotation, and options are preserved.
     *
     * @example
     * ```js
     * const newHandle = noa.text.updateText(oldHandle, 'New text content')
     * ```
     *
     * @param {TextHandle} handle - Existing text handle
     * @param {string} newContent - New text content
     * @returns {TextHandle|null} - New handle (old is disposed)
     */
    updateText(handle, newContent) {
        if (!handle || handle._disposed) return null

        // Preserve position and options
        var mesh = handle.mesh
        var position = [
            mesh.position.x + this.noa.worldOriginOffset[0],
            mesh.position.y + this.noa.worldOriginOffset[1],
            mesh.position.z + this.noa.worldOriginOffset[2],
        ]
        var rotation = mesh.rotation.clone()
        var wasBillboard = handle._billboard
        var options = Object.assign({}, handle._options, { position })

        // Dispose old
        handle.dispose()

        // Create new
        var newHandle = wasBillboard
            ? this.createBillboardText(newContent, options)
            : this.createWorldText(newContent, options)

        if (newHandle && rotation) {
            newHandle.mesh.rotation.copyFrom(rotation)
        }

        return newHandle
    }


    /** @internal */
    _removeText(id) {
        this._activeTexts.delete(id)
    }


    /** Dispose all text and cleanup */
    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Dispose all active texts
        for (var handle of this._activeTexts.values()) {
            handle.dispose()
        }
        this._activeTexts.clear()

        this._Writer = null
        this._registerFont = null
        this._MeshWriter = null
        this.ready = false
        this.initFailed = false
        this._readyCallbacks.length = 0
    }
}


/**
 * Handle for managing a text instance.
 * Provides methods to modify and dispose the text.
 */
class TextHandle {

    /**
     * @internal
     * @param {Text} textSystem
     * @param {number} id
     * @param {object} textInstance
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {string} content
     * @param {object} options
     */
    constructor(textSystem, id, textInstance, mesh, content, options) {
        /** @internal */
        this._textSystem = textSystem
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

        if (this._textInstance && typeof this._textInstance.dispose === 'function') {
            try {
                this._textInstance.dispose()
            } catch (err) {
                console.warn('[noa.text] Failed to dispose text instance:', err)
            }
        }
        if (this.mesh) {
            try {
                this._textSystem.noa.rendering.removeMeshFromScene(this.mesh)
            } catch (err) {
                // ignore - mesh may not be registered
            }
            let disposed = false
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
                    console.warn('[noa.text] Failed to dispose text mesh:', err)
                }
            }
        }
        this._textSystem._removeText(this._id)

        this._textInstance = null
        this.mesh = null
    }
}


/**
 * @typedef {object} TextOptions
 * @property {number[]} [position] - World position [x, y, z]
 * @property {string} [font] - Font family name (default: 'Helvetica')
 * @property {number} [letterHeight] - Height of letters in world units (default: 1)
 * @property {number} [letterThickness] - Depth of letters (default: 0.1)
 * @property {string} [color] - Hex color string (default: '#FFFFFF')
 * @property {number} [alpha] - Transparency 0-1 (default: 1)
 * @property {string} [anchor] - 'left', 'center', or 'right' (default: 'center')
 */
