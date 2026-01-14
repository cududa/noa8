import { DirectionalLight, HemisphericLight, Vector3, Color3 } from '../babylonExports.js'

/**
 * Light setup and helpers for the main directional/hemispheric lighting.
 * Keeps Babylon-specific light tweaks out of the main Rendering class.
 */
export class RenderingLighting {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering, opts) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
        this._initLight(opts)
    }

    /** Initialize the default directional light from options */
    _initLight(opts) {
        var rendering = this.rendering
        var scene = rendering.scene

        var lightVec = Vector3.FromArray(opts.lightVector)
        rendering.light = new DirectionalLight('light', lightVec, scene)
        rendering.light.diffuse = Color3.FromArray(opts.lightDiffuse)
        rendering.light.specular = Color3.FromArray(opts.lightSpecular)
    }

    /**
     * Clean up disposed meshes from the main light's excludedMeshes array.
     * This prevents memory leaks when meshes are disposed without explicit cleanup.
     */
    tick(_dt) {
        var light = this.rendering.light
        if (!light || !light.excludedMeshes || light.excludedMeshes.length === 0) return
        var validMeshes = light.excludedMeshes.filter(function (m) {
            return m && !m.isDisposed()
        })
        if (validMeshes.length !== light.excludedMeshes.length) {
            light.excludedMeshes = validMeshes
        }
    }

    /**
     * Allow callers to tweak or disable the built-in directional light.
     * @param {object} opts
     * @param {import('@babylonjs/core').Vector3} [opts.direction]
     * @param {number} [opts.intensity]
     * @param {import('@babylonjs/core').Color3} [opts.diffuse]
     * @param {import('@babylonjs/core').Color3} [opts.specular]
     */
    setMainLightOptions(opts) {
        var light = this.rendering.light
        if (!light) return
        if (opts.direction) light.direction = opts.direction
        if (opts.intensity !== undefined) light.intensity = opts.intensity
        if (opts.diffuse) light.diffuse = opts.diffuse
        if (opts.specular) light.specular = opts.specular
    }

    /**
     * Exclude a mesh (and optionally descendants) from the main directional light.
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} [includeDescendants]
     */
    excludeMesh(mesh, includeDescendants = true) {
        var light = this.rendering.light
        if (!light || !mesh) return
        var targets = [mesh]
        if (includeDescendants && typeof mesh.getChildMeshes === 'function') {
            targets = targets.concat(mesh.getChildMeshes(false))
        }
        targets.forEach(m => {
            if (light.excludedMeshes.indexOf(m) === -1) {
                light.excludedMeshes.push(m)
            }
        })
    }

    /**
     * Re-include a mesh (and optionally descendants) so it receives the main light again.
     * @param {import('@babylonjs/core').Mesh} mesh
     * @param {boolean} [includeDescendants]
     */
    includeMesh(mesh, includeDescendants = true) {
        var light = this.rendering.light
        if (!light || !mesh) return
        var targets = [mesh]
        if (includeDescendants && typeof mesh.getChildMeshes === 'function') {
            targets = targets.concat(mesh.getChildMeshes(false))
        }
        targets.forEach(m => {
            var idx = light.excludedMeshes.indexOf(m)
            if (idx >= 0) light.excludedMeshes.splice(idx, 1)
        })
    }

    /**
     * Create a new light in the scene.
     * @param {'directional' | 'hemispheric'} type
     * @param {string} name
     * @returns {import('@babylonjs/core').DirectionalLight | import('@babylonjs/core').HemisphericLight}
     */
    createLight(type, name) {
        var scene = this.rendering.getScene()
        if (type === 'directional') {
            return new DirectionalLight(name, new Vector3(0, -1, 0), scene)
        } else if (type === 'hemispheric') {
            return new HemisphericLight(name, new Vector3(0, 1, 0), scene)
        }
        throw new Error('Unknown light type: ' + type)
    }
}
