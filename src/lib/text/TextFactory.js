import { warn } from './logging.js'
import { TextHandle } from './TextHandle.js'
import { processContrastColors, configureMaterial } from './MaterialConfigurator.js'

/**
 * Factory functions for creating text meshes.
 * Encapsulates mesh creation logic separate from the Text class.
 */

/**
 * Create a 3D text mesh at a world position.
 * @param {object} params - Creation parameters
 * @param {string} params.content - Text string to render
 * @param {object} params.options - Merged options
 * @param {object} params.Writer - MeshWriter instance
 * @param {object} params.noa - Engine reference
 * @param {object|null} params.textLighting - TextLighting instance
 * @param {object} params.shadowManager - TextShadowManager instance
 * @param {object|null} params.contrastUtils - Color contrast utilities
 * @param {number} params.nextId - Next unique ID
 * @param {Function} params.registerHandle - Callback to register handle
 * @param {Function} params.removeText - Callback to remove text
 * @returns {{handle: TextHandle, nextId: number}|null}
 */
export function createWorldText(params) {
    var { content, options: opts, Writer, noa, textLighting, shadowManager, contrastUtils, nextId, registerHandle, removeText } = params

    var position = opts.position || [0, 0, 0]

    // Process colors for contrast requirements
    var processedColors = processContrastColors(opts, contrastUtils)

    // Build colors object for meshwriter (only include non-null values)
    var colors = {}
    if (processedColors.diffuse) colors.diffuse = processedColors.diffuse
    if (processedColors.ambient) colors.ambient = processedColors.ambient
    if (opts.specularColor) colors.specular = opts.specularColor

    // Create meshwriter text instance
    // Use original color (opts.color) for MeshWriter - the face mesh needs the bright color.
    // The rim material gets configured separately by configureMaterial() below.
    var textInstance = new Writer(content, {
        'font-family': opts.font,
        'letter-height': opts.letterHeight,
        'letter-thickness': opts.letterThickness,
        'color': opts.color,
        'alpha': opts.alpha,
        'anchor': opts.anchor,
        'emissive-only': opts.emissiveOnly,
        'fog-enabled': opts.fogEnabled,
        'colors': Object.keys(colors).length > 0 ? colors : undefined,
        'position': { x: 0, y: 0, z: 0 }
    })

    var mesh = textInstance.getMesh()
    var faceMesh = (typeof textInstance.getFaceMesh === 'function')
        ? textInstance.getFaceMesh()
        : null

    if (!mesh) {
        warn('Failed to create text mesh')
        return null
    }

    // Determine if we're using camera-relative lighting
    var usingCameraLight = opts.useCameraLight && textLighting && textLighting.isEnabled()

    // Configure material for contrast and lighting
    var material = textInstance.getMaterial()
    var isolatedFromSceneAmbient = textLighting && textLighting.isIsolatedFromSceneAmbient()

    configureMaterial(material, opts, usingCameraLight, isolatedFromSceneAmbient, contrastUtils, {
        processedColors,
        hasFaceMesh: !!faceMesh
    })

    // Add rim mesh to noa scene management
    noa.rendering.addMeshToScene(mesh, false, position)

    // Position rim mesh in world (convert global to local)
    var localPos = noa.globalToLocal(position, null, [])
    mesh.position.copyFromFloats(localPos[0], localPos[1], localPos[2])

    // Text renders in XZ plane by default, rotate to be vertical (upright)
    mesh.rotation.x = -Math.PI / 2

    // Handle face mesh - unparent and add to scene separately
    // Face mesh must be in noa's scene management to render properly
    if (faceMesh) {
        // Unparent face mesh (meshwriter parents it to rim by default)
        faceMesh.parent = null

        // Position face mesh same as rim
        faceMesh.position.copyFrom(mesh.position)
        faceMesh.rotation.copyFrom(mesh.rotation)

        // Tiny Z offset to prevent z-fighting (after rotation, local Y becomes world -Z)
        // Negative Z moves face toward camera; keep minimal to avoid visible gap
        faceMesh.position.z -= 0.0005

        // Add face mesh to noa scene management
        var faceGlobalPos = [
            position[0],
            position[1],
            position[2] - 0.0005
        ]
        noa.rendering.addMeshToScene(faceMesh, false, faceGlobalPos)
    }

    // Register rim mesh with camera-relative lighting system
    // Face mesh is NOT added - it has disableLighting=true (emissive/self-lit)
    if (usingCameraLight && textLighting) {
        textLighting.addTextMesh(mesh)
    }

    // Create handle for management
    var id = nextId
    var handleConfig = {
        removeText: removeText,
        removeShadows: (textId) => shadowManager.removeShadows(textId),
        removeFromLighting: (m) => {
            if (textLighting) textLighting.removeTextMesh(m)
        },
        removeMeshFromScene: (m) => noa.rendering.removeMeshFromScene(m)
    }
    var handle = new TextHandle(handleConfig, id, textInstance, mesh, content, opts, faceMesh)
    registerHandle(id, handle)

    // Create shadows if enabled
    var shadowOptions = opts.shadow
    if (shadowOptions !== false) {
        var resolvedShadowOpts = (shadowOptions === true || shadowOptions === undefined)
            ? undefined
            : shadowOptions
        shadowManager.createShadowsForText(handle, resolvedShadowOpts)
    }

    return { handle, nextId: id + 1 }
}

/**
 * Create billboarded text that always faces the camera.
 * @param {object} params - Same as createWorldText
 * @returns {{handle: TextHandle, nextId: number}|null}
 */
export function createBillboardText(params) {
    var result = createWorldText(params)
    if (result && result.handle) {
        result.handle._billboard = true
        result.handle.mesh.billboardMode = 7 // BABYLON.Mesh.BILLBOARDMODE_ALL
    }
    return result
}

/**
 * Update text content (dispose old, create new).
 * @param {TextHandle} handle - Existing text handle
 * @param {string} newContent - New text content
 * @param {object} noa - Engine reference
 * @param {object} createParams - Base params for create functions (without content/options)
 * @returns {TextHandle|null}
 */
export function updateText(handle, newContent, noa, createParams) {
    if (!handle || handle._disposed) return null

    // Preserve position and options
    var mesh = handle.mesh
    var position = [
        mesh.position.x + noa.worldOriginOffset[0],
        mesh.position.y + noa.worldOriginOffset[1],
        mesh.position.z + noa.worldOriginOffset[2],
    ]
    var rotation = mesh.rotation.clone()
    var wasBillboard = handle._billboard
    var options = Object.assign({}, handle._options, { position })

    // Dispose old
    handle.dispose()

    // Create new
    var params = Object.assign({}, createParams, { content: newContent, options })
    var result = wasBillboard ? createBillboardText(params) : createWorldText(params)

    if (result && result.handle && rotation) {
        result.handle.mesh.rotation.copyFrom(rotation)
    }

    return result ? result.handle : null
}
