/**
 * Ambient occlusion helper functions for terrain meshing.
 * @module terrain/aoHelpers
 */

/**
 * For a given face, find occlusion levels for each vertex,
 * then pack 4 such (2-bit) values into one Uint8 value.
 *
 * Occlusion levels:
 *   1 is flat ground, 2 is partial occlusion, 3 is max (corners)
 *   0 is "reverse occlusion" - an unoccluded exposed edge
 *
 * Packing order var(bit offset):
 *     B(2)  -  C(6)   ^  K
 *      -        -     +> J
 *     A(0)  -  D(4)
 *
 * @param {function(number, number, number): boolean} isSolid
 * @param {number} ipos
 * @param {number} ineg
 * @param {number} j
 * @param {number} k
 * @param {boolean} [skipReverse=false]
 * @returns {number}
 */
export function packAOMask(isSolid, ipos, ineg, j, k, skipReverse = false) {
    var A = 1
    var B = 1
    var D = 1
    var C = 1

    // inc occlusion of vertex next to obstructed side
    if (isSolid(ipos, j + 1, k)) { ++D; ++C }
    if (isSolid(ipos, j - 1, k)) { ++A; ++B }
    if (isSolid(ipos, j, k + 1)) { ++B; ++C }
    if (isSolid(ipos, j, k - 1)) { ++A; ++D }

    // facing into a solid (non-opaque) block?
    var facingSolid = isSolid(ipos, j, k)
    if (facingSolid) {
        // always 2, or 3 in corners
        C = (C === 3 || isSolid(ipos, j + 1, k + 1)) ? 3 : 2
        B = (B === 3 || isSolid(ipos, j - 1, k + 1)) ? 3 : 2
        D = (D === 3 || isSolid(ipos, j + 1, k - 1)) ? 3 : 2
        A = (A === 3 || isSolid(ipos, j - 1, k - 1)) ? 3 : 2
        return C << 6 | D << 4 | B << 2 | A
    }

    // simpler logic if skipping reverse AO
    if (skipReverse) {
        // treat corner as occlusion 3 only if not occluded already
        if (C === 1 && (isSolid(ipos, j + 1, k + 1))) { C = 2 }
        if (B === 1 && (isSolid(ipos, j - 1, k + 1))) { B = 2 }
        if (D === 1 && (isSolid(ipos, j + 1, k - 1))) { D = 2 }
        if (A === 1 && (isSolid(ipos, j - 1, k - 1))) { A = 2 }
        return C << 6 | D << 4 | B << 2 | A
    }

    // check each corner, and if not present do reverse AO
    if (C === 1) {
        if (isSolid(ipos, j + 1, k + 1)) {
            C = 2
        } else if (!(isSolid(ineg, j, k + 1)) ||
            !(isSolid(ineg, j + 1, k)) ||
            !(isSolid(ineg, j + 1, k + 1))) {
            C = 0
        }
    }

    if (D === 1) {
        if (isSolid(ipos, j + 1, k - 1)) {
            D = 2
        } else if (!(isSolid(ineg, j, k - 1)) ||
            !(isSolid(ineg, j + 1, k)) ||
            !(isSolid(ineg, j + 1, k - 1))) {
            D = 0
        }
    }

    if (B === 1) {
        if (isSolid(ipos, j - 1, k + 1)) {
            B = 2
        } else if (!(isSolid(ineg, j, k + 1)) ||
            !(isSolid(ineg, j - 1, k)) ||
            !(isSolid(ineg, j - 1, k + 1))) {
            B = 0
        }
    }

    if (A === 1) {
        if (isSolid(ipos, j - 1, k - 1)) {
            A = 2
        } else if (!(isSolid(ineg, j, k - 1)) ||
            !(isSolid(ineg, j - 1, k)) ||
            !(isSolid(ineg, j - 1, k - 1))) {
            A = 0
        }
    }

    return C << 6 | D << 4 | B << 2 | A
}

/**
 * Takes in a packed AO value representing a face,
 * and returns four 2-bit numbers for the AO levels at the four corners.
 * @param {number} aomask
 * @returns {[number, number, number, number]}
 */
export function unpackAOMask(aomask) {
    var A = aomask & 3
    var B = (aomask >> 2) & 3
    var D = (aomask >> 4) & 3
    var C = (aomask >> 6) & 3
    return [A, B, C, D]
}
