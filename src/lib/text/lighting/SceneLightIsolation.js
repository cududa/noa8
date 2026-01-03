/**
 * Manages scene light isolation for text meshes.
 * Ensures new lights added to the scene don't affect text meshes using camera-relative lighting.
 */

/**
 * Register an observer for new scene lights.
 * @param {object} scene - Babylon scene
 * @param {Function} onNewLight - Callback for new lights
 * @returns {object} Observer reference for cleanup
 */
export function registerSceneLightObserver(scene, onNewLight) {
    if (!scene) return null
    return scene.onNewLightAddedObservable.add(onNewLight)
}

/**
 * Unregister the scene light observer.
 * @param {object} scene - Babylon scene
 * @param {object} observer - Observer reference
 */
export function unregisterSceneLightObserver(scene, observer) {
    if (scene && observer) {
        scene.onNewLightAddedObservable.remove(observer)
    }
}

/**
 * Check if a light should be ignored for isolation purposes.
 * @param {object} light - Babylon light
 * @param {object} textLight - Text directional light
 * @param {object} textAmbient - Text ambient light
 * @returns {boolean}
 */
export function shouldIgnoreLight(light, textLight, textAmbient) {
    if (!light) return true
    if (light === textLight) return true
    if (light === textAmbient) return true
    if (light.name === 'characterKey') return true
    return false
}

/**
 * Exclude a mesh from a light.
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function excludeMeshFromLight(light, mesh, textLight, textAmbient) {
    if (!light || !mesh) return
    if (shouldIgnoreLight(light, textLight, textAmbient)) return

    if (!light.excludedMeshes) {
        light.excludedMeshes = []
    }
    if (light.excludedMeshes.indexOf(mesh) === -1) {
        light.excludedMeshes.push(mesh)
    }
}

/**
 * Include a mesh in a light (remove from excludedMeshes).
 * @param {object} light - Babylon light
 * @param {object} mesh - Babylon mesh
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function includeMeshInLight(light, mesh, textLight, textAmbient) {
    if (!light || !mesh) return
    if (shouldIgnoreLight(light, textLight, textAmbient)) return

    if (light.excludedMeshes) {
        var idx = light.excludedMeshes.indexOf(mesh)
        if (idx >= 0) {
            light.excludedMeshes.splice(idx, 1)
        }
    }
}

/**
 * Exclude mesh from all world lights in a scene.
 * @param {object} scene - Babylon scene
 * @param {object} mesh - Mesh to exclude
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function excludeMeshFromAllWorldLights(scene, mesh, textLight, textAmbient) {
    if (!scene) return
    for (var light of scene.lights) {
        excludeMeshFromLight(light, mesh, textLight, textAmbient)
    }
}

/**
 * Include mesh in all world lights in a scene.
 * @param {object} scene - Babylon scene
 * @param {object} mesh - Mesh to include
 * @param {object} textLight - Text light (to skip)
 * @param {object} textAmbient - Text ambient (to skip)
 */
export function includeMeshInAllWorldLights(scene, mesh, textLight, textAmbient) {
    if (!scene) return
    for (var light of scene.lights) {
        includeMeshInLight(light, mesh, textLight, textAmbient)
    }
}
