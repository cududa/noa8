/**
 * Coordinate conversion and origin rebasing helpers.
 *
 * noa uses a "rebasing" system to keep the player near the origin in local space:
 *   - WORLD coords: absolute positions in the game world
 *   - LOCAL coords: world coords offset by the current origin (what Babylon renders)
 *     local = world - worldOriginOffset
 *     world = local + worldOriginOffset
 */
export class RenderingCoords {
    /** @param {import('./rendering').Rendering} rendering */
    constructor(rendering: import("./rendering").Rendering);
    /** @type {import('./rendering').Rendering} */
    rendering: import("./rendering").Rendering;
    /** Convert world coordinates to local (rendering) coordinates. */
    worldToLocal(x: any, y: any, z: any): number[];
    /**
     * Cached world-to-local conversion for hot paths. Returns the provided `out`
     * array or an internal shared buffer - do not store the reference.
     */
    worldToLocalCached(x: any, y: any, z: any, out: any): any;
    /** Convert local (rendering) coordinates back to world coordinates. */
    localToWorld(x: any, y: any, z: any): any[];
    /**
     * Cached local-to-world conversion for hot paths. Returns the provided `out`
     * array or an internal shared buffer - do not store the reference.
     */
    localToWorldCached(x: any, y: any, z: any, out: any): any;
    /** Set a mesh position using world coordinates (converts internally). */
    setMeshWorldPosition(mesh: any, x: any, y: any, z: any): void;
    /** Get a mesh's world position (converted from local coords). */
    getMeshWorldPosition(mesh: any): any[];
    /** Cached variant of getMeshWorldPosition for hot paths. */
    getMeshWorldPositionCached(mesh: any, out: any): any;
    /** Copy of the current world origin offset. */
    getWorldOriginOffset(): number[];
    /** Cached world origin offset for hot paths. */
    getWorldOriginOffsetCached(out: any): any;
    /**
     * Update a shader material's world origin offset uniform.
     * Call this each frame for shaders that need world coordinates.
     */
    updateShaderWorldOrigin(material: any, uniformName: any): void;
    /**
     * Rebase world origin, shifting all unparented meshes and octree blocks.
     * @param {number[]} delta
     * @internal
     */
    _rebaseOrigin(delta: number[]): void;
}
