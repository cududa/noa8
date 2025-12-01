/**
 * Web Worker for serializing baked world data to binary format
 *
 * This worker handles the CPU-intensive binary packing and CRC32 calculation
 * while chunk generation happens on the main thread (since generation functions
 * can't be easily passed to workers).
 *
 * Message protocol:
 * - Main -> Worker: { type: 'serialize', chunks: [...], header: {...} }
 * - Worker -> Main: { type: 'progress', current, total, message }
 * - Worker -> Main: { type: 'complete', buffer: ArrayBuffer }
 * - Worker -> Main: { type: 'error', message: string }
 */

import {
    HEADER_SIZE,
    CHUNK_INDEX_ENTRY_SIZE,
    CHUNK_FLAG_UNIFORM,
    FORMAT_VERSION,
    writeHeader,
    writeChunkIndex,
    crc32,
} from './worldFormats.js'

self.onmessage = function (e) {
    const { type, chunks, header } = e.data

    if (type === 'serialize') {
        try {
            serializeWorld(chunks, header)
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message })
        }
    }
}

/**
 * Serialize chunk data to binary format
 * @param {Array<{x: number, y: number, z: number, data: Uint16Array|null, uniform: boolean, fillId: number}>} chunks
 * @param {{chunkSize: number, minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number}} header
 */
function serializeWorld(chunks, header) {
    const { chunkSize } = header
    const voxelCount = chunkSize * chunkSize * chunkSize
    const bytesPerChunk = voxelCount * 2  // 2 bytes per voxel (Int16)

    // Calculate buffer size
    const indexSize = chunks.length * CHUNK_INDEX_ENTRY_SIZE
    let dataSize = 0
    for (const chunk of chunks) {
        if (!chunk.uniform) {
            dataSize += bytesPerChunk
        }
    }

    const totalSize = HEADER_SIZE + indexSize + dataSize
    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)

    self.postMessage({
        type: 'progress',
        current: 0,
        total: chunks.length + 2,
        message: 'Allocating buffer...'
    })

    // Write chunk index and data
    let indexOffset = HEADER_SIZE
    let dataOffset = 0  // Relative to data section start

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        // Write index entry
        const entry = {
            x: chunk.x,
            y: chunk.y,
            z: chunk.z,
            flags: chunk.uniform ? CHUNK_FLAG_UNIFORM : 0,
            fillBlockId: chunk.uniform ? chunk.fillId : 0,
            dataOffset: chunk.uniform ? 0 : dataOffset,
        }
        writeChunkIndex(view, indexOffset, entry)
        indexOffset += CHUNK_INDEX_ENTRY_SIZE

        // Write chunk data if not uniform
        if (!chunk.uniform && chunk.data) {
            const byteOffset = HEADER_SIZE + indexSize + dataOffset
            const targetView = new Uint16Array(buffer, byteOffset, voxelCount)
            targetView.set(chunk.data)
            dataOffset += bytesPerChunk
        }

        // Report progress every 10 chunks
        if (i % 10 === 0) {
            self.postMessage({
                type: 'progress',
                current: i + 1,
                total: chunks.length + 2,
                message: `Packing chunk ${i + 1}/${chunks.length}...`
            })
        }
    }

    // Calculate CRC32 of data section
    self.postMessage({
        type: 'progress',
        current: chunks.length,
        total: chunks.length + 2,
        message: 'Calculating checksum...'
    })

    const dataStart = HEADER_SIZE + indexSize
    const dataSection = new Uint8Array(buffer, dataStart)
    const checksum = crc32(dataSection)

    // Write header
    self.postMessage({
        type: 'progress',
        current: chunks.length + 1,
        total: chunks.length + 2,
        message: 'Writing header...'
    })

    writeHeader(view, {
        version: FORMAT_VERSION,
        flags: 1,  // uniform optimization enabled
        chunkSize: header.chunkSize,
        chunkCount: chunks.length,
        minX: header.minX,
        maxX: header.maxX,
        minY: header.minY,
        maxY: header.maxY,
        minZ: header.minZ,
        maxZ: header.maxZ,
        checksum: checksum,
    })

    // Done
    self.postMessage({
        type: 'progress',
        current: chunks.length + 2,
        total: chunks.length + 2,
        message: 'Complete!'
    })

    // Transfer the buffer back to main thread
    self.postMessage({ type: 'complete', buffer }, [buffer])
}
