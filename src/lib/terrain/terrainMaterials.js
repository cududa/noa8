import { Texture } from '../babylonExports.js'
import { TerrainMaterialPlugin, FlowAnimationPlugin } from './terrainPlugins.js'

/**
 * Material management for terrain meshes.
 * @module terrain/terrainMaterials
 */

/**
 * Creates and manages Materials for terrain meshes.
 * Maps block face materials to terrain material IDs for mesh merging,
 * and creates the materials when needed.
 * @internal
 */
export class TerrainMatManager {
    /**
     * @param {import('./index.js').TerrainMesher} parent
     */
    constructor(parent) {
        /** @type {import('./index.js').TerrainMesher} */
        this.parent = parent

        // make a baseline default material for untextured terrain with no alpha
        this._defaultMat = parent.noa.rendering.makeStandardMaterial('base-terrain')
        this._defaultMat.freeze()

        /** @type {import('@babylonjs/core').Material[]} */
        this.allMaterials = [this._defaultMat]

        // internals
        /** @internal @type {number} */
        this._idCounter = 1000
        /** @internal @type {Object.<number, number>} */
        this._blockMatIDtoTerrainID = {}
        /** @internal @type {Object.<number, import('@babylonjs/core').Material>} */
        this._terrainIDtoMatObject = {}
        /** @internal @type {Object.<string, number>} */
        this._texURLtoTerrainID = {}
        /** @internal @type {Map<import('@babylonjs/core').Material, number>} */
        this._renderMatToTerrainID = new Map()
    }

    /**
     * Maps a given `matID` (from noa.registry) to a unique ID of which
     * terrain material can be used for that block material.
     * This lets the terrain mesher map which blocks can be merged into
     * the same meshes.
     * Internally, this accessor also creates the material for each
     * terrainMatID as they are first encountered.
     * @param {number} blockMatID
     * @returns {number}
     */
    getTerrainMatId(blockMatID) {
        // fast case where matID has been seen before
        if (blockMatID in this._blockMatIDtoTerrainID) {
            return this._blockMatIDtoTerrainID[blockMatID]
        }
        // decide a unique terrainID for this block material
        var terrID = decideTerrainMatID(this, blockMatID)
        // create a mat object for it, if needed
        if (!(terrID in this._terrainIDtoMatObject)) {
            var mat = createTerrainMat(this, blockMatID)
            this.allMaterials.push(mat)
            this._terrainIDtoMatObject[terrID] = mat
        }
        // cache results and done
        this._blockMatIDtoTerrainID[blockMatID] = terrID
        return terrID
    }

    /**
     * Get a Babylon Material object, given a terrainMatID (gotten from this module)
     * @param {number} [terrainMatID=1]
     * @returns {import('@babylonjs/core').Material}
     */
    getMaterial(terrainMatID = 1) {
        return this._terrainIDtoMatObject[terrainMatID]
    }
}


/**
 * Decide a unique terrainID, based on block material ID properties
 * @param {TerrainMatManager} self
 * @param {number} [blockMatID=0]
 * @returns {number}
 */
function decideTerrainMatID(self, blockMatID = 0) {
    var matInfo = self.parent.noa.registry.getMaterialData(blockMatID)

    // custom render materials get one unique terrainID per material
    if (matInfo.renderMat) {
        var mat = matInfo.renderMat
        if (!self._renderMatToTerrainID.has(mat)) {
            self._renderMatToTerrainID.set(mat, self._idCounter++)
        }
        return self._renderMatToTerrainID.get(mat)
    }

    // animated materials get unique terrain IDs since they need their own material instance
    if (matInfo.flowSpeed > 0) {
        return self._idCounter++
    }

    // ditto for textures, unique URL
    if (matInfo.texture) {
        var url = matInfo.texture
        if (!(url in self._texURLtoTerrainID)) {
            self._texURLtoTerrainID[url] = self._idCounter++
        }
        return self._texURLtoTerrainID[url]
    }

    // plain color materials with an alpha value are unique by alpha
    var alpha = matInfo.alpha
    if (alpha > 0 && alpha < 1) return 10 + Math.round(alpha * 100)

    // the only remaining case is the baseline, which always reuses one fixed ID
    return 1
}


/**
 * Create (choose) a material for a given set of block material properties
 * @param {TerrainMatManager} self
 * @param {number} [blockMatID=0]
 * @returns {import('@babylonjs/core').Material}
 */
function createTerrainMat(self, blockMatID = 0) {
    var noa = self.parent.noa
    var matInfo = noa.registry.getMaterialData(blockMatID)

    // custom render mats are just reused
    if (matInfo.renderMat) return matInfo.renderMat

    var isAnimated = (matInfo.flowSpeed > 0)

    // if no texture: use a basic flat material, possibly with alpha or animation
    if (!matInfo.texture) {
        var needsAlpha = (matInfo.alpha > 0 && matInfo.alpha < 1)
        if (!needsAlpha && !isAnimated) return self._defaultMat
        var matName = 'terrain-' + (isAnimated ? 'animated-' : 'alpha-') + blockMatID
        var plainMat = noa.rendering.makeStandardMaterial(matName)
        plainMat.alpha = matInfo.alpha

        // add flow animation plugin if needed
        if (isAnimated) {
            new FlowAnimationPlugin(plainMat, matInfo.flowSpeed, matInfo.flowDirection, matInfo.flowPatternLength)
            // animated materials can't be frozen since uniforms update each frame
        } else {
            plainMat.freeze()
        }
        return plainMat
    }

    // remaining case is a new material with a diffuse texture
    var scene = noa.rendering.getScene()
    var mat = noa.rendering.makeStandardMaterial('terrain-textured-' + blockMatID)
    var texURL = matInfo.texture
    var sampling = Texture.NEAREST_SAMPLINGMODE
    var tex = new Texture(texURL, scene, true, false, sampling)
    if (matInfo.texHasAlpha) tex.hasAlpha = true
    mat.diffuseTexture = tex

    // if texture is an atlas, apply material plugin
    // and check whether any material for the atlas needs alpha
    if (matInfo.atlasIndex >= 0) {
        new TerrainMaterialPlugin(mat, tex)
        if (noa.registry._textureNeedsAlpha(matInfo.texture)) {
            tex.hasAlpha = true
        }
    }

    // add flow animation plugin if needed
    if (isAnimated) {
        new FlowAnimationPlugin(mat, matInfo.flowSpeed, matInfo.flowDirection, matInfo.flowPatternLength)
        // animated materials can't be frozen since uniforms update each frame
    } else {
        mat.freeze()
    }

    return mat
}
