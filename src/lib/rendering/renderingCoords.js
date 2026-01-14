import { Vector3 } from '../babylonExports.js'

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
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
    }

    /**
     * Convert world coordinates to local (rendering) coordinates.
     * Use this when setting mesh.position for meshes registered with noa.
     */
    worldToLocal(x, y, z) {
        var off = this.rendering.noa.worldOriginOffset
        return [x - off[0], y - off[1], z - off[2]]
    }

    /**
     * Cached world-to-local conversion for hot paths.
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     * @param {number[]} [out] - Optional output array to use instead of cache
     */
    worldToLocalCached(x, y, z, out) {
        var off = this.rendering.noa.worldOriginOffset
        out = out || _cachedLocalCoords
        out[0] = x - off[0]
        out[1] = y - off[1]
        out[2] = z - off[2]
        return out
    }

    /**
     * Convert local (rendering) coordinates to world coordinates.
     * Use this when you need the "real" world position of a mesh.
     */
    localToWorld(x, y, z) {
        var off = this.rendering.noa.worldOriginOffset
        return [x + off[0], y + off[1], z + off[2]]
    }

    /**
     * Cached local-to-world conversion for hot paths.
     * Use this in per-frame updates to avoid GC pressure.
     * WARNING: Returns shared internal array - do not store the result!
     * @param {number[]} [out] - Optional output array to use instead of cache
     */
    localToWorldCached(x, y, z, out) {
        var off = this.rendering.noa.worldOriginOffset
        out = out || _cachedWorldCoords
        out[0] = x + off[0]
        out[1] = y + off[1]
        out[2] = z + off[2]
        return out
    }

    /** Set a mesh position using world coordinates (converts internally). */
    setMeshWorldPosition(mesh, x, y, z) {
        var local = this.worldToLocalCached(x, y, z)
        mesh.position.set(local[0], local[1], local[2])
    }

    /** Get a mesh's world position (converted from local coords). */
    getMeshWorldPosition(mesh) {
        var pos = mesh.position
        return this.localToWorld(pos.x, pos.y, pos.z)
    }

    /**
     * Cached variant of getMeshWorldPosition for hot paths.
     * WARNING: Returns shared internal array - do not store the result!
     */
    getMeshWorldPositionCached(mesh, out) {
        var pos = mesh.position
        return this.localToWorldCached(pos.x, pos.y, pos.z, out || _cachedMeshWorldPos)
    }

    /** Copy of the current world origin offset. */
    getWorldOriginOffset() {
        var off = this.rendering.noa.worldOriginOffset
        return [off[0], off[1], off[2]]
    }

    /**
     * Cached world origin offset for hot paths.
     * WARNING: Returns shared internal array - do not store the result!
     */
    getWorldOriginOffsetCached(out) {
        var off = this.rendering.noa.worldOriginOffset
        out = out || _cachedOriginOffset
        out[0] = off[0]
        out[1] = off[1]
        out[2] = off[2]
        return out
    }

    /**
     * Update a shader material's world origin offset uniform.
     * Call this each frame for shaders that need world coordinates.
     *
     * In your shader, recover world coords like:
     *   float worldX = localPos.x + worldOriginOffset.x;
     */
    updateShaderWorldOrigin(material, uniformName) {
        var off = this.rendering.noa.worldOriginOffset
        _shaderOffsetVec.set(off[0], off[1], off[2])
        material.setVector3(uniformName || 'worldOriginOffset', _shaderOffsetVec)
    }

    /**
     * Change world origin offset, and rebase everything with a position.
     * Shifts all unparented meshes and updates octree blocks.
     * @param {number[]} delta
     * @internal
     */
    _rebaseOrigin(delta) {
        var rendering = this.rendering
        _rebaseVec.set(delta[0], delta[1], delta[2])
        var dvec = _rebaseVec

        rendering.scene.meshes.forEach(mesh => {
            // parented meshes don't live in the world coord system
            if (mesh.parent) return

            // move each mesh by delta (even though most are managed by components)
            mesh.position.subtractInPlace(dvec)

            if (mesh.isWorldMatrixFrozen) {
                // paradoxically this unfreezes, then re-freezes the matrix
                mesh.freezeWorldMatrix()
            }
        })

        // updates position of all octree blocks
        rendering._octreeManager.rebase(dvec)
    }
}

// Cached arrays for coordinate conversion hot paths
var _cachedLocalCoords = [0, 0, 0]
var _cachedWorldCoords = [0, 0, 0]
var _cachedMeshWorldPos = [0, 0, 0]
var _cachedOriginOffset = [0, 0, 0]
var _shaderOffsetVec = new Vector3(0, 0, 0)
// Cached Vector3 for origin rebasing to avoid per-rebase allocation
var _rebaseVec = new Vector3(0, 0, 0)
