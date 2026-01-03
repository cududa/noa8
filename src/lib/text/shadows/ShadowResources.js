import { CreateDisc, DynamicTexture, Texture } from '../../babylonExports.js'

/**
 * Shadow resource creation and management.
 * Creates shared disc mesh, material, and texture for text shadows.
 */

/**
 * @typedef {object} ShadowResourcesResult
 * @property {object} sourceMesh - Source disc mesh for instancing
 * @property {object} material - Shadow material
 * @property {object|null} texture - Radial opacity texture
 */

/**
 * Create all shadow resources.
 * @param {object} scene - Babylon scene
 * @param {object} rendering - noa.rendering reference
 * @param {number} opacity - Shadow opacity
 * @returns {ShadowResourcesResult}
 */
export function createShadowResources(scene, rendering, opacity) {
    // Create source disc mesh
    var sourceMesh = CreateDisc('text_shadow_source', {
        radius: 0.5,
        tessellation: 16,
    }, scene)
    sourceMesh.rotation.x = Math.PI / 2

    // Create shadow material
    var material = rendering.makeStandardMaterial('text_shadow_mat')
    material.diffuseColor.set(0, 0, 0)
    material.ambientColor.set(0, 0, 0)
    material.emissiveColor.set(0, 0, 0)
    material.specularColor.set(0, 0, 0)
    material.disableLighting = true  // Prevent shadow reacting to scene ambient
    material.backFaceCulling = false
    material.alpha = opacity

    // Create radial texture for soft edges
    var texture = createShadowTexture(scene)
    if (texture) {
        texture.hasAlpha = true
        material.opacityTexture = texture
    }

    material.freeze()
    sourceMesh.material = material

    // Fix Babylon.js 8 SubMesh.getBoundingInfo() issue
    fixBoundingInfo(sourceMesh)

    // Hide source mesh
    rendering.setMeshVisibility(sourceMesh, false)

    return { sourceMesh, material, texture }
}

/**
 * Create radial gradient texture for shadow soft edges.
 * @param {object} scene - Babylon scene
 * @returns {object|null}
 */
export function createShadowTexture(scene) {
    try {
        var size = 128
        var texture = new DynamicTexture('text_shadow_texture', { width: size, height: size }, scene, false, Texture.BILINEAR_SAMPLINGMODE)
        var ctx = texture.getContext()
        if (ctx) {
            var half = size / 2
            var gradient = ctx.createRadialGradient(half, half, half * 0.2, half, half, half)
            gradient.addColorStop(0, 'rgba(255,255,255,1)')
            gradient.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.clearRect(0, 0, size, size)
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, size, size)
            texture.update(false)
        }
        texture.wrapU = Texture.CLAMP_ADDRESSMODE
        texture.wrapV = Texture.CLAMP_ADDRESSMODE
        return texture
    } catch (err) {
        return null
    }
}

/**
 * Fix Babylon.js 8 SubMesh.getBoundingInfo() issue.
 * @param {object} mesh - Babylon mesh
 */
export function fixBoundingInfo(mesh) {
    mesh.refreshBoundingInfo()
    var bi = mesh.getBoundingInfo()
    if (mesh.subMeshes && bi) {
        mesh.subMeshes.forEach(sm => {
            /** @type {any} */ (sm)._boundingInfo = bi
        })
    }
}

/**
 * Dispose all shadow resources.
 * @param {object} rendering - noa.rendering reference
 * @param {object|null} sourceMesh
 * @param {object|null} material
 * @param {object|null} texture
 */
export function disposeShadowResources(rendering, sourceMesh, material, texture) {
    if (sourceMesh) {
        rendering.removeMeshFromScene(sourceMesh)
        sourceMesh.dispose()
    }
    if (material) {
        material.dispose()
    }
    if (texture) {
        texture.dispose()
    }
}

/**
 * Update material opacity (unfreezes and refreezes).
 * @param {object} material - Shadow material
 * @param {number} opacity - New opacity value
 */
export function updateMaterialOpacity(material, opacity) {
    if (!material) return
    material.unfreeze()
    material.alpha = opacity
    material.freeze()
}
