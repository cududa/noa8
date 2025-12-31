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
    constructor(noa: import("../index").Engine, opts: object);
    /** @internal */
    noa: import("../index").Engine;
    /** Whether text system is available and initialized */
    ready: boolean;
    /** @internal */
    _disposed: boolean;
    /** @internal - MeshWriter constructor (set after init) */
    _Writer: import("meshwriter").MeshWriterConstructor;
    /** @internal - registerFont function from meshwriter */
    _registerFont: typeof import("meshwriter").registerFont;
    /** @internal - MeshWriter module reference */
    _MeshWriter: import("meshwriter").MeshWriterStatic;
    /** @internal - Registry of active text instances for cleanup */
    _activeTexts: Map<any, any>;
    /** @internal - Next unique ID for text instances */
    _nextId: number;
    /** Default options for text creation */
    defaultOptions: {
        font: any;
        scale: any;
        letterHeight: number;
        letterThickness: number;
        color: string;
        alpha: number;
        /** @type {'left' | 'center' | 'right'} */
        anchor: "left" | "center" | "right";
    };
    /** @internal */
    _initWhenReady(): void;
    /** @internal */
    _initialize(): Promise<void>;
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
    registerFont(name: string, fontData: object): void;
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
    createWorldText(content: string, options?: TextOptions): TextHandle | null;
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
    createBillboardText(content: string, options?: TextOptions): TextHandle | null;
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
    updateText(handle: TextHandle, newContent: string): TextHandle | null;
    /** @internal */
    _removeText(id: any): void;
    /** Dispose all text and cleanup */
    dispose(): void;
}
export type TextOptions = {
    /**
     * - World position [x, y, z]
     */
    position?: number[];
    /**
     * - Font family name (default: 'Helvetica')
     */
    font?: string;
    /**
     * - Height of letters in world units (default: 1)
     */
    letterHeight?: number;
    /**
     * - Depth of letters (default: 0.1)
     */
    letterThickness?: number;
    /**
     * - Hex color string (default: '#FFFFFF')
     */
    color?: string;
    /**
     * - Transparency 0-1 (default: 1)
     */
    alpha?: number;
    /**
     * - 'left', 'center', or 'right' (default: 'center')
     */
    anchor?: string;
};
/**
 * Handle for managing a text instance.
 * Provides methods to modify and dispose the text.
 */
declare class TextHandle {
    /**
     * @internal
     * @param {Text} textSystem
     * @param {number} id
     * @param {object} textInstance
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {string} content
     * @param {object} options
     */
    constructor(textSystem: Text, id: number, textInstance: object, mesh: import("@babylonjs/core").Mesh, content: string, options: object);
    /** @internal */
    _textSystem: Text;
    /** @internal */
    _id: number;
    /** @internal */
    _textInstance: any;
    /** @internal */
    _disposed: boolean;
    /** @internal */
    _billboard: boolean;
    /** @internal */
    _options: any;
    /** The Babylon mesh for this text */
    mesh: import("@babylonjs/core").Mesh;
    /** The text content */
    content: string;
    /**
     * Set the text color
     * @param {string} color - Hex color string (e.g., '#FF0000')
     */
    setColor(color: string): void;
    /**
     * Set the text alpha/transparency
     * @param {number} alpha - Transparency value (0-1)
     */
    setAlpha(alpha: number): void;
    /**
     * Get the underlying Babylon mesh
     * @returns {import('@babylonjs/core').Mesh}
     */
    getMesh(): import("@babylonjs/core").Mesh;
    /** Dispose this text instance and clean up resources */
    dispose(): void;
}
export {};
