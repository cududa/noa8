/**
 * Registry module - block and material registration.
 * @module registry
 */


/** @type {{texturePath: string}} */
var defaults = {
    texturePath: ''
}

/** Maximum block ID (uses full Uint16Array element). */
var MAX_BLOCK_ID = (1 << 16) - 1



/**
 * `noa.registry` - Where you register your voxel types, 
 * materials, properties, and events.
 * 
 * This module uses the following default options (from the options
 * object passed to the {@link Engine}):
 * 
 * ```js
 * var defaults = {
 *     texturePath: ''
 * }
 * ```
*/

export class Registry {


    /** 
     * @internal 
     * @param {import('../index').Engine} noa
    */
    constructor(noa, opts) {
        opts = Object.assign({}, defaults, opts)
        /** @internal */
        this.noa = noa

        /** @internal */
        this._texturePath = opts.texturePath

        /** Maps block face material names to matIDs
         * @type {Object.<string, number>} */
        var matIDs = {}

        // lookup arrays for block props and flags - all keyed by blockID
        // fill in first value for the air block with id=0
        var blockSolidity = [false]
        var blockOpacity = [false]
        var blockIsFluid = [false]
        var blockIsObject = [false]
        var blockProps = [null]     // less-often accessed properties
        var blockMeshes = [null]    // custom mesh objects
        var blockHandlers = [null]  // block event handlers
        var blockIsPlain = [false]  // true if voxel is "boring" - solid/opaque, no special props

        // this one is keyed by `blockID*6 + faceNumber`
        var blockMats = [0, 0, 0, 0, 0, 0]

        // and these are keyed by material id
        var matColorLookup = [null]
        var matAtlasIndexLookup = [-1]

        /**
         * Lookup array of block face material properties - keyed by matID (not blockID)
         * @typedef MatDef
         * @prop {number[]} color
         * @prop {number} alpha
         * @prop {string} texture
         * @prop {boolean} texHasAlpha
         * @prop {number} atlasIndex
         * @prop {*} renderMat
         * @prop {number} flowSpeed
         * @prop {number[]} flowDirection
         * @prop {number} flowPatternLength
         */
        /** @type {MatDef[]} */
        var matDefs = []


        // ============ BLOCK REGISTRATION ============

        /**
         * Register (by integer ID) a block type and its parameters.
         *  `id` param: integer, currently 1..65535. Generally you should 
         * specify sequential values for blocks, without gaps, but this 
         * isn't technically necessary.
         * 
         * @param {number} id - sequential integer ID (from 1)
         * @param {Partial<BlockOptions>} [options] 
         * @returns the `id` value specified
         */
        this.registerBlock = function (id = 1, options = null) {
            var defaults = new BlockOptions(options && options.fluid)
            var opts = Object.assign({}, defaults, options || {})

            // console.log('register block: ', id, opts)
            if (id < 1 || id > MAX_BLOCK_ID) throw 'Block id out of range: ' + id

            // if block ID is greater than current highest ID, 
            // register fake blocks to avoid holes in lookup arrays
            while (id > blockSolidity.length) {
                this.registerBlock(blockSolidity.length, {})
            }

            // flags default to solid, opaque, nonfluid
            blockSolidity[id] = !!opts.solid
            blockOpacity[id] = !!opts.opaque
            blockIsFluid[id] = !!opts.fluid

            // store any custom mesh
            blockIsObject[id] = !!opts.blockMesh
            blockMeshes[id] = opts.blockMesh || null

            // parse out material parameter
            // always store 6 material IDs per blockID, so material lookup is monomorphic
            var mat = opts.material || null
            var mats
            if (!mat) {
                mats = [null, null, null, null, null, null]
            } else if (typeof mat == 'string') {
                mats = [mat, mat, mat, mat, mat, mat]
            } else if (mat.length && mat.length == 2) {
                // interpret as [top/bottom, sides]
                mats = [mat[1], mat[1], mat[0], mat[0], mat[1], mat[1]]
            } else if (mat.length && mat.length == 3) {
                // interpret as [top, bottom, sides]
                mats = [mat[2], mat[2], mat[0], mat[1], mat[2], mat[2]]
            } else if (mat.length && mat.length == 6) {
                // interpret as [+x, -x, +y, -y, +z, -z]
                mats = mat
            } else throw 'Invalid material parameter: ' + mat

            // argument is material name, but store as material id, allocating one if needed
            for (var i = 0; i < 6; ++i) {
                blockMats[id * 6 + i] = getMaterialId(this, matIDs, mats[i], true)
            }

            // props data object - currently only used for fluid properties
            blockProps[id] = {}

            // if block is fluid, initialize properties if needed
            if (blockIsFluid[id]) {
                blockProps[id].fluidDensity = opts.fluidDensity
                blockProps[id].viscosity = opts.viscosity
            }

            // event callbacks
            var hasHandler = opts.onLoad || opts.onUnload || opts.onSet || opts.onUnset || opts.onCustomMeshCreate
            blockHandlers[id] = (hasHandler) ? new BlockCallbackHolder(opts) : null

            // special lookup for "plain"-ness
            // plain means solid, opaque, not fluid, no mesh or events
            var isPlain = blockSolidity[id] && blockOpacity[id]
                && !hasHandler && !blockIsFluid[id] && !blockIsObject[id]
            blockIsPlain[id] = isPlain

            return id
        }




        /**
         * Register (by name) a material and its parameters.
         * 
         * @param {string} name of this material
         * @param {Partial<MaterialOptions>} [options]
         */

        this.registerMaterial = function (name = '?', options = null) {
            // catch calls to earlier signature
            if (Array.isArray(options)) {
                throw 'This API changed signatures in v0.33, please use: `noa.registry.registerMaterial("name", optionsObj)`'
            }

            var opts = Object.assign(new MaterialOptions(), options || {})
            var matID = matIDs[name] || matDefs.length
            matIDs[name] = matID

            var texURL = opts.textureURL ? this._texturePath + opts.textureURL : ''
            var alpha = 1.0
            var color = opts.color || [1.0, 1.0, 1.0]
            if (color.length === 4) alpha = color.pop()
            if (texURL) color = null

            // populate lookup arrays for terrain meshing
            matColorLookup[matID] = color
            matAtlasIndexLookup[matID] = opts.atlasIndex

            matDefs[matID] = {
                color,
                alpha,
                texture: texURL,
                texHasAlpha: !!opts.texHasAlpha,
                atlasIndex: opts.atlasIndex,
                renderMat: opts.renderMaterial,
                flowSpeed: opts.flowSpeed || 0,
                flowDirection: opts.flowDirection || [1, 0, 0],
                flowPatternLength: opts.flowPatternLength || 10,
            }
            return matID
        }


        // ============ BLOCK ACCESSORS ============

        /**
         * Block solidity (for physics purposes).
         * @param {number} id
         * @returns {boolean}
         */
        this.getBlockSolidity = function (id) {
            return blockSolidity[id]
        }

        /**
         * Block opacity - whether it fully obscures the voxel (like dirt)
         * or can be partially seen through (like a fencepost).
         * @param {number} id
         * @returns {boolean}
         */
        this.getBlockOpacity = function (id) {
            return blockOpacity[id]
        }

        /**
         * Whether the block is a fluid.
         * @param {number} id
         * @returns {boolean}
         */
        this.getBlockFluidity = function (id) {
            return blockIsFluid[id]
        }

        /**
         * Get block property object passed in at registration.
         * @param {number} id
         * @returns {object|null|undefined}
         */
        this.getBlockProps = function (id) {
            return blockProps[id]
        }

        /**
         * Look up a block ID's face material.
         * @param {number} blockId
         * @param {number} dir - Face direction 0..5: [+x, -x, +y, -y, +z, -z]
         * @returns {number} Material ID
         */
        this.getBlockFaceMaterial = function (blockId, dir) {
            return blockMats[blockId * 6 + dir]
        }


        /**
         * General lookup for all properties of a block material
         * @param {number} matID 
         * @returns {MatDef|undefined}
         */
        this.getMaterialData = function (matID) {
            return matDefs[matID]
        }


        /**
         * Given a texture URL, check if any material using that texture needs alpha.
         * @internal
         * @param {string} tex
         * @returns {boolean}
         */
        this._textureNeedsAlpha = function (tex = '') {
            return matDefs.some(def => {
                if (def.texture !== tex) return false
                return def.texHasAlpha
            })
        }


        // ============ INTERNAL LOOKUP ARRAYS ============
        /** @internal */
        this._solidityLookup = blockSolidity
        /** @internal */
        this._opacityLookup = blockOpacity
        /** @internal */
        this._fluidityLookup = blockIsFluid
        /** @internal */
        this._objectLookup = blockIsObject
        /** @internal */
        this._blockMeshLookup = blockMeshes
        /** @internal */
        this._blockHandlerLookup = blockHandlers
        /** @internal */
        this._blockIsPlainLookup = blockIsPlain
        /** @internal */
        this._materialColorLookup = matColorLookup
        /** @internal */
        this._matAtlasIndexLookup = matAtlasIndexLookup


        // ============ DEFAULT INITIALIZATION ============
        // Add a default material and block ID=1. Safe since registering
        // new block data overwrites the old.
        this.registerMaterial('dirt', { color: [0.4, 0.3, 0] })
        this.registerBlock(1, { material: 'dirt' })

    }

}


// ============ HELPERS ============

/**
 * Look up material ID given its name.
 * If lazyInit is set, pre-register the name and return an ID.
 * @param {Registry} reg
 * @param {Object.<string, number>} matIDs
 * @param {string} name
 * @param {boolean} lazyInit
 * @returns {number}
 */
function getMaterialId(reg, matIDs, name, lazyInit) {
    if (!name) return 0
    var id = matIDs[name]
    if (id === undefined && lazyInit) id = reg.registerMaterial(name)
    return id
}



/**
 * Data class for holding block callback references.
 * @internal
 */
class BlockCallbackHolder {
    /**
     * @param {BlockOptions} opts
     */
    constructor(opts) {
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onLoad = opts.onLoad || null
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnload = opts.onUnload || null
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onSet = opts.onSet || null
        /** @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnset = opts.onUnset || null
        /** @type {((mesh:TransformNode, x:number, y:number, z:number) => void)|null} */
        this.onCustomMeshCreate = opts.onCustomMeshCreate || null
    }
}




/**
 * Default options when registering a block type.
 */
class BlockOptions {
    /**
     * @param {boolean} [isFluid=false]
     */
    constructor(isFluid = false) {
        /** Solidity for physics purposes.
         * @type {boolean} */
        this.solid = (isFluid) ? false : true

        /** Whether the block fully obscures neighboring blocks.
         * @type {boolean} */
        this.opaque = (isFluid) ? false : true

        /** Whether a nonsolid block is a fluid (buoyant, viscous..).
         * @type {boolean} */
        this.fluid = false

        /**
         * The block material(s) for this voxel's faces. May be:
         *   - one (String) material name
         *   - array of 2 names: [top/bottom, sides]
         *   - array of 3 names: [top, bottom, sides]
         *   - array of 6 names: [+x, -x, +y, -y, +z, -z]
         * @type {string|string[]|null}
         */
        this.material = null

        /** Specifies a custom mesh for this voxel, instead of terrain.
         * @type {*} */
        this.blockMesh = null

        /** Fluid density parameter for fluid blocks.
         * @type {number} */
        this.fluidDensity = 1.0

        /** Viscosity parameter for fluid blocks.
         * @type {number} */
        this.viscosity = 0.5

        /** Callback when block's chunk is loaded.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onLoad = null

        /** Callback when block's chunk is unloaded.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnload = null

        /** Callback when block is set/placed.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onSet = null

        /** Callback when block is unset/removed.
         * @type {((x:number, y:number, z:number) => void)|null} */
        this.onUnset = null

        /** Callback when custom mesh is created for this block.
         * @type {((mesh:TransformNode, x:number, y:number, z:number) => void)|null} */
        this.onCustomMeshCreate = null
    }
}

/** @typedef {import('@babylonjs/core').TransformNode} TransformNode */


/**
 * Default options when registering a block material.
 */
class MaterialOptions {
    constructor() {
        /**
         * An array of 0..1 floats, either [R,G,B] or [R,G,B,A].
         * @type {number[]|null}
         */
        this.color = null

        /**
         * Filename of texture image, if any.
         * @type {string|null}
         */
        this.textureURL = null

        /**
         * Whether the texture image has alpha.
         * @type {boolean}
         */
        this.texHasAlpha = false

        /**
         * Index into a (vertical strip) texture atlas, if applicable.
         * @type {number}
         */
        this.atlasIndex = -1

        /**
         * An optional Babylon.js `Material`. If specified, terrain for this voxel
         * will be rendered with the supplied material (this can impact performance).
         * @type {*}
         */
        this.renderMaterial = null

        /**
         * Flow/conveyor animation speed in blocks per second.
         * If > 0, the material will animate smoothly. Default is 0 (no animation).
         * @type {number}
         */
        this.flowSpeed = 0

        /**
         * Flow/conveyor animation direction as [x, y, z]. Only used if flowSpeed > 0.
         * Example: [1, 0, 0] flows in +X direction, [0, 0, -1] flows in -Z direction.
         * @type {number[]}
         */
        this.flowDirection = [1, 0, 0]

        /**
         * Pattern length in blocks for repeating flow animations.
         * The vertex offset will wrap every N blocks. Default is 10.
         * Set this to match your prebaked texture/block pattern length for seamless wrapping.
         * @type {number}
         */
        this.flowPatternLength = 10
    }
}
