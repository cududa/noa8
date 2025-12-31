/**
 * Label component - attaches floating 3D text to an entity.
 *
 * Supports:
 * - Billboarding (text always faces camera)
 * - Position offset from entity center
 * - Dynamic text updates
 * - Automatic world origin rebasing
 *
 * @example
 * ```js
 * // Add a label to an entity
 * noa.ents.addComponent(entityId, noa.ents.names.label, {
 *     text: 'Player Name',
 *     offset: [0, 2.5, 0],
 *     billboard: true,
 *     options: {
 *         letterHeight: 0.4,
 *         color: '#FFFF00',
 *     }
 * })
 *
 * // Update label text dynamically
 * const labelState = noa.ents.getLabel(entityId)
 * labelState.text = 'New Name'
 * ```
 *
 * @param {import('../index').Engine} noa
 */
export default function _default(noa: import("../index").Engine): {
    name: string;
    order: number;
    state: {
        /** Text content to display */
        text: string;
        /** Offset from entity position [x, y, z] */
        offset: any;
        /** Text rendering options */
        options: any;
        /** Whether to billboard (face camera) */
        billboard: boolean;
        /** @internal - TextHandle from text system */
        _handle: any;
        /** @internal - Cached text for change detection */
        _cachedText: string;
        /** @internal - Whether we're waiting for the text system to init */
        _waitingForText: boolean;
    };
    onAdd: (eid: any, state: any) => void;
    onRemove: (eid: any, state: any) => void;
    system: (dt: any, states: any) => void;
    renderSystem: (dt: any, states: any) => void;
};
export type LabelState = {
    /**
     * - Text content to display
     */
    text: string;
    /**
     * - Offset from entity position [x, y, z]
     */
    offset: number[];
    /**
     * - Text rendering options
     */
    options: object;
    /**
     * - Whether to billboard (face camera)
     */
    billboard: boolean;
};
