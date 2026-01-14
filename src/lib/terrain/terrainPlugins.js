import { Engine, Texture, MaterialPluginBase, RawTexture2DArray } from '../babylonExports.js'

/**
 * Babylon.js material plugins for terrain rendering.
 * @module terrain/terrainPlugins
 */

/**
 * Babylon material plugin - twiddles the defines/shaders/etc so that
 * a standard material can use textures from a 2D texture atlas.
 */
export class TerrainMaterialPlugin extends MaterialPluginBase {
    /**
     * @param {import('@babylonjs/core').Material} material
     * @param {import('@babylonjs/core').Texture} texture
     */
    constructor(material, texture) {
        var priority = 200
        var defines = { 'NOA_TWOD_ARRAY_TEXTURE': false }
        super(material, 'TestPlugin', priority, defines)
        this._enable(true)

        /** @type {import('@babylonjs/core').RawTexture2DArray | null} */
        this._atlasTextureArray = null
        /** @type {import('@babylonjs/core').Observer<import('@babylonjs/core').Texture> | null} */
        this._textureLoadObserver = null

        this._textureLoadObserver = texture.onLoadObservable.add((tex) => {
            this.setTextureArrayData(tex)
        })

        // Clean up observer when material is disposed to prevent memory leaks
        material.onDisposeObservable.add(() => {
            if (this._textureLoadObserver) {
                texture.onLoadObservable.remove(this._textureLoadObserver)
                this._textureLoadObserver = null
            }
            if (this._atlasTextureArray) {
                this._atlasTextureArray.dispose()
                this._atlasTextureArray = null
            }
        })
    }

    /**
     * @param {import('@babylonjs/core').Texture} texture
     */
    setTextureArrayData(texture) {
        var { width, height } = texture.getSize()
        var numLayers = Math.round(height / width)
        height = width
        var data = texture._readPixelsSync()

        var format = Engine.TEXTUREFORMAT_RGBA
        var genMipMaps = true
        var invertY = false
        var mode = Texture.NEAREST_SAMPLINGMODE
        var scene = texture.getScene()

        this._atlasTextureArray = new RawTexture2DArray(
            data, width, height, numLayers,
            format, scene, genMipMaps, invertY, mode,
        )
    }

    prepareDefines(defines, scene, mesh) {
        defines['NOA_TWOD_ARRAY_TEXTURE'] = true
    }

    getClassName() {
        return 'TerrainMaterialPluginName'
    }

    getSamplers(samplers) {
        samplers.push('atlasTexture')
    }

    getAttributes(attributes) {
        attributes.push('texAtlasIndices')
    }

    getUniforms() {
        return { ubo: [] }
    }

    bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
        if (this._atlasTextureArray) {
            uniformBuffer.setTexture('atlasTexture', this._atlasTextureArray)
        }
    }

    getCustomCode(shaderType) {
        if (shaderType === 'vertex') return {
            'CUSTOM_VERTEX_MAIN_BEGIN': `
                texAtlasIndex = texAtlasIndices;
            `,
            'CUSTOM_VERTEX_DEFINITIONS': `
                uniform highp sampler2DArray atlasTexture;
                attribute float texAtlasIndices;
                varying float texAtlasIndex;
            `,
        }
        if (shaderType === 'fragment') return {
            '!baseColor\\\\=texture2D\\\\(diffuseSampler,vDiffuseUV\\\\+uvOffset\\\\);':
                `baseColor = texture(atlasTexture, vec3(vDiffuseUV, texAtlasIndex));`,
            'CUSTOM_FRAGMENT_DEFINITIONS': `
                uniform highp sampler2DArray atlasTexture;
                varying float texAtlasIndex;
            `,
        }
        return null
    }
}


/**
 * Flow Animation Plugin - adds vertex offset for conveyor belt effect.
 * Uses simple repeating pattern mode where offset wraps every patternLength blocks.
 */
export class FlowAnimationPlugin extends MaterialPluginBase {
    /**
     * @param {import('@babylonjs/core').Material} material
     * @param {number} flowSpeed
     * @param {number[]} flowDirection
     * @param {number} [patternLength=10]
     */
    constructor(material, flowSpeed, flowDirection, patternLength = 10) {
        var priority = 100
        var defines = { 'NOA_FLOW_ANIMATION': false }
        super(material, 'FlowAnimationPlugin', priority, defines)
        this._enable(true)

        /** @type {number} */
        this._flowSpeed = flowSpeed
        /** @type {number[]} */
        this._flowDirection = flowDirection.slice() // copy array
        /** @type {number} */
        this._patternLength = patternLength
        /** @type {number} */
        this._time = 0
        /** @type {import('@babylonjs/core').Observer<import('@babylonjs/core').Scene> | null} */
        this._renderObserver = null

        // hook into scene render loop to update time
        var scene = material.getScene()
        this._renderObserver = scene.onBeforeRenderObservable.add(() => {
            // delta time is in milliseconds, convert to seconds
            var dt = scene.getEngine().getDeltaTime() / 1000
            this._time += dt
        })

        // Clean up observer when material is disposed to prevent memory leaks
        material.onDisposeObservable.add(() => {
            if (this._renderObserver) {
                scene.onBeforeRenderObservable.remove(this._renderObserver)
                this._renderObserver = null
            }
        })
    }

    prepareDefines(defines, scene, mesh) {
        defines['NOA_FLOW_ANIMATION'] = true
    }

    getClassName() {
        return 'FlowAnimationPlugin'
    }

    getUniforms() {
        return {
            ubo: [
                { name: 'flowTime', size: 1, type: 'float' },
                { name: 'flowDirection', size: 3, type: 'vec3' },
                { name: 'flowSpeed', size: 1, type: 'float' },
                { name: 'flowPatternLength', size: 1, type: 'float' },
            ]
        }
    }

    bindForSubMesh(uniformBuffer, scene, engine, subMesh) {
        uniformBuffer.updateFloat('flowTime', this._time)
        uniformBuffer.updateFloat3('flowDirection',
            this._flowDirection[0],
            this._flowDirection[1],
            this._flowDirection[2])
        uniformBuffer.updateFloat('flowSpeed', this._flowSpeed)
        uniformBuffer.updateFloat('flowPatternLength', this._patternLength)
    }

    getCustomCode(shaderType) {
        if (shaderType === 'vertex') return {
            'CUSTOM_VERTEX_DEFINITIONS': `
                uniform float flowTime;
                uniform vec3 flowDirection;
                uniform float flowSpeed;
                uniform float flowPatternLength;
            `,
            'CUSTOM_VERTEX_UPDATE_POSITION': `
                // Simple repeating pattern mode
                // Pattern repeats every patternLength blocks
                // Offset wraps seamlessly because pattern also repeats at patternLength
                float flowOffset = fract(flowTime * flowSpeed / flowPatternLength) * flowPatternLength;
                positionUpdated += flowDirection * flowOffset;
            `,
        }
        return null
    }
}
