import { Mesh } from '../babylonExports.js'
import { TerrainMatManager } from './terrainMaterials.js'
import { GreedyMesher } from './greedyMesher.js'
import { MeshBuilder } from './meshBuilder.js'
import { profile_hook, terrainMeshFlag } from './terrainUtils.js'

/**
 * Terrain meshing module - manages terrain mesh generation and materials.
 * @module terrain
 *
 * Top-level entry point: takes a chunk, passes it to the greedy mesher,
 * gets back an intermediate struct of face data, passes that to the mesh
 * builder, gets back an array of Mesh objects, and finally puts those
 * into the 3D engine.
 */

/**
 * `noa._terrainMesher` - Top-level terrain meshing coordinator.
 * @internal
 */
export class TerrainMesher {
    /**
     * @param {import('../../index.js').Engine} noa
     */
    constructor(noa) {
        /** @type {import('../../index.js').Engine} */
        this.noa = noa

        // Initialize sub-modules
        /** @internal */
        this._matManager = new TerrainMatManager(this)
        /** @internal */
        this._greedyMesher = new GreedyMesher(this)
        /** @internal */
        this._meshBuilder = new MeshBuilder(this)

        // Expose public properties
        /** @type {import('@babylonjs/core').Material[]} */
        this.allTerrainMaterials = this._matManager.allMaterials

        // internally expose the default flat material used for untextured terrain
        /** @internal */
        this._defaultMaterial = this._matManager._defaultMat
    }


    // ============ CHUNK LIFECYCLE ============

    /**
     * Set or clean up any per-chunk properties needed for terrain meshing
     * @param {import('../chunk.js').Chunk} chunk
     */
    initChunk(chunk) {
        chunk._terrainMeshes.length = 0
    }

    /**
     * Dispose all terrain meshes for a chunk
     * @param {import('../chunk.js').Chunk} chunk
     */
    disposeChunk(chunk) {
        chunk._terrainMeshes.forEach(mesh => {
            this.noa.emit('removingTerrainMesh', mesh)
            mesh.dispose()
        })
        chunk._terrainMeshes.length = 0
    }


    // ============ MESHING ============

    /**
     * Meshing entry point and high-level flow
     * @param {import('../chunk.js').Chunk} chunk
     * @param {boolean} [ignoreMaterials=false]
     */
    meshChunk(chunk, ignoreMaterials = false) {
        profile_hook('start')

        // remove any previous terrain meshes
        this.disposeChunk(chunk)
        profile_hook('cleanup')

        // greedy mesher generates struct of face data
        var faceDataSet = this._greedyMesher.mesh(chunk, ignoreMaterials)
        profile_hook('geom')

        // builder generates mesh data (positions, normals, etc)
        var meshes = this._meshBuilder.buildMesh(chunk, faceDataSet, ignoreMaterials)
        profile_hook('build')

        profile_hook('end')

        // add meshes to scene and finish
        meshes.forEach((mesh) => {
            mesh.cullingStrategy = Mesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY
            this.noa.rendering.addMeshToScene(mesh, true, chunk.pos, chunk)
            this.noa.emit('addingTerrainMesh', mesh)
            mesh.freezeNormals()
            mesh.freezeWorldMatrix()
            chunk._terrainMeshes.push(mesh)
            if (!mesh.metadata) mesh.metadata = {}
            mesh.metadata[terrainMeshFlag] = true
        })
    }
}
