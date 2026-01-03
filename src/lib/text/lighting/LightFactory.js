import { DirectionalLight, HemisphericLight, Vector3, Color3 } from '../../babylonExports.js'

/**
 * Factory for creating and configuring text lighting.
 */

/**
 * @typedef {object} LightConfig
 * @property {number} intensity - Light intensity
 * @property {Color3} diffuse - Diffuse color
 * @property {Color3} specular - Specular color
 * @property {number} ambientIntensity - Ambient light intensity
 * @property {Color3} ambientColor - Ambient light color
 */

/**
 * @typedef {object} CreatedLights
 * @property {DirectionalLight} textLight - Main directional light
 * @property {HemisphericLight} textAmbient - Ambient fill light
 */

/**
 * Create the text lighting setup.
 * @param {object} scene - Babylon scene
 * @param {LightConfig} config - Light configuration
 * @returns {CreatedLights}
 */
export function createLights(scene, config) {
    // Create directional text light (camera-relative)
    var textLight = new DirectionalLight('textLight', new Vector3(0, -1, 0.5), scene)
    textLight.intensity = config.intensity
    textLight.diffuse = config.diffuse.clone()
    textLight.specular = config.specular.clone()
    // Initially, no meshes are included (empty array means light affects nothing)
    textLight.includedOnlyMeshes = []

    // Create text-specific ambient/fill light
    var textAmbient = new HemisphericLight('textAmbient', new Vector3(0, 1, 0), scene)
    textAmbient.intensity = config.ambientIntensity
    textAmbient.diffuse = config.ambientColor.clone()
    textAmbient.groundColor = new Color3(0.1, 0.1, 0.1)
    textAmbient.specular = new Color3(0, 0, 0)
    textAmbient.includedOnlyMeshes = []

    return { textLight, textAmbient }
}

/**
 * Dispose lights and clean up.
 * @param {DirectionalLight|null} textLight
 * @param {HemisphericLight|null} textAmbient
 */
export function disposeLights(textLight, textAmbient) {
    if (textLight) {
        textLight.dispose()
    }
    if (textAmbient) {
        textAmbient.dispose()
    }
}

/**
 * Add mesh to light's includedOnlyMeshes array if not already present.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 */
export function addMeshToLight(light, mesh) {
    if (!light || !mesh || !light.includedOnlyMeshes) return
    if (light.includedOnlyMeshes.indexOf(mesh) === -1) {
        light.includedOnlyMeshes.push(mesh)
    }
}

/**
 * Remove mesh from light's includedOnlyMeshes array.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 */
export function removeMeshFromLight(light, mesh) {
    if (!light || !mesh || !light.includedOnlyMeshes) return
    var idx = light.includedOnlyMeshes.indexOf(mesh)
    if (idx >= 0) {
        light.includedOnlyMeshes.splice(idx, 1)
    }
}
