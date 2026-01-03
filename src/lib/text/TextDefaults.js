/**
 * Default options for the text subsystem.
 */

/** Constructor defaults for Text class */
export var CONSTRUCTOR_DEFAULTS = {
    defaultFont: 'Helvetica',
    scale: 1,
    enabled: true,
}

/**
 * Default options for text creation.
 * @param {object} constructorOpts - Options from Text constructor
 * @returns {object} Default text creation options
 */
export function createDefaultOptions(constructorOpts) {
    return {
        font: constructorOpts.defaultFont,
        scale: constructorOpts.scale,
        letterHeight: 1,
        letterThickness: 0.1,
        color: '#FFFFFF',
        alpha: 1,
        /** @type {'left' | 'center' | 'right'} */
        anchor: /** @type {'center'} */ ('center'),
        /** If true, disables lighting (only emissive color shows) */
        emissiveOnly: false,
        /** Material colors - diffuse affects lit surfaces, ambient affects shadowed areas */
        diffuseColor: null,  // null = auto-derive for contrast (if autoContrast enabled)
        ambientColor: null,  // null = auto-derive for contrast (if autoContrast enabled)
        specularColor: null, // null = use meshwriter default (#000000)
        /** If true, text material is affected by scene fog (default: true) */
        fogEnabled: true,
        /** Shadow options - true = use manager defaults, object = override, false = disable */
        shadow: true,
        /** If true, auto-derive diffuse/ambient colors for WCAG contrast when only color is provided */
        autoContrast: true,
        /** If true and colors are provided, adjust them to meet WCAG contrast requirements */
        highContrast: false,
        /** Target WCAG contrast ratio (4.5 = AA normal, 7 = AAA) */
        contrastLevel: 4.5,
        /** If true, use camera-relative lighting instead of world lighting (disables Fresnel) */
        useCameraLight: true,
    }
}
