
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
            var zoom = noa.camera.currentZoom
            for (var i = 0; i < states.length; i++) {
                checkZoom(states[i], zoom, noa)
            }
        }
    }
}


function checkZoom(state, zoom, noa) {
    if (!noa.ents.hasMesh(state.__id)) return
    var mesh = noa.ents.getMeshData(state.__id).mesh
    if (!mesh) return

    // Use the minimum of currentZoom and the target zoomDistance so we hide immediately
    // when switching to first-person, even before the lerp finishes.
    var zoomMetric = Math.min(noa.camera.currentZoom, noa.camera.zoomDistance)
    var shouldHide = (zoomMetric < state.cutoff)
    var visible = !shouldHide

    // Hide/show the entire hierarchy so character children also disappear
    // Important for rigged models where the root is a transform node.
    var targets = []
    if (mesh.getChildMeshes) {
        targets = mesh.getChildMeshes(false) // false = all descendants (recursive)
    }
    targets.push(mesh)

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
