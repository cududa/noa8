
/**
 * Component for the player entity, when active hides the player's mesh 
 * when camera zoom is less than a certain amount
 */

export default function (noa) {
    return {

        name: 'fadeOnZoom',

        order: 99,

        state: {
            cutoff: 1.5,
        },

        onAdd: null,

        onRemove: null,

        system: function fadeOnZoomProc(dt, states) {
            // Use minimum to hide immediately when switching to first-person
            var zoomMetric = Math.min(noa.camera.currentZoom, noa.camera.zoomDistance)
            for (var i = 0; i < states.length; i++) {
                checkZoom(states[i], zoomMetric, noa)
            }
        }
    }
}


function checkZoom(state, zoomMetric, noa) {
    if (!noa.ents.hasMesh(state.__id)) return
    var mesh = noa.ents.getMeshData(state.__id).mesh
    if (!mesh) return

    var shouldHide = (zoomMetric < state.cutoff)
    var visible = !shouldHide

    // Cache targets per entity to avoid per-frame allocations.
    var targets = state._fadeTargets
    if (!targets || state._fadeTargetsMesh !== mesh) {
        targets = []
        if (mesh.getChildMeshes) {
            targets = mesh.getChildMeshes(false) // false = all descendants (recursive)
        }
        targets.push(mesh)
        state._fadeTargets = targets
        state._fadeTargetsMesh = mesh
    }

    var ADDED_FLAG = 'noa_added_to_scene'
    for (var i = 0; i < targets.length; i++) {
        var m = targets[i]
        if (!m) continue
        if (m.metadata && m.metadata[ADDED_FLAG] !== undefined) {
            noa.rendering.setMeshVisibility(m, visible)
        } else {
            // Fallback for unregistered/transform nodes
            m.isVisible = visible
        }
    }
}
