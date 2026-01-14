import { StandardMaterial, ShaderMaterial, Color3, MeshBuilder } from '../babylonExports.js'

/**
 * @typedef {object} StandardMaterialOptions
 * @property {number[] | import('@babylonjs/core').Color3} [diffuseColor]
 * @property {number[] | import('@babylonjs/core').Color3} [emissiveColor]
 * @property {number[] | import('@babylonjs/core').Color3} [specularColor]
 * @property {number} [specularPower]
 * @property {number} [alpha]
 * @property {boolean} [wireframe]
 * @property {boolean} [backFaceCulling]
 * @property {number} [maxSimultaneousLights]
 */

/**
 * @typedef {object} ShaderMaterialOptions
 * @property {string[]} [attributes]
 * @property {string[]} [uniforms]
 * @property {string[]} [samplers]
 * @property {string[]} [defines]
 * @property {string[]} [uniformBuffers]
 * @property {boolean} [needInstancing]
 * @property {boolean} [needAlphaBlending]
 * @property {boolean} [backFaceCulling]
 * @property {number} [alphaMode]
 */

/**
 * Material factory helpers.
 * Keeps Babylon material creation details isolated from the main renderer.
 */
export class RenderingMaterials {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
    }

    /**
     * Access to Babylon.js MeshBuilder for creating primitives.
     * All methods require the scene as the last argument.
     *
     * @example
     * const scene = noa.rendering.getScene()
     * const box = noa.rendering.meshBuilder.CreateBox('myBox', { size: 1 }, scene)
     */
    get meshBuilder() {
        return MeshBuilder
    }

    /**
     * Create a default StandardMaterial:
     * flat, nonspecular, fully reflects diffuse and ambient light
     */
    makeStandardMaterial(name) {
        var mat = new StandardMaterial(name, this.rendering.scene)
        mat.specularColor.copyFromFloats(0, 0, 0)
        mat.ambientColor.copyFromFloats(1, 1, 1)
        mat.diffuseColor.copyFromFloats(1, 1, 1)
        return mat
    }

    /**
     * Create a StandardMaterial with common options.
     * This is a convenience factory - the returned material is NOT tracked internally.
     * Caller is responsible for disposal.
     * @param {string} name
     * @param {StandardMaterialOptions} [options]
     * @returns {import('@babylonjs/core').StandardMaterial}
     */
    createStandardMaterial(name, options) {
        options = options || {}
        var mat = new StandardMaterial(name, this.rendering.scene)

        // Helper to convert [r,g,b] array to Color3 or pass through existing Color3
        function toColor3(val, fallback) {
            if (!val) return fallback
            if (val.r !== undefined) return val
            return new Color3(val[0], val[1], val[2])
        }

        mat.diffuseColor = toColor3(options.diffuseColor, new Color3(1, 1, 1))
        mat.emissiveColor = toColor3(options.emissiveColor, new Color3(0, 0, 0))
        mat.specularColor = toColor3(options.specularColor, new Color3(0, 0, 0))
        mat.ambientColor = new Color3(1, 1, 1)

        if (options.specularPower !== undefined) mat.specularPower = options.specularPower
        if (options.alpha !== undefined) mat.alpha = options.alpha
        if (options.wireframe !== undefined) mat.wireframe = options.wireframe
        if (options.backFaceCulling !== undefined) mat.backFaceCulling = options.backFaceCulling
        if (options.maxSimultaneousLights !== undefined) mat.maxSimultaneousLights = options.maxSimultaneousLights

        return mat
    }

    /**
     * Create a ShaderMaterial from inline GLSL source code.
     * This is a convenience factory - the returned material is NOT tracked internally.
     * Caller is responsible for disposal.
     * @param {string} name
     * @param {string} vertexSource
     * @param {string} fragmentSource
     * @param {ShaderMaterialOptions} [options]
     * @returns {import('@babylonjs/core').ShaderMaterial}
     */
    createShaderMaterial(name, vertexSource, fragmentSource, options) {
        options = options || {}
        var attributes = options.attributes ? options.attributes.slice() : ['position', 'normal']
        var uniforms = options.uniforms ? options.uniforms.slice() : ['world', 'viewProjection']

        // Add instancing attributes if requested
        if (options.needInstancing) {
            if (attributes.indexOf('world0') === -1) attributes.push('world0')
            if (attributes.indexOf('world1') === -1) attributes.push('world1')
            if (attributes.indexOf('world2') === -1) attributes.push('world2')
            if (attributes.indexOf('world3') === -1) attributes.push('world3')
        }

        var shaderOptions = {
            attributes: attributes,
            uniforms: uniforms,
            samplers: options.samplers || [],
            defines: options.defines || [],
        }
        if (options.uniformBuffers) {
            shaderOptions.uniformBuffers = options.uniformBuffers
        }

        var mat = new ShaderMaterial(name, this.rendering.scene, {
            vertexElement: undefined,
            fragmentElement: undefined,
            vertexSource: vertexSource,
            fragmentSource: fragmentSource,
        }, shaderOptions)

        // Apply common options
        if (options.backFaceCulling !== undefined) {
            mat.backFaceCulling = options.backFaceCulling
        } else {
            mat.backFaceCulling = true
        }

        if (options.alphaMode !== undefined) {
            mat.alphaMode = options.alphaMode
        }

        if (options.needAlphaBlending) {
            mat.needAlphaBlending = function () { return true }
        }

        return mat
    }
}
