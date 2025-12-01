/**
 * World Baker - Development tool for baking procedural worlds to binary files
 *
 * This module is intended to be used only in development and should be
 * tree-shaken out of production builds.
 *
 * Usage:
 * ```js
 * const baker = new WorldBaker({
 *     chunkSize: 32,
 *     generateChunk: (x, y, z, size) => generateChunkBlocks(x, y, z, size),
 *     bounds: { xChunks: [-6, 6], yChunks: [-1, 3], zChunks: [-2, 6] },
 *     onProgress: (current, total, message) => console.log(`${current}/${total}: ${message}`)
 * })
 *
 * const blob = await baker.bake()
 * baker.downloadAsFile(blob, 'world.noaworld')
 * ```
 */

import {
    checkUniform,
    HEADER_SIZE,
    CHUNK_INDEX_ENTRY_SIZE,
    CHUNK_FLAG_UNIFORM,
    FORMAT_VERSION,
    writeHeader,
    writeChunkIndex,
    crc32,
} from './worldFormats.js'

/**
 * @typedef {Object} WorldBakerOptions
 * @property {number} chunkSize - Size of chunks in voxels (e.g. 24 or 32)
 * @property {function(number, number, number, number): (Int16Array|Uint16Array)} generateChunk
 *           - Function that generates chunk data. Receives (chunkX, chunkY, chunkZ, chunkSize)
 *             where X/Y/Z are chunk indices (not world coordinates). Returns voxel array.
 * @property {{xChunks: [number, number], yChunks: [number, number], zChunks: [number, number]}} bounds
 *           - Chunk index bounds to bake. Each is [min, max] inclusive.
 * @property {function(number, number, string): void} [onProgress]
 *           - Optional progress callback (current, total, message)
 */

export class WorldBaker {
    /**
     * @param {WorldBakerOptions} options
     */
    constructor(options) {
        this.chunkSize = options.chunkSize
        this.generateChunk = options.generateChunk
        this.bounds = options.bounds
        this.onProgress = options.onProgress || (() => {})

        if (!this.chunkSize || this.chunkSize <= 0) {
            throw new Error('WorldBaker: chunkSize must be positive')
        }
        if (typeof this.generateChunk !== 'function') {
            throw new Error('WorldBaker: generateChunk must be a function')
        }
        if (!this.bounds) {
            throw new Error('WorldBaker: bounds must be specified')
        }
    }

    /**
     * Calculate total number of chunks that will be baked
     * @returns {number}
     */
    getChunkCount() {
        const { xChunks, yChunks, zChunks } = this.bounds
        const xCount = xChunks[1] - xChunks[0] + 1
        const yCount = yChunks[1] - yChunks[0] + 1
        const zCount = zChunks[1] - zChunks[0] + 1
        return xCount * yCount * zCount
    }

    /**
     * Estimate the maximum file size in bytes
     * @returns {number}
     */
    estimateMaxSize() {
        const count = this.getChunkCount()
        const voxelsPerChunk = this.chunkSize ** 3
        const bytesPerChunk = voxelsPerChunk * 2
        // Header + index + all data (worst case, no uniform chunks)
        return 32 + (count * 12) + (count * bytesPerChunk)
    }

    /**
     * Bake the world to a binary blob
     * @returns {Promise<Blob>}
     */
    async bake() {
        const chunks = await this._generateAllChunks()
        const buffer = await this._serializeChunks(chunks)
        return new Blob([buffer], { type: 'application/octet-stream' })
    }

    /**
     * Generate all chunk data
     * @private
     * @returns {Promise<Array<{x: number, y: number, z: number, data: Uint16Array|null, uniform: boolean, fillId: number}>>}
     */
    async _generateAllChunks() {
        const { xChunks, yChunks, zChunks } = this.bounds
        const totalChunks = this.getChunkCount()
        const chunks = []
        let current = 0

        this.onProgress(0, totalChunks, 'Starting chunk generation...')

        for (let x = xChunks[0]; x <= xChunks[1]; x++) {
            for (let y = yChunks[0]; y <= yChunks[1]; y++) {
                for (let z = zChunks[0]; z <= zChunks[1]; z++) {
                    // Generate chunk data
                    const data = this.generateChunk(x, y, z, this.chunkSize)

                    // Check if uniform
                    const { uniform, fillId } = checkUniform(data)

                    chunks.push({
                        x,
                        y,
                        z,
                        data: uniform ? null : new Uint16Array(data),
                        uniform,
                        fillId,
                    })

                    current++

                    // Report progress
                    if (current % 10 === 0 || current === totalChunks) {
                        this.onProgress(
                            current,
                            totalChunks,
                            `Generated chunk ${current}/${totalChunks} (${x},${y},${z})`
                        )
                    }

                    // Yield to event loop periodically to keep UI responsive
                    if (current % 5 === 0) {
                        await this._yield()
                    }
                }
            }
        }

        return chunks
    }

    /**
     * Serialize chunks to binary format using Web Worker
     * @private
     * @param {Array} chunks
     * @returns {Promise<ArrayBuffer>}
     */
    async _serializeChunks(chunks) {
        const { xChunks, yChunks, zChunks } = this.bounds

        const header = {
            chunkSize: this.chunkSize,
            minX: xChunks[0],
            maxX: xChunks[1],
            minY: yChunks[0],
            maxY: yChunks[1],
            minZ: zChunks[0],
            maxZ: zChunks[1],
        }

        // Try to use Web Worker for serialization
        if (typeof Worker !== 'undefined') {
            try {
                return await this._serializeWithWorker(chunks, header)
            } catch (err) {
                console.warn('WorldBaker: Worker failed, falling back to main thread:', err.message)
            }
        }

        // Fallback to main thread serialization
        return this._serializeOnMainThread(chunks, header)
    }

    /**
     * Serialize using Web Worker
     * @private
     */
    async _serializeWithWorker(chunks, header) {
        return new Promise((resolve, reject) => {
            // Create worker from the worker module
            // Note: This requires bundler support for worker imports
            const workerURL = new URL('./worldBaker.worker.js', import.meta.url)
            const worker = new Worker(workerURL, { type: 'module' })

            worker.onmessage = (e) => {
                const { type, current, total, message, buffer, error } = e.data

                if (type === 'progress') {
                    this.onProgress(current, total, message)
                } else if (type === 'complete') {
                    worker.terminate()
                    resolve(buffer)
                } else if (type === 'error') {
                    worker.terminate()
                    reject(new Error(error))
                }
            }

            worker.onerror = (err) => {
                worker.terminate()
                reject(err)
            }

            // Transfer chunk data arrays to worker
            const transferables = chunks
                .filter(c => c.data)
                .map(c => c.data.buffer)

            worker.postMessage({ type: 'serialize', chunks, header }, transferables)
        })
    }

    /**
     * Fallback serialization on main thread
     * @private
     */
    _serializeOnMainThread(chunks, header) {
        const { chunkSize } = header
        const voxelCount = chunkSize * chunkSize * chunkSize
        const bytesPerChunk = voxelCount * 2

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

        // Write chunk index and data
        let indexOffset = HEADER_SIZE
        let dataOffset = 0

        for (const chunk of chunks) {
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

            if (!chunk.uniform && chunk.data) {
                const byteOffset = HEADER_SIZE + indexSize + dataOffset
                const targetView = new Uint16Array(buffer, byteOffset, voxelCount)
                targetView.set(chunk.data)
                dataOffset += bytesPerChunk
            }
        }

        // Calculate CRC32
        const dataStart = HEADER_SIZE + indexSize
        const dataSection = new Uint8Array(buffer, dataStart)
        const checksum = crc32(dataSection)

        // Write header
        writeHeader(view, {
            version: FORMAT_VERSION,
            flags: 1,
            chunkSize: header.chunkSize,
            chunkCount: chunks.length,
            minX: header.minX,
            maxX: header.maxX,
            minY: header.minY,
            maxY: header.maxY,
            minZ: header.minZ,
            maxZ: header.maxZ,
            checksum,
        })

        return buffer
    }

    /**
     * Yield to event loop
     * @private
     */
    _yield() {
        return new Promise(resolve => {
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(resolve, { timeout: 16 })
            } else {
                setTimeout(resolve, 0)
            }
        })
    }

    /**
     * Download a blob as a file
     * @param {Blob} blob
     * @param {string} filename
     */
    downloadAsFile(blob, filename = 'world.noaworld') {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
}
