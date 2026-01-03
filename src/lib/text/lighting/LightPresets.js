/**
 * Light direction presets for camera-relative text lighting.
 * Azimuth: horizontal offset from camera forward (degrees)
 * Elevation: vertical offset from horizontal (degrees, negative = from above)
 */

export var PRESETS = {
    'above-front': { azimuth: 0, elevation: -45 },      // Classic readability
    'headlamp': { azimuth: 0, elevation: 0 },           // From camera position
    'above-left': { azimuth: -45, elevation: -45 },     // Dramatic left shadows
    'above-right': { azimuth: 45, elevation: -45 },     // Dramatic right shadows
}

/**
 * Get available preset names including 'custom'
 * @returns {string[]}
 */
export function getPresetNames() {
    return [...Object.keys(PRESETS), 'custom']
}

/**
 * Validate and normalize a preset name.
 * @param {string} preset - Preset name to validate
 * @returns {string} - Valid preset name (defaults to 'above-front' if invalid)
 */
export function validatePreset(preset) {
    if (preset === 'custom') return preset
    if (PRESETS[preset]) return preset
    console.warn('[noa.text] Unknown preset:', preset, '- using above-front')
    return 'above-front'
}

/**
 * Get offsets for a preset or custom values.
 * @param {string} preset - Current preset name
 * @param {number} customAzimuth - Custom azimuth value
 * @param {number} customElevation - Custom elevation value
 * @returns {{azimuth: number, elevation: number}}
 */
export function getOffsets(preset, customAzimuth, customElevation) {
    if (preset === 'custom') {
        return { azimuth: customAzimuth, elevation: customElevation }
    }
    return PRESETS[preset] || PRESETS['above-front']
}
