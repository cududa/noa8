import { FresnelParameters, Color3 } from '../babylonExports.js'

/**
 * Handles color processing and material configuration for text meshes.
 * Centralizes contrast color derivation and Fresnel setup.
 */

/**
 * Process color options for contrast requirements.
 * @param {object} opts - Text options
 * @param {object|null} contrastUtils - Color utilities from meshwriter
 * @returns {{emissive: string, diffuse: string|null, ambient: string|null}}
 */
export function processContrastColors(opts, contrastUtils) {
    var emissive = opts.color
    var diffuse = opts.diffuseColor
    var ambient = opts.ambientColor

    // If contrast utilities aren't available, pass through unchanged
    if (!contrastUtils) {
        return { emissive, diffuse, ambient }
    }

    // Case 1: User provided only emissive, autoContrast is enabled
    // Auto-derive diffuse and ambient for high contrast
    // Note: deriveEdgeColors may also return a modified emissive for the inverted approach
    if (opts.autoContrast && !diffuse && !ambient) {
        var derived = contrastUtils.deriveEdgeColors(emissive, opts.contrastLevel)
        return {
            emissive: derived.emissive || emissive,
            diffuse: derived.diffuse,
            ambient: derived.ambient
        }
    }

    // Case 2: User provided colors + highContrast flag
    // Adjust colors to meet WCAG contrast requirements
    if (opts.highContrast && (diffuse || ambient)) {
        var adjusted = contrastUtils.adjustForContrast({
            emissive: emissive,
            diffuse: diffuse || '#404040',
            ambient: ambient || '#202020'
        }, {
            targetContrast: opts.contrastLevel,
            edgeRange: 0.4,
            faceRange: 0.1
        })
        return {
            emissive: adjusted.emissive,
            diffuse: adjusted.diffuse,
            ambient: adjusted.ambient
        }
    }

    // Case 3: Pass through unchanged
    return { emissive, diffuse, ambient }
}

/**
 * Configure material for text mesh with Fresnel and contrast settings.
 * @param {object} material - Babylon StandardMaterial
 * @param {object} opts - Text options
 * @param {boolean} usingCameraLight - Whether camera-relative lighting is active
 * @param {boolean} isolatedFromSceneAmbient - Whether to zero ambient
 * @param {object|null} contrastUtils - Color utilities from meshwriter
 */
export function configureMaterial(material, opts, usingCameraLight, isolatedFromSceneAmbient, contrastUtils) {
    if (!material) return

    // Always render both faces so 3D extrusion stays visible
    material.backFaceCulling = false

    if (opts.autoContrast) {
        // Use Fresnel-based emissive even when camera lighting is active.
        // This keeps front faces bright for dyslexic readability while allowing
        // physical lights to continue adding depth to the edges.
        material.emissiveFresnelParameters = new FresnelParameters()
        material.emissiveFresnelParameters.bias = 0
        material.emissiveFresnelParameters.power = usingCameraLight ? 2.5 : 4

        var brightColor = contrastUtils ? contrastUtils.hexToRgb(opts.color) : { r: 1, g: 0.843, b: 0 }
        var darkColor = { r: 0.12, g: 0.1, b: 0 }
        var brighten = usingCameraLight ? 1.15 : 1

        material.emissiveFresnelParameters.leftColor = new Color3(
            Math.min(1, brightColor.r * brighten),
            Math.min(1, brightColor.g * brighten),
            Math.min(1, brightColor.b * brighten)
        )
        material.emissiveFresnelParameters.rightColor = new Color3(darkColor.r, darkColor.g, darkColor.b)
        material.emissiveColor = new Color3(0, 0, 0)
    }

    if (usingCameraLight && isolatedFromSceneAmbient) {
        material.ambientColor = new Color3(0, 0, 0)
    }
}
