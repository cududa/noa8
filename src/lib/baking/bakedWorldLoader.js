/**
 * Lightweight loader for pre-baked .noaworld files
 *
 * This module is designed to be small and have no dependencies on
 * procedural generation code, enabling tree-shaking in production builds.
 */

import ndarray from 'ndarray'
import {
    HEADER_SIZE,
    CHUNK_INDEX_ENTRY_SIZE,
    CHUNK_FLAG_UNIFORM,
    parseHeader,
    parseChunkIndex,
    validateMagic,
    validateVersion,
    chunkKey,
    crc32,
} from './worldFormats.js'

/**
 * Loader for pre-baked world data files
 */
/** @type {number} Default max entries in chunk cache */
const DEFAULT_CACHE_SIZE = 64

export class BakedWorldLoader {
    /**
     * @param {{cacheSize?: number}} [options]
     */
    constructor(options = {}) {
        /** @private */
        this._buffer = null
        /** @private */
        this._view = null
        /** @private */
        this._header = null
        /** @private @type {Map<string, import('./worldFormats.js').ChunkIndexEntry>} */
        this._chunkIndex = new Map()
        /** @private */
        this._dataOffset = 0
        /** @private @type {Map<string, Uint16Array>} LRU cache for chunk data */
        this._chunkCache = new Map()
        /** @private */
        this._cacheSize = options.cacheSize ?? DEFAULT_CACHE_SIZE
    }

    /**
     * Load baked world from a URL
     * @param {string} url - URL to the .noaworld file
     * @returns {Promise<BakedWorldLoader>} - Returns this for chaining
     */
    async loadFromURL(url) {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to load baked world: ${response.status} ${response.statusText}`)
        }
        const buffer = await response.arrayBuffer()
        return this.loadFromBuffer(buffer)
    }

    /**
     * Load baked world from an ArrayBuffer
     * @param {ArrayBuffer} buffer
     * @returns {BakedWorldLoader} - Returns this for chaining
     */
    loadFromBuffer(buffer) {
        this._buffer = buffer
        this._view = new DataView(buffer)

        // Parse and validate header
        this._header = parseHeader(this._view)

        if (!validateMagic(this._header.magic)) {
            throw new Error('Invalid baked world file: bad magic bytes')
        }
        if (!validateVersion(this._header.version)) {
            throw new Error(`Unsupported baked world format version: ${this._header.version}`)
        }

        // Build chunk index lookup
        this._buildChunkIndex()

        // Validate CRC32 checksum
        this._validateChecksum()

        return this
    }

    /** @private */
    _buildChunkIndex() {
        const { chunkCount } = this._header
        let offset = HEADER_SIZE

        for (let i = 0; i < chunkCount; i++) {
            const entry = parseChunkIndex(this._view, offset)
            const key = chunkKey(entry.x, entry.y, entry.z)
            this._chunkIndex.set(key, entry)
            offset += CHUNK_INDEX_ENTRY_SIZE
        }

        // Data section starts after all index entries
        this._dataOffset = offset
    }

    /** @private */
    _validateChecksum() {
        // Calculate CRC32 of chunk data section
        const dataStart = this._dataOffset
        const dataSection = new Uint8Array(this._buffer, dataStart)
        const calculated = crc32(dataSection)

        if (calculated !== this._header.checksum) {
            throw new Error(
                `Baked world file corrupted: checksum mismatch ` +
                `(expected ${this._header.checksum}, got ${calculated})`
            )
        }
    }

    /**
     * Get world bounds information
     * @returns {{minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, chunkSize: number}}
     */
    getWorldBounds() {
        if (!this._header) {
            throw new Error('No baked world loaded')
        }
        return {
            minX: this._header.minX,
            maxX: this._header.maxX,
            minY: this._header.minY,
            maxY: this._header.maxY,
            minZ: this._header.minZ,
            maxZ: this._header.maxZ,
            chunkSize: this._header.chunkSize,
        }
    }

    /**
     * Get the chunk size of the baked world
     * @returns {number}
     */
    getChunkSize() {
        if (!this._header) {
            throw new Error('No baked world loaded')
        }
        return this._header.chunkSize
    }

    /**
     * Check if a specific chunk exists in the baked data
     * @param {number} x - Chunk X index
     * @param {number} y - Chunk Y index
     * @param {number} z - Chunk Z index
     * @returns {boolean}
     */
    hasChunk(x, y, z) {
        return this._chunkIndex.has(chunkKey(x, y, z))
    }

    /**
     * Get raw voxel data for a chunk (cached)
     * @param {number} x - Chunk X index
     * @param {number} y - Chunk Y index
     * @param {number} z - Chunk Z index
     * @returns {Uint16Array|null} - Voxel data or null if chunk doesn't exist
     */
    getChunk(x, y, z) {
        const key = chunkKey(x, y, z)
        const entry = this._chunkIndex.get(key)
        if (!entry) return null

        // Check cache first
        if (this._chunkCache.has(key)) {
            const cached = this._chunkCache.get(key)
            // Move to end for LRU (delete and re-add)
            this._chunkCache.delete(key)
            this._chunkCache.set(key, cached)
            return cached
        }

        const chunkSize = this._header.chunkSize
        const voxelCount = chunkSize * chunkSize * chunkSize
        let arr

        if (entry.flags & CHUNK_FLAG_UNIFORM) {
            // Uniform chunk - create array filled with the fill block ID
            arr = new Uint16Array(voxelCount)
            arr.fill(entry.fillBlockId)
        } else {
            // Non-uniform chunk - read from data section
            // If buffer was released, we can't load this chunk
            if (!this._buffer) {
                console.warn(`[BakedWorldLoader] Buffer released, cannot load chunk (${x},${y},${z})`)
                return null
            }
            // Create a copy to avoid issues with the underlying buffer
            const byteOffset = this._dataOffset + entry.dataOffset
            const sourceView = new Uint16Array(this._buffer, byteOffset, voxelCount)
            arr = new Uint16Array(voxelCount)
            arr.set(sourceView)
        }

        // Add to cache with LRU eviction
        if (this._cacheSize > 0) {
            if (this._chunkCache.size >= this._cacheSize) {
                // Evict oldest (first) entry
                const oldestKey = this._chunkCache.keys().next().value
                this._chunkCache.delete(oldestKey)
            }
            this._chunkCache.set(key, arr)
        }

        return arr
    }

    /**
     * Get chunk data wrapped in an ndarray (for direct use with noa)
     * @param {number} x - Chunk X index
     * @param {number} y - Chunk Y index
     * @param {number} z - Chunk Z index
     * @returns {import('ndarray').NdArray|null}
     */
    getChunkAsNdarray(x, y, z) {
        const data = this.getChunk(x, y, z)
        if (!data) return null
        const size = this._header.chunkSize
        return ndarray(data, [size, size, size])
    }

    /**
     * Create a chunk generator function compatible with noa.world.registerChunkGenerator()
     *
     * @returns {function(number, number, number, number, AbortSignal): Promise<{voxelData: *}|null>}
     */
    createChunkGenerator() {
        const loader = this
        const chunkSize = this._header.chunkSize

        return async (x, y, z, size, signal) => {
            // Check for abort
            if (signal && signal.aborted) return null

            // Convert world coords to chunk indices
            const ci = Math.floor(x / chunkSize)
            const cj = Math.floor(y / chunkSize)
            const ck = Math.floor(z / chunkSize)

            // Get chunk data
            const voxelData = loader.getChunkAsNdarray(ci, cj, ck)
            if (!voxelData) {
                // Chunk not in baked data - return null to fall through
                // to any registered worldDataNeeded handler
                return null
            }

            return { voxelData }
        }
    }

    /**
     * Pre-extract all chunks into cache and release the raw ArrayBuffer.
     * Call this after initial world loading is complete.
     *
     * Note: This doesn't necessarily reduce total memory - it trades the packed
     * buffer for individual Uint16Array chunks in cache. The benefit is releasing
     * the contiguous buffer allocation and allowing individual chunk GC if needed.
     *
     * After calling this, chunks are served from cache only - chunks not in cache
     * cannot be loaded (getChunk returns null with a warning).
     *
     * @returns {number} Number of chunks that were extracted (not already in cache)
     */
    releaseBuffer() {
        if (!this._buffer) return 0

        // Count non-uniform chunks that need to be cached
        let nonUniformCount = 0
        for (const entry of this._chunkIndex.values()) {
            if (!(entry.flags & CHUNK_FLAG_UNIFORM)) {
                nonUniformCount++
            }
        }

        // Expand cache to hold ALL non-uniform chunks before extraction
        // This prevents LRU eviction from losing chunks before buffer is released
        if (nonUniformCount > this._cacheSize) {
            console.log(`[BakedWorldLoader] Expanding cache from ${this._cacheSize} to ${nonUniformCount} to hold all chunks`)
            this._cacheSize = nonUniformCount
        }

        // Extract all non-uniform chunks into cache (uniform chunks don't need the buffer)
        let extracted = 0
        for (const [key, entry] of this._chunkIndex.entries()) {
            if (!(entry.flags & CHUNK_FLAG_UNIFORM) && !this._chunkCache.has(key)) {
                // Force load into cache
                this.getChunk(entry.x, entry.y, entry.z)
                extracted++
            }
        }

        // Now release the buffer - chunks are served from cache
        const freedBytes = this._buffer.byteLength
        this._buffer = null
        this._view = null
        this._dataOffset = 0

        console.log(`[BakedWorldLoader] Released buffer (${(freedBytes / 1024 / 1024).toFixed(1)}MB), ${this._chunkCache.size} chunks in cache`)
        return extracted
    }

    /**
     * Dispose of loaded data and free memory
     * Call this when you're done with the loader or before loading a new world
     */
    dispose() {
        this._buffer = null
        this._view = null
        this._header = null
        this._chunkIndex.clear()
        this._chunkCache.clear()
        this._dataOffset = 0
    }

    /**
     * Get statistics about the loaded world
     * @returns {{totalChunks: number, uniformChunks: number, dataChunks: number, estimatedBytes: number}}
     */
    getStats() {
        if (!this._header) {
            throw new Error('No baked world loaded')
        }

        let uniformCount = 0
        let dataCount = 0

        for (const entry of this._chunkIndex.values()) {
            if (entry.flags & CHUNK_FLAG_UNIFORM) {
                uniformCount++
            } else {
                dataCount++
            }
        }

        const chunkSize = this._header.chunkSize
        const voxelCount = chunkSize * chunkSize * chunkSize
        const bytesPerChunk = voxelCount * 2

        return {
            totalChunks: this._header.chunkCount,
            uniformChunks: uniformCount,
            dataChunks: dataCount,
            estimatedBytes: HEADER_SIZE +
                (this._header.chunkCount * CHUNK_INDEX_ENTRY_SIZE) +
                (dataCount * bytesPerChunk),
        }
    }
}
