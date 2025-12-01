/**
 * Binary format constants and utilities for .noaworld files
 *
 * File format v1:
 * - Header: 32 bytes
 * - Chunk index: 12 bytes per chunk
 * - Chunk data: variable (chunkSize^3 * 2 bytes per non-uniform chunk)
 */

// Magic bytes: "NOAW" as uint32 little-endian
export const MAGIC = 0x57414F4E  // "NOAW" in little-endian

export const FORMAT_VERSION = 1

export const HEADER_SIZE = 32

export const CHUNK_INDEX_ENTRY_SIZE = 14

// Chunk flags
export const CHUNK_FLAG_UNIFORM = 0x01

/**
 * @typedef {Object} WorldHeader
 * @property {number} magic - Magic bytes (should equal MAGIC)
 * @property {number} version - Format version
 * @property {number} flags - World flags
 * @property {number} chunkSize - Size of chunks in voxels
 * @property {number} chunkCount - Number of chunks
 * @property {number} minX - Min chunk X index
 * @property {number} maxX - Max chunk X index
 * @property {number} minY - Min chunk Y index
 * @property {number} maxY - Max chunk Y index
 * @property {number} minZ - Min chunk Z index
 * @property {number} maxZ - Max chunk Z index
 * @property {number} checksum - CRC32 of chunk data
 */

/**
 * @typedef {Object} ChunkIndexEntry
 * @property {number} x - Chunk X index
 * @property {number} y - Chunk Y index
 * @property {number} z - Chunk Z index
 * @property {number} flags - Chunk flags (bit 0: uniform)
 * @property {number} fillBlockId - Fill block ID if uniform
 * @property {number} dataOffset - Offset into data section (0 if uniform)
 */

/**
 * Parse header from DataView
 * @param {DataView} view
 * @returns {WorldHeader}
 */
export function parseHeader(view) {
    return {
        magic: view.getUint32(0, true),
        version: view.getUint16(4, true),
        flags: view.getUint16(6, true),
        chunkSize: view.getUint16(8, true),
        chunkCount: view.getUint32(10, true),
        minX: view.getInt16(14, true),
        maxX: view.getInt16(16, true),
        minY: view.getInt16(18, true),
        maxY: view.getInt16(20, true),
        minZ: view.getInt16(22, true),
        maxZ: view.getInt16(24, true),
        checksum: view.getUint32(26, true),
        // bytes 30-31 reserved
    }
}

/**
 * Write header to DataView
 * @param {DataView} view
 * @param {WorldHeader} header
 */
export function writeHeader(view, header) {
    view.setUint32(0, MAGIC, true)
    view.setUint16(4, header.version, true)
    view.setUint16(6, header.flags, true)
    view.setUint16(8, header.chunkSize, true)
    view.setUint32(10, header.chunkCount, true)
    view.setInt16(14, header.minX, true)
    view.setInt16(16, header.maxX, true)
    view.setInt16(18, header.minY, true)
    view.setInt16(20, header.maxY, true)
    view.setInt16(22, header.minZ, true)
    view.setInt16(24, header.maxZ, true)
    view.setUint32(26, header.checksum, true)
    // bytes 30-31 reserved (zero)
    view.setUint16(30, 0, true)
}

/**
 * Parse chunk index entry from DataView
 * @param {DataView} view
 * @param {number} offset - Byte offset to start reading from
 * @returns {ChunkIndexEntry}
 */
export function parseChunkIndex(view, offset) {
    return {
        x: view.getInt16(offset, true),
        y: view.getInt16(offset + 2, true),
        z: view.getInt16(offset + 4, true),
        flags: view.getUint16(offset + 6, true),
        fillBlockId: view.getUint16(offset + 8, true),
        dataOffset: view.getUint32(offset + 10, true),
    }
}

/**
 * Write chunk index entry to DataView
 * @param {DataView} view
 * @param {number} offset
 * @param {ChunkIndexEntry} entry
 */
export function writeChunkIndex(view, offset, entry) {
    view.setInt16(offset, entry.x, true)
    view.setInt16(offset + 2, entry.y, true)
    view.setInt16(offset + 4, entry.z, true)
    view.setUint16(offset + 6, entry.flags, true)
    view.setUint16(offset + 8, entry.fillBlockId, true)
    view.setUint32(offset + 10, entry.dataOffset, true)
}

/**
 * Create a location hash for chunk coordinates
 * Compatible with noa's internal locationHasher but without wraparound concerns
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {string}
 */
export function chunkKey(x, y, z) {
    return `${x}|${y}|${z}`
}

/**
 * Check if a chunk's voxel data is uniform (all same block ID)
 * @param {Int16Array|Uint16Array} data
 * @returns {{uniform: boolean, fillId: number}}
 */
export function checkUniform(data) {
    const firstVal = data[0]
    for (let i = 1; i < data.length; i++) {
        if (data[i] !== firstVal) {
            return { uniform: false, fillId: 0 }
        }
    }
    return { uniform: true, fillId: firstVal }
}

// CRC32 lookup table (generated once)
const CRC32_TABLE = makeCRC32Table()

function makeCRC32Table() {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
        let c = i
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
        }
        table[i] = c
    }
    return table
}

/**
 * Calculate CRC32 checksum of data
 * @param {Uint8Array} data
 * @returns {number}
 */
export function crc32(data) {
    let crc = 0xFFFFFFFF
    for (let i = 0; i < data.length; i++) {
        crc = CRC32_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
}

/**
 * Validate magic bytes
 * @param {number} magic
 * @returns {boolean}
 */
export function validateMagic(magic) {
    return magic === MAGIC
}

/**
 * Validate format version
 * @param {number} version
 * @returns {boolean}
 */
export function validateVersion(version) {
    return version >= 1 && version <= FORMAT_VERSION
}
