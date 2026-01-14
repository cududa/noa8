import { SceneLoader, StandardMaterial, Color3 } from '../babylonExports.js'

/**
 * @typedef {object} LoadModelOptions
 * @property {number | [number, number, number]} [scale]
 * @property {boolean} [convertToStandard]
 * @property {(material: import('@babylonjs/core').Material, mesh: import('@babylonjs/core').AbstractMesh) => import('@babylonjs/core').Material} [onMaterialLoaded]
 * @property {boolean} [registerMeshes]
 */

/**
 * @typedef {object} LoadedModel
 * @property {import('@babylonjs/core').AbstractMesh} rootMesh
 * @property {import('@babylonjs/core').AbstractMesh[]} meshes
 * @property {import('@babylonjs/core').Skeleton[]} skeletons
 * @property {import('@babylonjs/core').AnimationGroup[]} animationGroups
 * @property {() => void} cleanup
 */

// Model loading and material conversion helpers
export class RenderingModels {

    /** @param {import('./index.js').Rendering} rendering */
    constructor(rendering) {
        /** @type {import('./index.js').Rendering} */
        this.rendering = rendering
    }

    /**
     * Load a GLB/glTF model and register its meshes with noa.
     *
     * MEMORY: The returned cleanup function MUST be called when the model is no longer
     * needed. This function holds no internal references to loaded models.
     *
     * @param {string} url
     * @param {LoadModelOptions} [options]
     * @returns {Promise<LoadedModel>}
     */
    async loadModel(url, options) {
        options = options || {}
        var rendering = this.rendering
        var scene = rendering.scene
        var registerMeshes = options.registerMeshes !== false
        /** @type {import('@babylonjs/core').AbstractMesh[]} */
        var meshes = []
        /** @type {import('@babylonjs/core').Skeleton[]} */
        var skeletons = []
        /** @type {import('@babylonjs/core').AnimationGroup[]} */
        var animationGroups = []
        /** @type {import('@babylonjs/core').AbstractMesh | null} */
        var rootMesh = null
        /** @type {(() => void) | null} */
        var cleanupFn = null
        /** @type {import('@babylonjs/core').Material[] | null} */
        var oldMaterials = []

        function disposeOldMaterials() {
            if (!oldMaterials) return
            for (var i = 0; i < oldMaterials.length; i++) {
                try { oldMaterials[i].dispose() } catch (e) { }
            }
            oldMaterials = null
        }

        // Dispose Babylon resources allocated during load
        function disposeLoadedResources() {
            for (var i = 0; i < animationGroups.length; i++) {
                var ag = animationGroups[i]
                if (ag) {
                    try { ag.dispose() } catch (e) { }
                }
            }
            for (var j = 0; j < skeletons.length; j++) {
                var sk = skeletons[j]
                if (sk) {
                    try { sk.dispose() } catch (e) { }
                }
            }
            for (var k = 0; k < meshes.length; k++) {
                var mesh = meshes[k]
                if (mesh && !mesh.isDisposed()) {
                    try { mesh.dispose() } catch (e) { }
                }
            }
        }

        try {
            // Load the model; Babylon returns a bundle of meshes/skeletons/animation groups
            var result = await SceneLoader.ImportMeshAsync('', '', url, scene)

            meshes = result.meshes || []
            skeletons = result.skeletons || []
            animationGroups = result.animationGroups || []

            if (meshes.length === 0) {
                throw new Error('No meshes found in model: ' + url)
            }

            rootMesh = meshes[0]

            if (options.scale !== undefined) {
                var s = options.scale
                if (typeof s === 'number') {
                    rootMesh.scaling.setAll(s)
                } else {
                    rootMesh.scaling.set(s[0], s[1], s[2])
                }
            }

            // Material conversion pipeline:
            //  - caller-provided callback wins
            //  - otherwise optional PBR -> StandardMaterial conversion for noa defaults
            if (options.onMaterialLoaded) {
                meshes.forEach(function (mesh) {
                    if (mesh.material && mesh.name !== '__root__') {
                        var oldMat = mesh.material
                        var newMat = options.onMaterialLoaded(oldMat, mesh)
                        if (newMat && newMat !== oldMat) {
                            mesh.material = newMat
                            oldMaterials.push(oldMat)
                        }
                    }
                })
            } else if (options.convertToStandard) {
                meshes.forEach(function (mesh) {
                    if (mesh.material && mesh.name !== '__root__') {
                        var oldMat = mesh.material
                        var newMat = new StandardMaterial(oldMat.name + '_std', scene)

                        var baseColor = extractPBRColor(oldMat)
                        if (baseColor) {
                            newMat.diffuseColor = new Color3(baseColor.r, baseColor.g, baseColor.b)
                        } else {
                            newMat.diffuseColor = new Color3(0.6, 0.6, 0.6)
                        }

                        newMat.specularColor = new Color3(0.1, 0.1, 0.1)
                        newMat.ambientColor = new Color3(1, 1, 1)

                        mesh.material = newMat
                        oldMaterials.push(oldMat)
                    }
                })
            }

            // Dispose old materials after conversion (don't hold references)
            disposeOldMaterials()

            // Register meshes with noa if requested
            if (registerMeshes) {
                meshes.forEach(function (mesh) {
                    // Only register meshes with valid boundingInfo
                    var bi = mesh.getBoundingInfo && mesh.getBoundingInfo()
                    if (bi && bi.boundingSphere) {
                        rendering.addMeshToScene(mesh)
                    } else {
                        // Hide meshes without boundingInfo to prevent render errors
                        mesh.isVisible = false
                    }
                })
            }

            // Create cleanup function that releases ALL references
            cleanupFn = function () {
                disposeLoadedResources()
            }

            return {
                rootMesh: rootMesh,
                meshes: meshes,
                skeletons: skeletons,
                animationGroups: animationGroups,
                cleanup: cleanupFn,
            }
        } catch (err) {
            disposeOldMaterials()
            if (cleanupFn) {
                try { cleanupFn() } catch (cleanupErr) { }
            } else {
                disposeLoadedResources()
            }
            console.error('[noa] Failed to load model:', url, err)
            throw err
        }
    }
}


/**
 * Extract base color from a PBR material using runtime property detection.
 * Works with PBRMaterial and PBRMetallicRoughnessMaterial.
 * @param {import('@babylonjs/core').Material} mat
 * @returns {{r: number, g: number, b: number} | null}
 */
function extractPBRColor(mat) {
    // Check for PBR material properties at runtime
    if ('_albedoColor' in mat && mat._albedoColor) {
        return /** @type {{r: number, g: number, b: number}} */ (mat._albedoColor)
    }
    if ('albedoColor' in mat && mat.albedoColor) {
        return /** @type {{r: number, g: number, b: number}} */ (mat.albedoColor)
    }
    if ('baseColor' in mat && mat.baseColor) {
        return /** @type {{r: number, g: number, b: number}} */ (mat.baseColor)
    }
    return null
}
