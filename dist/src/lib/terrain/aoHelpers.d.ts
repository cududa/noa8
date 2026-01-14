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
export function packAOMask(isSolid: (arg0: number, arg1: number, arg2: number) => boolean, ipos: number, ineg: number, j: number, k: number, skipReverse?: boolean): number;
/**
 * Takes in a packed AO value representing a face,
 * and returns four 2-bit numbers for the AO levels at the four corners.
 * @param {number} aomask
 * @returns {[number, number, number, number]}
 */
export function unpackAOMask(aomask: number): [number, number, number, number];
