/**
 * Debug reporting and profiling utilities for World module.
 * @module worldDebug
 */

import { makeProfileHook } from '../util.js'

// Profiling configuration - set > 0 to enable
var PROFILE_EVERY = 0          // ticks
var PROFILE_QUEUES_EVERY = 0   // ticks

/** Profile hook for world tick timing */
export var profile_hook = makeProfileHook(PROFILE_EVERY, 'world ticks:', 1)

/**
 * Creates a profiling hook for chunk queue flow monitoring.
 * @param {number} every - Log every N ticks (0 to disable)
 * @returns {function(string, import('./index.js').World=): void}
 */
function createProfileQueuesHook(every) {
    if (!(every > 0)) return () => { }
    var iter = 0
    /** @type {Record<string, number>} */
    var counts = {}
    /** @type {Record<string, number>} */
    var queues = {}
    var started = performance.now()
    return function profile_queues_hook(state, world) {
        if (state === 'start') return
        if (state !== 'end') return counts[state] = (counts[state] || 0) + 1
        queues.toreq = (queues.toreq || 0) + world._chunksToRequest.count()
        queues.toget = (queues.toget || 0) + world._chunksPending.count()
        queues.tomesh = (queues.tomesh || 0) + world._chunksToMesh.count() + world._chunksToMeshFirst.count()
        queues.tomesh1 = (queues.tomesh1 || 0) + world._chunksToMeshFirst.count()
        queues.torem = (queues.torem || 0) + world._chunksToRemove.count()
        if (++iter < every) return
        var t = performance.now(), dt = t - started
        /** @type {Record<string, string>} */
        var res = {}
        Object.keys(queues).forEach(k => {
            var num = Math.round((queues[k] || 0) / iter)
            res[k] = `[${num}]`.padStart(5)
        })
        Object.keys(counts).forEach(k => {
            var num = Math.round((counts[k] || 0) * 1000 / dt)
            res[k] = ('' + num).padStart(3)
        })
        console.log('chunk flow: ',
            `${res.toreq}-> ${res.request || 0} req/s  `,
            `${res.toget}-> ${res.receive || 0} got/s  `,
            `${(res.tomesh)}-> ${res.mesh || 0} mesh/s  `,
            `${res.torem}-> ${res.dispose || 0} rem/s  `,
            `(meshFirst: ${res.tomesh1.trim()})`,
        )
        iter = 0
        counts = {}
        queues = {}
        started = performance.now()
    }
}

/** Profile hook for chunk queue flow monitoring */
export var profile_queues_hook = createProfileQueuesHook(PROFILE_QUEUES_EVERY)


/**
 * Debug reporting class for World diagnostics.
 */
export class WorldDebug {
    /**
     * @param {import('./index.js').World} world
     */
    constructor(world) {
        /** @type {import('./index.js').World} */
        this.world = world
    }

    /** @internal */
    report() {
        var world = this.world
        console.log('World report - playerChunkLoaded: ', world.playerChunkLoaded)
        this._report('  known:     ', world._chunksKnown.arr, true)
        this._report('  to request:', world._chunksToRequest.arr, false)
        this._report('  to remove: ', world._chunksToRemove.arr, false)
        this._report('  invalid:   ', world._chunksInvalidated.arr, false)
        this._report('  creating:  ', world._chunksPending.arr, false)
        this._report('  to mesh:   ', world._chunksToMesh.arr, false)
        this._report('  mesh 1st:  ', world._chunksToMeshFirst.arr, false)
    }

    /**
     * @param {string} name
     * @param {[number, number, number][]} arr
     * @param {boolean} ext
     */
    _report(name, arr, ext) {
        var world = this.world
        var full = 0,
            empty = 0,
            exist = 0,
            surrounded = 0,
            remeshes = /** @type {number[]} */ ([])
        arr.forEach(loc => {
            var chunk = world._storage.getChunkByIndexes(loc[0], loc[1], loc[2])
            if (!chunk) return
            exist++
            remeshes.push(chunk._timesMeshed)
            if (chunk._isFull) full++
            if (chunk._isEmpty) empty++
            if (chunk._neighborCount === 26) surrounded++
        })
        var out = arr.length.toString().padEnd(8)
        out += ('exist: ' + exist).padEnd(12)
        out += ('full: ' + full).padEnd(12)
        out += ('empty: ' + empty).padEnd(12)
        out += ('surr: ' + surrounded).padEnd(12)
        if (ext) {
            var sum = remeshes.reduce((acc, val) => acc + val, 0)
            var max = remeshes.reduce((acc, val) => Math.max(acc, val), 0)
            var min = remeshes.reduce((acc, val) => Math.min(acc, val), 0)
            out += 'times meshed: avg ' + (sum / exist).toFixed(2)
            out += '  max ' + max
            out += '  min ' + min
        }
        console.log(name, out)
    }
}
