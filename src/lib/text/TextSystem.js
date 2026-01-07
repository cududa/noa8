import { TextShadowManager } from './shadows/index.js'
import { TextLighting } from './lighting/index.js'
import { ReadyState } from './ReadyState.js'
import { CONSTRUCTOR_DEFAULTS, createDefaultOptions } from './TextDefaults.js'
import { loadMeshWriter } from './MeshWriterLoader.js'
import { createWorldText, createBillboardText, updateText } from './TextFactory.js'
import { TextHandle } from './TextHandle.js'
import { warn, log } from './logging.js'


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
     * @param {import('../../index').Engine} noa
     * @param {object} opts
     */
    constructor(noa, opts) {
        opts = Object.assign({}, CONSTRUCTOR_DEFAULTS, opts)

        /** @internal */
        this.noa = noa

        /** @internal - Manages ready/failed state */
        this._readyState = new ReadyState()

        /** @internal */
        this._disposed = false

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

        /** @internal - Shadow manager for text shadows */
        this._shadowManager = new TextShadowManager(noa)

        /** @internal - Render observer for shadow updates */
        this._renderObserver = null

        /** @internal - Color contrast utilities from meshwriter */
        this._contrastUtils = null

        /** @internal - Camera-relative lighting manager for text */
        this._textLighting = null

        /** @internal - TextLighting options from constructor */
        this._textLightingOpts = opts.textLighting || {}

        /** Default options for text creation */
        this.defaultOptions = createDefaultOptions(opts)

        // Attempt lazy initialization when scene is ready
        if (opts.enabled) {
            this._initWhenReady()
        }
    }

    /** Whether text system is available and initialized */
    get ready() {
        return this._readyState.ready
    }

    /** Whether initialization permanently failed (e.g., meshwriter missing) */
    get initFailed() {
        return this._readyState.initFailed
    }

    /** @internal */
    _initWhenReady() {
        const onSceneReady = async () => {
            if (this._disposed || this.ready || this.initFailed) return
            await this._initialize()
        }
        this.noa.rendering.onSceneReady(onSceneReady)
    }

    /** @internal */
    async _initialize() {
        if (this._disposed || this.ready || this.initFailed) return
        try {
            var scene = this.noa.rendering.getScene()
            if (!scene) return
            var result = await loadMeshWriter(scene, { scale: this.defaultOptions.scale })

            if (this._disposed) {
                return
            }

            this._Writer = result.Writer
            this._registerFont = result.registerFont
            this._MeshWriter = result.MeshWriter
            this._contrastUtils = result.contrastUtils

            // Initialize shadow manager
            this._shadowManager.initialize()

            // Initialize camera-relative text lighting BEFORE marking ready
            // so it's available when onReady callbacks fire
            this._textLighting = new TextLighting(this.noa, this._textLightingOpts)

            this._readyState.setReady()

            // Set up render observer for shadow updates and text lighting
            this._renderObserver = scene.onBeforeRenderObservable.add(() => {
                this._shadowManager.updateShadows()
                if (this._textLighting) {
                    this._textLighting.update()
                }
            })
        } catch (e) {
            warn('MeshWriter not available, text features disabled:', e.message)
            this._readyState.setFailed()
        }
    }


    /**
     * Register a callback to run when the text system becomes ready.
     * If initialization already completed, the callback fires immediately.
     */
    onReady(callback) {
        this._readyState.onReady(callback)
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
            warn('Cannot register font - text system not initialized')
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
            warn('Text system not ready')
            return null
        }

        var opts = Object.assign({}, this.defaultOptions, options)
        var result = createWorldText({
            content,
            options: opts,
            Writer: this._Writer,
            noa: this.noa,
            textLighting: this._textLighting,
            shadowManager: this._shadowManager,
            contrastUtils: this._contrastUtils,
            nextId: this._nextId,
            registerHandle: (id, handle) => this._activeTexts.set(id, handle),
            removeText: (id) => this._activeTexts.delete(id)
        })

        if (result) {
            this._nextId = result.nextId
            return result.handle
        }
        return null
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
        if (this.initFailed) return null
        if (!this.ready || !this._Writer) {
            warn('Text system not ready')
            return null
        }

        var opts = Object.assign({}, this.defaultOptions, options)
        var result = createBillboardText({
            content,
            options: opts,
            Writer: this._Writer,
            noa: this.noa,
            textLighting: this._textLighting,
            shadowManager: this._shadowManager,
            contrastUtils: this._contrastUtils,
            nextId: this._nextId,
            registerHandle: (id, handle) => this._activeTexts.set(id, handle),
            removeText: (id) => this._activeTexts.delete(id)
        })

        if (result) {
            this._nextId = result.nextId
            return result.handle
        }
        return null
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
        if (this.initFailed) return null
        if (!this.ready || !this._Writer) {
            warn('Text system not ready')
            return null
        }

        var createParams = {
            Writer: this._Writer,
            noa: this.noa,
            textLighting: this._textLighting,
            shadowManager: this._shadowManager,
            contrastUtils: this._contrastUtils,
            nextId: this._nextId,
            registerHandle: (id, h) => this._activeTexts.set(id, h),
            removeText: (id) => this._activeTexts.delete(id)
        }

        var newHandle = updateText(handle, newContent, this.noa, createParams)

        // Update nextId if a new handle was created
        if (newHandle) {
            this._nextId++
        }

        return newHandle
    }


    /**
     * Get the shadow manager for configuring shadow defaults.
     * Useful for dev panel integration.
     * @returns {TextShadowManager}
     */
    getShadowManager() {
        return this._shadowManager
    }


    /**
     * Get the text lighting manager for configuring camera-relative lighting.
     * Useful for dev panel integration.
     * @returns {TextLighting|null}
     */
    getTextLighting() {
        return this._textLighting
    }


    /** Dispose all text and cleanup */
    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Remove render observer
        if (this._renderObserver) {
            var scene = this.noa.rendering.getScene()
            if (scene && scene.onBeforeRenderObservable) {
                scene.onBeforeRenderObservable.remove(this._renderObserver)
            }
            this._renderObserver = null
        }

        // Dispose all active texts
        for (var handle of this._activeTexts.values()) {
            handle.dispose()
        }
        this._activeTexts.clear()

        // Dispose shadow manager
        this._shadowManager.dispose()

        // Dispose text lighting manager
        if (this._textLighting) {
            this._textLighting.dispose()
            this._textLighting = null
        }

        this._Writer = null
        this._registerFont = null
        this._MeshWriter = null
        this._readyState.reset()
    }
}


/**
 * @typedef {object} TextOptions
 * @property {number[]} [position] - World position [x, y, z]
 * @property {string} [font] - Font family name (default: 'Helvetica')
 * @property {number} [letterHeight] - Height of letters in world units (default: 1)
 * @property {number} [letterThickness] - Depth of letters (default: 0.1)
 * @property {number} [letterSpacing] - Extra space between letters in world units (added after kerning, default: 0)
 * @property {number} [wordSpacing] - Extra space for word boundaries in world units (added to spaces, default: 0)
 * @property {string} [color] - Hex color string for emissive/face color (default: '#FFFFFF')
 * @property {number} [alpha] - Transparency 0-1 (default: 1)
 * @property {string} [anchor] - 'left', 'center', or 'right' (default: 'center')
 * @property {boolean} [emissiveOnly] - If true, disables lighting (only emissive color shows)
 * @property {string} [diffuseColor] - Hex color for diffuse/lit surfaces (auto-derived if null and autoContrast enabled)
 * @property {string} [ambientColor] - Hex color for ambient/shadow areas (auto-derived if null and autoContrast enabled)
 * @property {string} [specularColor] - Hex color for specular highlights (default: '#000000')
 * @property {boolean} [fogEnabled] - If true, text is affected by scene fog (default: true)
 * @property {object|boolean} [shadow] - Shadow options, true for defaults, or false to disable shadows
 * @property {boolean} [shadow.enabled] - Enable shadows (default: true)
 * @property {number} [shadow.blur] - Shadow blur/softness 0-1 (default: 0.5)
 * @property {boolean} [shadow.merged] - Use single merged shadow vs per-letter (default: true)
 * @property {number} [shadow.opacity] - Shadow opacity 0-1 (default: 0.4)
 * @property {boolean} [autoContrast] - Auto-derive edge colors for WCAG contrast (default: true)
 * @property {boolean} [highContrast] - Adjust provided colors to meet WCAG contrast (default: false)
 * @property {number} [contrastLevel] - Target WCAG contrast ratio, 4.5=AA, 7=AAA (default: 4.5)
 */
