/** Create a small FPS overlay for quick perf inspection */
export function setUpFPS(): void;
export const profile_hook: (state: any) => void;
export function fps_hook(): void;
/**
 * Misc helpers used by the renderer: picking, highlight geometry, debug checks.
 */
export class RenderingUtils {
    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering: import("./index.js").Rendering);
    rendering: import("./index.js").Rendering;
    /** @type {import('@babylonjs/core').Mesh | null} */ _highlightMesh: import("@babylonjs/core").Mesh | null;
    _pickOriginVec: Vector3;
    _pickDirectionVec: Vector3;
    _pickRay: Ray;
    /** @type {(mesh: import('@babylonjs/core').AbstractMesh) => boolean} */
    _terrainPickPredicate: (mesh: import("@babylonjs/core").AbstractMesh) => boolean;
    /**
     * Pick terrain from the camera position along the camera direction.
     * @param {number} [distance=-1]
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainFromCamera(distance?: number): import("@babylonjs/core").PickingInfo | null;
    /**
     * Cast a ray for terrain picking from an origin/direction.
     * @param {number[]} origin world or local coordinates
     * @param {number[]} direction direction vector
     * @param {number} [distance=-1]
     * @param {boolean} [originIsLocal=false]
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainWithRay(origin: number[], direction: number[], distance?: number, originIsLocal?: boolean): import("@babylonjs/core").PickingInfo | null;
    /**
     * Draw or hide the translucent block-face highlight used by the selector.
     * @param {boolean} show
     * @param {number[]} posArr world coords of the targeted block position
     * @param {number[]} normArr face normal (length 3) pointing outward
     */
    highlightBlockFace(show: boolean, posArr: number[], normArr: number[]): void;
    /** Lazily create the highlight mesh+outline pair */
    _getHighlightMesh(): import("@babylonjs/core").Mesh;
    /** Debug helper to sanity-check scene/octree/mesh/material state */
    debug_SceneCheck(): string;
    /** Debug helper to log mesh counts grouped by name prefixes */
    debug_MeshCount(): void;
    dispose(): void;
}
import { Vector3 } from '../babylonExports.js';
import { Ray } from '../babylonExports.js';
