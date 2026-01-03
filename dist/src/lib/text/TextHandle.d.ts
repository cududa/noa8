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
     * @param {import('@babylonjs/core').Mesh|null} [faceMesh] - Optional emissive face mesh
     */
    constructor(config: {
        removeText: Function;
        removeShadows: Function;
        removeFromLighting: Function;
        removeMeshFromScene: Function;
    }, id: number, textInstance: object, mesh: import("@babylonjs/core").Mesh, content: string, options: object, faceMesh?: import("@babylonjs/core").Mesh | null);
    /** @internal */
    _config: {
        removeText: Function;
        removeShadows: Function;
        removeFromLighting: Function;
        removeMeshFromScene: Function;
    };
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
    /** @internal */
    _meshDisposeObserver: import("@babylonjs/core").Observer<import("@babylonjs/core").Node>;
    /** The Babylon mesh for this text */
    mesh: import("@babylonjs/core").Mesh;
    /** Optional emissive face mesh (child of mesh) */
    faceMesh: import("@babylonjs/core").Mesh;
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
    /**
     * Get the emissive face mesh if available.
     * @returns {import('@babylonjs/core').Mesh|null}
     */
    getFaceMesh(): import("@babylonjs/core").Mesh | null;
    /** Dispose this text instance and clean up resources */
    dispose(): void;
    /** @internal */
    _handleExternalMeshDispose(): void;
    /** @internal */
    _disposeInternal(meshAlreadyDisposed: any): void;
}
