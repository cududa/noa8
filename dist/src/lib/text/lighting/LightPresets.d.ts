/**
 * Get available preset names including 'custom'
 * @returns {string[]}
 */
export function getPresetNames(): string[];
/**
 * Validate and normalize a preset name.
 * @param {string} preset - Preset name to validate
 * @returns {string} - Valid preset name (defaults to 'above-front' if invalid)
 */
export function validatePreset(preset: string): string;
/**
 * Get offsets for a preset or custom values.
 * @param {string} preset - Current preset name
 * @param {number} customAzimuth - Custom azimuth value
 * @param {number} customElevation - Custom elevation value
 * @returns {{azimuth: number, elevation: number}}
 */
export function getOffsets(preset: string, customAzimuth: number, customElevation: number): {
    azimuth: number;
    elevation: number;
};
/**
 * Light direction presets for camera-relative text lighting.
 * Azimuth: horizontal offset from camera forward (degrees)
 * Elevation: vertical offset from horizontal (degrees, negative = from above)
 */
export const PRESETS: {
    'above-front': {
        azimuth: number;
        elevation: number;
    };
    headlamp: {
        azimuth: number;
        elevation: number;
    };
    'above-left': {
        azimuth: number;
        elevation: number;
    };
    'above-right': {
        azimuth: number;
        elevation: number;
    };
};
