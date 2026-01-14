import * as glvec3 from 'gl-vec3'
import { makeProfileHook } from '../util.js'
import { CreatePlane, CreateLines, Vector3, Color3, Ray } from '../babylonExports.js'

// Basic profiling hooks shared by the render loop
var PROFILE = 0
export var profile_hook = (PROFILE) ? makeProfileHook(200, 'render internals') : () => { }

// FPS overlay hook (populated by setUpFPS when enabled)
export var fps_hook = function () { }

/** Create a small FPS overlay for quick perf inspection */
export function setUpFPS() {
    var div = document.createElement('div')
    div.id = 'noa_fps'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.right = '0'
    div.style.zIndex = '0'
    div.style.color = 'white'
    div.style.backgroundColor = 'rgba(0,0,0,0.5)'
    div.style.font = '14px monospace'
    div.style.textAlign = 'center'
    div.style.minWidth = '2em'
    div.style.margin = '4px'
    document.body.appendChild(div)
    var every = 1000
    var ct = 0
    var longest = 0
    var start = performance.now()
    var last = start
    fps_hook = function () {
        ct++
        var nt = performance.now()
        if (nt - last > longest) longest = nt - last
        last = nt
        if (nt - start < every) return
        var fps = Math.round(ct / (nt - start) * 1000)
        var min = Math.round(1 / longest * 1000)
        div.innerHTML = fps + '<br>' + min
        ct = 0
        longest = 0
        start = nt
    }
}

/**
 * Misc helpers used by the renderer: picking, highlight geometry, debug checks.
 */
export class RenderingUtils {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        this.rendering = rendering
        /** @type {import('@babylonjs/core').Mesh | null} */ this._highlightMesh = null
        this._pickOriginVec = new Vector3(0, 0, 0)
        this._pickDirectionVec = new Vector3(0, 0, 1)
        this._pickRay = new Ray(this._pickOriginVec, this._pickDirectionVec, 1)
        /** @type {(mesh: import('@babylonjs/core').AbstractMesh) => boolean} */
        this._terrainPickPredicate = (mesh) => mesh.metadata && mesh.metadata.noa_chunk_terrain_mesh
    }

    /**
     * Pick terrain from the camera position along the camera direction.
     * @param {number} [distance=-1]
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainFromCamera(distance = -1) {
        if (!this.rendering.scene || !this.rendering.noa || !this.rendering.noa.camera) return null
        var origin = this.rendering.noa.camera.getPosition()
        var dir = this.rendering.noa.camera.getDirection()
        return this.pickTerrainWithRay(origin, dir, distance, false)
    }

    /**
     * Cast a ray for terrain picking from an origin/direction.
     * @param {number[]} origin world or local coordinates
     * @param {number[]} direction direction vector
     * @param {number} [distance=-1]
     * @param {boolean} [originIsLocal=false]
     * @returns {import('@babylonjs/core').PickingInfo | null}
     */
    pickTerrainWithRay(origin, direction, distance = -1, originIsLocal = false) {
        var rendering = this.rendering
        if (!rendering.scene) return null
        var originVec = this._pickOriginVec
        if (originIsLocal) {
            originVec.copyFromFloats(origin[0], origin[1], origin[2])
        } else {
            var off = rendering.noa.worldOriginOffset
            originVec.copyFromFloats(origin[0] - off[0], origin[1] - off[1], origin[2] - off[2])
        }
        var dirVec = this._pickDirectionVec
        dirVec.copyFromFloats(direction[0], direction[1], direction[2])
        dirVec.normalize()
        var ray = this._pickRay
        ray.origin.copyFrom(originVec)
        ray.direction.copyFrom(dirVec)
        ray.length = (distance > 0) ? distance : rendering.noa.blockTestDistance
        return rendering.scene.pickWithRay(ray, this._terrainPickPredicate)
    }

    /**
     * Draw or hide the translucent block-face highlight used by the selector.
     * @param {boolean} show
     * @param {number[]} posArr world coords of the targeted block position
     * @param {number[]} normArr face normal (length 3) pointing outward
     */
    highlightBlockFace(show, posArr, normArr) {
        var m = this._getHighlightMesh()
        if (show) {
            // floored local coords for highlight mesh
            this.rendering.noa.globalToLocal(posArr, null, hlpos)
            // offset to avoid z-fighting, bigger when camera is far away
            var dist = glvec3.dist(this.rendering.noa.camera._localGetPosition(), hlpos)
            var slop = 0.001 + 0.001 * dist
            for (var i = 0; i < 3; i++) {
                if (normArr[i] === 0) {
                    hlpos[i] += 0.5
                } else {
                    hlpos[i] += (normArr[i] > 0) ? 1 + slop : -slop
                }
            }
            m.position.copyFromFloats(hlpos[0], hlpos[1], hlpos[2])
            m.rotation.x = (normArr[1]) ? Math.PI / 2 : 0
            m.rotation.y = (normArr[0]) ? Math.PI / 2 : 0
        }
        m.setEnabled(show)
    }

    /** Lazily create the highlight mesh+outline pair */
    _getHighlightMesh() {
        if (!this._highlightMesh) {
            var rendering = this.rendering
            var mesh = CreatePlane('highlight', { size: 1.0 }, rendering.scene)
            var hlm = rendering.makeStandardMaterial('block_highlight_mat')
            hlm.backFaceCulling = false
            hlm.emissiveColor = new Color3(1, 1, 1)
            hlm.alpha = 0.2
            hlm.freeze()
            mesh.material = hlm

            // Outline for readability against bright scenes
            var s = 0.5
            var lines = CreateLines('hightlightLines', {
                points: [
                    new Vector3(s, s, 0),
                    new Vector3(s, -s, 0),
                    new Vector3(-s, -s, 0),
                    new Vector3(-s, s, 0),
                    new Vector3(s, s, 0)
                ]
            }, rendering.scene)
            lines.color = new Color3(1, 1, 1)
            lines.parent = mesh

            rendering.addMeshToScene(mesh)
            rendering.addMeshToScene(lines)
            this._highlightMesh = mesh
        }
        return this._highlightMesh
    }

    /*
     *      Sanity checks:
     */

    /** Debug helper to sanity-check scene/octree/mesh/material state */
    debug_SceneCheck() {
        var meshes = this.rendering.scene.meshes
        var octree = this.rendering.scene._selectionOctree
        var dyns = octree.dynamicContent
        var octs = []
        var numOcts = 0
        var numSubs = 0
        var mats = this.rendering.scene.materials
        var allmats = []
        mats.forEach(mat => {
            // @ts-ignore
            if (mat.subMaterials) mat.subMaterials.forEach(mat => allmats.push(mat))
            else allmats.push(mat)
        })
        octree.blocks.forEach(function (block) {
            numOcts++
            block.entries.forEach(m => octs.push(m))
        })
        meshes.forEach(function (m) {
            if (m.isDisposed()) warn(m, 'disposed mesh in scene')
            if (empty(m)) return
            if (missing(m, dyns, octs)) warn(m, 'non-empty mesh missing from octree')
            if (!m.material) { warn(m, 'non-empty scene mesh with no material'); return }
            numSubs += (m.subMeshes) ? m.subMeshes.length : 1
            // @ts-ignore
            var mats = m.material.subMaterials || [m.material]
            mats.forEach(function (mat) {
                if (missing(mat, mats)) warn(mat, 'mesh material not in scene')
            })
        })
        var unusedMats = []
        allmats.forEach(mat => {
            var used = false
            meshes.forEach(mesh => {
                if (mesh.material === mat) used = true
                if (!mesh.material) return
                // @ts-ignore
                var mats = mesh.material.subMaterials || [mesh.material]
                if (mats.includes(mat)) used = true
            })
            if (!used) unusedMats.push(mat.name)
        })
        if (unusedMats.length) {
            console.warn('Materials unused by any mesh: ', unusedMats.join(', '))
        }
        dyns.forEach(function (m) {
            if (missing(m, meshes)) warn(m, 'octree/dynamic mesh not in scene')
        })
        octs.forEach(function (m) {
            if (missing(m, meshes)) warn(m, 'octree block mesh not in scene')
        })
        var avgPerOct = Math.round(10 * octs.length / numOcts) / 10
        console.log('meshes - octree:', octs.length, '  dynamic:', dyns.length,
            '   subMeshes:', numSubs,
            '   avg meshes/octreeBlock:', avgPerOct)

        function warn(obj, msg) { console.warn(obj.name + ' --- ' + msg) }
        function empty(mesh) { return (mesh.getIndices().length === 0) }
        function missing(obj, list1, list2) {
            if (!obj) return false
            if (list1.includes(obj)) return false
            if (list2 && list2.includes(obj)) return false
            return true
        }
        return 'done.'
    }

    /** Debug helper to log mesh counts grouped by name prefixes */
    debug_MeshCount() {
        var ct = {}
        this.rendering.scene.meshes.forEach(m => {
            var n = m.name || ''
            n = n.replace(/-\d+.*/, '#')
            n = n.replace(/\d+.*/, '#')
            n = n.replace(/(rotHolder|camHolder|camScreen)/, 'rendering use')
            n = n.replace(/atlas sprite .*/, 'atlas sprites')
            ct[n] = ct[n] || 0
            ct[n]++
        })
        for (var s in ct) console.log('   ' + (ct[s] + '       ').substr(0, 7) + s)
    }

    dispose() {
        this._highlightMesh = null
    }
}

/** @type {number[]} */ // Scratch vector used when positioning highlight mesh
var hlpos = []
