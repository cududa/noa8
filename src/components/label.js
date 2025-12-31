
import * as vec3 from 'gl-vec3'


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

export default function (noa) {

    return {

        name: 'label',

        order: 85, // After shadow (80), before mesh render updates

        state: {
            /** Text content to display */
            text: '',
            /** Offset from entity position [x, y, z] */
            offset: null,
            /** Text rendering options */
            options: null,
            /** Whether to billboard (face camera) */
            billboard: true,
            /** @internal - TextHandle from text system */
            _handle: null,
            /** @internal - Cached text for change detection */
            _cachedText: '',
        },


        onAdd: function (eid, state) {
            // Initialize offset
            if (!state.offset) {
                state.offset = [0, 1.5, 0] // Default: above entity
            } else {
                state.offset = vec3.clone(state.offset)
            }

            // Initialize options
            state.options = Object.assign({
                letterHeight: 0.5,
                letterThickness: 0.05,
                color: '#FFFFFF',
                alpha: 1,
                anchor: 'center',
            }, state.options || {})

            state._cachedText = state.text

            // Create text if system is ready
            createLabelText(noa, eid, state)
        },


        onRemove: function (eid, state) {
            if (state._handle) {
                state._handle.dispose()
                state._handle = null
            }
            state.offset = null
            state.options = null
        },


        // Tick system: handle text updates
        system: function labelSystem(dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i]

                // Check for text content changes
                if (state.text !== state._cachedText) {
                    state._cachedText = state.text
                    updateLabelText(noa, state.__id, state)
                }
            }
        },


        // Render system: update label positions to match entity render positions
        renderSystem: function labelRenderSystem(dt, states) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i]
                if (!state._handle || !state._handle.mesh) continue

                var posData = noa.ents.getPositionData(state.__id)
                if (!posData) continue // defensive check for mid-frame deletion

                var rpos = posData._renderPosition
                var mesh = state._handle.mesh

                // Position = render position + offset
                mesh.position.copyFromFloats(
                    rpos[0] + state.offset[0],
                    rpos[1] + state.offset[1],
                    rpos[2] + state.offset[2]
                )
            }
        }

    }


    function createLabelText(noa, eid, state) {
        if (!noa.text || !noa.text.ready) {
            // Text system not ready - try again later via deferred init
            noa.rendering.onSceneReady(() => {
                if (state._handle) return // Already created
                createLabelText(noa, eid, state)
            })
            return
        }

        if (!state.text) return

        // Get entity position for initial placement
        var posData = noa.ents.getPositionData(eid)
        var position = posData ? posData.position.slice() : [0, 0, 0]
        vec3.add(position, position, state.offset)

        var options = Object.assign({}, state.options, { position })

        // Create billboard or regular text
        state._handle = state.billboard
            ? noa.text.createBillboardText(state.text, options)
            : noa.text.createWorldText(state.text, options)
    }


    function updateLabelText(noa, eid, state) {
        if (!noa.text || !noa.text.ready) return

        if (!state.text) {
            // Empty text - dispose existing
            if (state._handle) {
                state._handle.dispose()
                state._handle = null
            }
            return
        }

        if (state._handle) {
            // Update existing - get position from current mesh
            var mesh = state._handle.mesh
            var position = [
                mesh.position.x + noa.worldOriginOffset[0],
                mesh.position.y + noa.worldOriginOffset[1],
                mesh.position.z + noa.worldOriginOffset[2],
            ]
            var options = Object.assign({}, state.options, { position })

            // Dispose and recreate (MeshWriter doesn't support in-place updates)
            var wasBillboard = state._handle._billboard
            state._handle.dispose()

            state._handle = wasBillboard
                ? noa.text.createBillboardText(state.text, options)
                : noa.text.createWorldText(state.text, options)
        } else {
            // Create new
            createLabelText(noa, eid, state)
        }
    }
}


/**
 * @typedef {object} LabelState
 * @property {string} text - Text content to display
 * @property {number[]} offset - Offset from entity position [x, y, z]
 * @property {object} options - Text rendering options
 * @property {boolean} billboard - Whether to billboard (face camera)
 */
