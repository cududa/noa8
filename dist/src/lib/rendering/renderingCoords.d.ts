/**
 * Coordinate conversion and origin rebasing helpers.
 *
 * noa uses a "rebasing" system to prevent floating-point precision issues.
 * When the player moves far from (0,0,0), noa shifts everything to keep
 * the player near the origin in "local" coordinates.
 *
 *   - WORLD coords: Absolute positions in the game world
 *   - LOCAL coords: Positions relative to the current origin offset (what Babylon renders)
 *
 *   Relationship: local = world - worldOriginOffset
 *                 world = local + worldOriginOffset
 */
export class RenderingCoords {
    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering: import("./index.js").Rendering);
    /** @type {import('./index.js').Rendering} */
    rendering: import("./index.js").Rendering;
    /**
     * Convert world coordinates to local (rendering) coordinates.
     * Use this when setting mesh.position for meshes registered with noa.
     */
    worldToLocal(x: any, y: any, z: any): number[];
    /**
     * Cached world-to-local conversion for hot paths.
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     * @param {number[]} [out] - Optional output array to use instead of cache
     */
    worldToLocalCached(x: any, y: any, z: any, out?: number[]): number[];
    /**
     * Convert local (rendering) coordinates to world coordinates.
     * Use this when you need the "real" world position of a mesh.
     */
    localToWorld(x: any, y: any, z: any): any[];
    /**
     * Cached local-to-world conversion for hot paths.
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     * @param {number[]} [out] - Optional output array to use instead of cache
     */
    localToWorldCached(x: any, y: any, z: any, out?: number[]): number[];
    /** Set a mesh position using world coordinates (converts internally). */
    setMeshWorldPosition(mesh: any, x: any, y: any, z: any): void;
    /** Get a mesh's world position (converted from local coords). */
    getMeshWorldPosition(mesh: any): any[];
    /**
     * Cached variant of getMeshWorldPosition for hot paths.
     * WARNING: Returns shared internal array - do not store the result!
     */
    getMeshWorldPositionCached(mesh: any, out: any): number[];
    /** Copy of the current world origin offset. */
    getWorldOriginOffset(): number[];
    /**
     * Cached world origin offset for hot paths.
     * WARNING: Returns shared internal array - do not store the result!
     */
    getWorldOriginOffsetCached(out: any): any;
    /**
     * Update a shader material's world origin offset uniform.
     * Call this each frame for shaders that need world coordinates.
     *
     * In your shader, recover world coords like:
     *   float worldX = localPos.x + worldOriginOffset.x;
     */
    updateShaderWorldOrigin(material: any, uniformName: any): void;
    /**
     * Change world origin offset, and rebase everything with a position.
     * Shifts all unparented meshes and updates octree blocks.
     * @param {number[]} delta
     * @internal
     */
    _rebaseOrigin(delta: number[]): void;
}
