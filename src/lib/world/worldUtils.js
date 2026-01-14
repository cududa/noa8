/**
 * Utility functions and default options for World module.
 * @module worldUtils
 */

/**
 * @typedef {object} WorldOptions
 * @property {number} [chunkSize=24]
 * @property {number|[number,number]} [chunkAddDistance=[2,2]] - [horizontal, vertical] or single number
 * @property {number|[number,number]} [chunkRemoveDistance=[3,3]] - [horizontal, vertical] or single number
 * @property {boolean} [worldGenWhilePaused=false]
 * @property {boolean} [manuallyControlChunkLoading=false]
 */

/** @type {WorldOptions} */
export var defaultOptions = {
    chunkSize: 24,
    chunkAddDistance: [2, 2],           // [horizontal, vertical]
    chunkRemoveDistance: [3, 3],        // [horizontal, vertical]
    worldGenWhilePaused: false,
    manuallyControlChunkLoading: false,
}


/**
 * Chunk sorting distance function type
 * @typedef {function(number, number, number): number} ChunkSortingDistFn
 */

/**
 * Default distance function for chunk sorting - squared Euclidean distance
 * @type {ChunkSortingDistFn}
 */
export var defaultSortDistance = (i, j, k) => (i * i) + (j * j) + (k * k)


/**
 * Sorts a queue DESCENDING by distance from player position, unless reversed.
 * @param {import('./index.js').World} world
 * @param {import('../util.js').LocationQueue} queue
 * @param {number} [pi] - Player chunk i index (defaults to current position)
 * @param {number} [pj] - Player chunk j index
 * @param {number} [pk] - Player chunk k index
 * @param {boolean} [reverse=false] - Sort ascending instead of descending
 */
export function sortQueueByDistanceFrom(world, queue, pi, pj, pk, reverse = false) {
    var distFn = world.chunkSortingDistFn || defaultSortDistance
    var localDist = (i, j, k) => distFn(pi - i, pj - j, pk - k)
    if (pi === undefined) {
        var pos = world.noa.entities.getPosition(world.noa.playerEntity)
        var indexes = world._coordsToChunkIndexes(pos[0], pos[1], pos[2])
        pi = indexes[0]
        pj = indexes[1]
        pk = indexes[2]
    }
    queue.sortByDistance(localDist, reverse)
}
