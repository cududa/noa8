
import * as vec3 from 'gl-vec3'
import { TextShadowManager } from './textShadow.js'
import { FresnelParameters, Color3 } from './babylonExports.js'


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

        /** @internal - Shadow manager for text shadows */
        this._shadowManager = new TextShadowManager(noa)

        /** @internal - Render observer for shadow updates */
        this._renderObserver = null

        /** @internal - Color contrast utilities from meshwriter */
        this._contrastUtils = null

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
            /** If true, disables lighting (only emissive color shows) */
            emissiveOnly: false,
            /** Material colors - diffuse affects lit surfaces, ambient affects shadowed areas */
            diffuseColor: null,  // null = auto-derive for contrast (if autoContrast enabled)
            ambientColor: null,  // null = auto-derive for contrast (if autoContrast enabled)
            specularColor: null, // null = use meshwriter default (#000000)
            /** If true, text material is affected by scene fog (default: true) */
            fogEnabled: true,
            /** Shadow options - true = use manager defaults, object = override, false = disable */
            shadow: true,
            /** If true, auto-derive diffuse/ambient colors for WCAG contrast when only color is provided */
            autoContrast: true,
            /** If true and colors are provided, adjust them to meet WCAG contrast requirements */
            highContrast: false,
            /** Target WCAG contrast ratio (4.5 = AA normal, 7 = AAA) */
            contrastLevel: 4.5,
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

            // Import color contrast utilities from meshwriter
            try {
                this._contrastUtils = {
                    deriveEdgeColors: meshwriter.deriveEdgeColors,
                    adjustForContrast: meshwriter.adjustForContrast,
                    hexToRgb: meshwriter.hexToRgb
                }
            } catch (e) {
                console.warn('[noa.text] Color contrast utilities not available:', e.message)
            }

            this.ready = true
            this.initFailed = false
            console.log('[noa.text] Text subsystem initialized')

            // Initialize shadow manager
            this._shadowManager.initialize()

            // Set up render observer for shadow updates
            var scene = this.noa.rendering.getScene()
            this._renderObserver = scene.onBeforeRenderObservable.add(() => {
                this._shadowManager.updateShadows()
            })

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
     * @internal
     * Process color options for contrast requirements
     * @param {object} opts - Text options
     * @returns {{emissive: string, diffuse: string|null, ambient: string|null}}
     */
    _processContrastColors(opts) {
        var emissive = opts.color
        var diffuse = opts.diffuseColor
        var ambient = opts.ambientColor

        // If contrast utilities aren't available, pass through unchanged
        if (!this._contrastUtils) {
            return { emissive, diffuse, ambient }
        }

        // Case 1: User provided only emissive, autoContrast is enabled
        // Auto-derive diffuse and ambient for high contrast
        // Note: deriveEdgeColors may also return a modified emissive for the inverted approach
        if (opts.autoContrast && !diffuse && !ambient) {
            var derived = this._contrastUtils.deriveEdgeColors(emissive, opts.contrastLevel)
            return {
                emissive: derived.emissive || emissive,
                diffuse: derived.diffuse,
                ambient: derived.ambient
            }
        }

        // Case 2: User provided colors + highContrast flag
        // Adjust colors to meet WCAG contrast requirements
        if (opts.highContrast && (diffuse || ambient)) {
            var adjusted = this._contrastUtils.adjustForContrast({
                emissive: emissive,
                diffuse: diffuse || '#404040',
                ambient: ambient || '#202020'
            }, {
                targetContrast: opts.contrastLevel,
                edgeRange: 0.4,
                faceRange: 0.1
            })
            return {
                emissive: adjusted.emissive,
                diffuse: adjusted.diffuse,
                ambient: adjusted.ambient
            }
        }

        // Case 3: Pass through unchanged
        return { emissive, diffuse, ambient }
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

        // Process colors for contrast requirements
        var processedColors = this._processContrastColors(opts)

        // Build colors object for meshwriter (only include non-null values)
        var colors = {}
        if (processedColors.diffuse) colors.diffuse = processedColors.diffuse
        if (processedColors.ambient) colors.ambient = processedColors.ambient
        if (opts.specularColor) colors.specular = opts.specularColor

        // Create meshwriter text instance
        var textInstance = new this._Writer(content, {
            'font-family': opts.font,
            'letter-height': opts.letterHeight,
            'letter-thickness': opts.letterThickness,
            'color': processedColors.emissive,
            'alpha': opts.alpha,
            'anchor': opts.anchor,
            'emissive-only': opts.emissiveOnly,
            'fog-enabled': opts.fogEnabled,
            'colors': Object.keys(colors).length > 0 ? colors : undefined,
            'position': { x: 0, y: 0, z: 0 }
        })

        var mesh = textInstance.getMesh()
        if (!mesh) {
            console.warn('[noa.text] Failed to create text mesh')
            return null
        }

        // Apply fresnel for front face / edge contrast (dyslexia accessibility)
        var material = textInstance.getMaterial()
        if (material && opts.autoContrast) {
            // Disable backface culling to see all faces
            material.backFaceCulling = false

            // Fresnel makes front-facing surfaces bright, edges dark
            material.emissiveFresnelParameters = new FresnelParameters()
            material.emissiveFresnelParameters.power = 4  // Higher = sharper transition
            material.emissiveFresnelParameters.bias = 0   // No base brightness
            // leftColor = when surface normal points toward camera (bright)
            // rightColor = when surface at grazing angle (dark)
            var brightColor = this._contrastUtils ? this._contrastUtils.hexToRgb(opts.color) : { r: 1, g: 0.843, b: 0 }
            var darkColor = { r: 0.15, g: 0.12, b: 0 }
            material.emissiveFresnelParameters.leftColor = new Color3(brightColor.r, brightColor.g, brightColor.b)
            material.emissiveFresnelParameters.rightColor = new Color3(darkColor.r, darkColor.g, darkColor.b)

            // Set base emissive to zero (fresnel will add it)
            material.emissiveColor = new Color3(0, 0, 0)
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

        // Create shadows if enabled
        var shadowOptions = opts.shadow
        if (shadowOptions !== false) {
            var resolvedShadowOpts = (shadowOptions === true || shadowOptions === undefined)
                ? undefined
                : shadowOptions
            this._shadowManager.createShadowsForText(handle, resolvedShadowOpts)
        }

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


    /**
     * Get the shadow manager for configuring shadow defaults.
     * Useful for dev panel integration.
     * @returns {TextShadowManager}
     */
    getShadowManager() {
        return this._shadowManager
    }


    /** Dispose all text and cleanup */
    dispose() {
        if (this._disposed) return
        this._disposed = true

        // Remove render observer
        if (this._renderObserver) {
            var scene = this.noa.rendering.getScene()
            scene.onBeforeRenderObservable.remove(this._renderObserver)
            this._renderObserver = null
        }

        // Dispose all active texts
        for (var handle of this._activeTexts.values()) {
            handle.dispose()
        }
        this._activeTexts.clear()

        // Dispose shadow manager
        this._shadowManager.dispose()

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
        // Remove shadows
        this._textSystem._shadowManager.removeShadows(this._id)

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
