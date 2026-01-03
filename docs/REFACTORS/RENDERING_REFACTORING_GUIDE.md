# Rendering.js Refactoring Guide

## Executive Summary

This document provides a comprehensive guide for refactoring `src/lib/rendering.js` (~1400 lines) into 8 focused modules while maintaining **zero breaking changes** to the public API.

### Why Refactor?
- **Current state**: Single 1416-line file with 7 distinct logical domains
- **Goal**: Split into focused modules of ~100-180 lines each
- **Benefits**: Improved maintainability, testability, and code organization
- **Guarantee**: All existing `noa.rendering.*` calls continue to work unchanged

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Dependency Map](#2-dependency-map)
3. [Proposed Architecture](#3-proposed-architecture)
4. [Migration Guide](#4-migration-guide)
5. [Facade Class Template](#5-facade-class-template)
6. [Verification Checklist](#6-verification-checklist)
7. [Appendix: Code Transformations](#7-appendix-code-transformations)

---

## 1. Current Architecture Analysis

### File Location
`src/lib/rendering.js` - 1416 lines

### Logical Domains

| Domain | Lines | Line Range | Description |
|--------|-------|------------|-------------|
| **Imports & Setup** | ~60 | 1-58 | Babylon imports, defaults, Babylon 8 shim |
| **Class & Constructor** | ~180 | 87-264 | Rendering class, _initScene, sceneReady system |
| **Scene & Lighting** | ~100 | 273-370 | getScene, light management, tick cleanup |
| **Render Loop** | ~100 | 376-473 | render, postRender, resize, dispose |
| **Mesh Management** | ~100 | 475-627 | addMeshToScene, removeMesh, setMeshVisibility |
| **Materials** | ~140 | 635-775 | makeStandardMaterial, createStandard/Shader |
| **Model Loading** | ~150 | 777-932 | loadModel async, PBR conversion |
| **Coordinate Conversion** | ~140 | 935-1090 | worldToLocal, localToWorld, _rebaseOrigin |
| **Picking & Utils** | ~50 | 475-524 | pickTerrain*, highlightBlockFace |
| **Internal Helpers** | ~180 | 1107-1270 | camera update, highlight mesh, extractPBRColor |
| **Debug** | ~100 | 1280-1370 | debug_SceneCheck, debug_MeshCount |
| **FPS Display** | ~40 | 1375-1415 | setUpFPS, fps_hook |

### Public API (29 methods)

```javascript
// Scene Access
getScene()                                    // Returns Babylon Scene
isSceneReady()                               // Returns boolean
onSceneReady(callback)                       // Register callback

// Lighting
setMainLightOptions(opts)                    // Configure main light
excludeMeshFromMainLight(mesh, descendants)  // Exclude from light
includeMeshInMainLight(mesh, descendants)    // Re-include in light
createLight(type, name)                      // Create new light

// Lifecycle
tick(dt)                                     // @internal - per-tick
render()                                     // @internal - render frame
postRender()                                 // @internal - post-frame
resize()                                     // @internal - handle resize
dispose()                                    // Cleanup all resources

// Mesh Management
addMeshToScene(mesh, isStatic, pos, chunk)  // Register mesh
removeMeshFromScene(mesh)                    // Unregister mesh
setMeshVisibility(mesh, visible)            // Toggle visibility

// Terrain Picking
pickTerrainFromCamera(distance)              // Raycast from camera
pickTerrainWithRay(origin, dir, dist, local) // Custom raycast

// Block Highlight
highlightBlockFace(show, posArr, normArr)   // @internal - show highlight

// Materials
makeStandardMaterial(name)                   // Basic StandardMaterial
createStandardMaterial(name, options)        // Configurable StandardMaterial
createShaderMaterial(name, vs, fs, opts)    // ShaderMaterial from GLSL

// Model Loading
loadModel(url, options)                      // Async GLB/glTF loader

// Coordinate Conversion
worldToLocal(x, y, z)                        // World to local coords
worldToLocalCached(x, y, z, out)            // Cached version
localToWorld(x, y, z)                        // Local to world coords
localToWorldCached(x, y, z, out)            // Cached version
setMeshWorldPosition(mesh, x, y, z)         // Set mesh position
getMeshWorldPosition(mesh)                   // Get mesh position
getMeshWorldPositionCached(mesh, out)       // Cached version
getWorldOriginOffset()                       // Get origin offset
getWorldOriginOffsetCached(out)             // Cached version
updateShaderWorldOrigin(mat, uniformName)   // Update shader uniform

// Chunk Lifecycle
prepareChunkForRendering(chunk)             // @internal - stub
disposeChunkForRendering(chunk)             // @internal - stub

// Internal
_rebaseOrigin(delta)                         // @internal - origin shift

// Debug
debug_SceneCheck()                           // @internal - validate scene
debug_MeshCount()                            // @internal - count meshes
```

### Public Properties

```javascript
// Core Babylon Objects (readable)
engine          // Babylon.js Engine
scene           // Babylon.js Scene
camera          // Babylon.js FreeCamera
light           // Babylon.js DirectionalLight
sceneReady      // Promise<void>

// Configuration
renderOnResize  // boolean - redraw on resize while paused

// Internal (but externally accessed!)
useAO           // boolean - ambient occlusion enabled
aoVals          // [float, float, float] - AO multipliers
revAoVal        // float - reverse AO value

// Getters
meshBuilder     // MeshBuilder (getter)
_octreeManager  // SceneOctreeManager (internal)
```

### Deprecated Properties (from index.js:854-877)

```javascript
noa.rendering.zoomDistance          // use noa.camera.zoomDistance
noa.rendering._currentZoom          // use noa.camera.currentZoom
noa.rendering._cameraZoomSpeed      // use noa.camera.zoomSpeed
noa.rendering.getCameraVector       // use noa.camera.getDirection
noa.rendering.getCameraPosition     // use noa.camera.getLocalPosition
noa.rendering.getCameraRotation     // use noa.camera.heading/pitch
noa.rendering.setCameraRotation     // see noa.camera docs
noa.rendering.makeMeshInstance      // use mesh.createInstance
noa.rendering.postMaterialCreationHook // removed
```

---

## 2. Dependency Map

### Consumer Files (13 total)

#### src/index.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `new Rendering(this, opts, canvas)` | 235 | HIGH |
| `rendering.tick(dt)` | 447, 453 | LOW |
| `rendering.render()` | 513 | LOW |
| `rendering.postRender()` | 514 | LOW |
| `rendering.highlightBlockFace()` | 311, 313 | LOW |
| `rendering._rebaseOrigin(delta)` | 793 | MEDIUM |
| `rendering.dispose()` | 590-591 | LOW |
| `rendering.scene` | 387, 393 | LOW |

#### src/lib/text.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.onSceneReady()` | 128 | LOW |
| `noa.rendering.getScene()` | 155, 181, 531 | LOW |
| `noa.rendering.addMeshToScene()` | 395 | LOW |
| `noa.rendering.removeMeshFromScene()` | 641 | LOW |

#### src/lib/textShadow.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.getScene()` | 70 | LOW |
| `noa.rendering.makeStandardMaterial()` | 80 | LOW |
| `noa.rendering.setMeshVisibility()` | 109 | LOW |
| `noa.rendering.addMeshToScene()` | 209 | LOW |
| `noa.rendering.removeMeshFromScene()` | 327, 365 | LOW |

#### src/lib/textLighting.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.onSceneReady()` | 102 | LOW |
| `noa.rendering.getScene()` | 111, 504, 524 | LOW |
| `noa.rendering.includeMeshInMainLight()` | 351, 493, 563 | LOW |
| `noa.rendering.excludeMeshFromMainLight()` | 462 | LOW |

#### src/lib/terrainMesher.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.addMeshToScene()` | 93 | LOW |
| `noa.rendering.getScene()` | 617 | LOW |
| **`noa.rendering.useAO`** | 372, 462, 619 | **HIGH** |
| **`noa.rendering.aoVals`** | 373, 620 | **HIGH** |
| **`noa.rendering.revAoVal`** | 373, 621 | **HIGH** |

#### src/lib/terrainMaterials.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.makeStandardMaterial()` | 20, 144, 159 | LOW |
| `noa.rendering.getScene()` | 158 | LOW |

#### src/lib/objectMesher.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| **`noa.rendering.scene`** | 31 | **HIGH** |
| `noa.rendering.addMeshToScene()` | 222 | LOW |
| `noa.rendering.setMeshVisibility()` | 236 | LOW |

#### src/lib/world.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.prepareChunkForRendering()` | 1120 | LOW |
| `noa.rendering.disposeChunkForRendering()` | 1154 | LOW |

#### src/lib/container.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.resize()` | 97 | LOW |

#### src/components/shadow.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.getScene()` | 12 | LOW |
| `noa.rendering.makeStandardMaterial()` | 15 | LOW |
| `noa.rendering.setMeshVisibility()` | 32 | LOW |
| `noa.rendering.addMeshToScene()` | 53 | LOW |

#### src/components/mesh.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.addMeshToScene()` | 22 | LOW |

#### src/components/fadeOnZoom.js
| Method/Property | Line(s) | Risk |
|-----------------|---------|------|
| `noa.rendering.setMeshVisibility()` | 37 | LOW |

### Critical Breaking Change Risks

These properties are accessed **directly** on `noa.rendering` and MUST remain as direct properties or getters on the facade:

```javascript
// terrainMesher.js:372-373
var doAO = noa.rendering.useAO
var skipRevAo = (noa.rendering.revAoVal === noa.rendering.aoVals[0])

// objectMesher.js:31
this.rootNode = new TransformNode('objectMeshRoot', noa.rendering.scene)
```

---

## 3. Proposed Architecture

### New File Structure

```
src/lib/
├── rendering.js           (~180 lines) - Facade class
├── renderingCore.js       (~120 lines) - Engine/Scene init
├── renderingLighting.js   (~100 lines) - Light management
├── renderingMeshes.js     (~150 lines) - Mesh operations
├── renderingMaterials.js  (~140 lines) - Material factories
├── renderingModels.js     (~160 lines) - Model loading
├── renderingCoords.js     (~140 lines) - Coordinate system
├── renderingCamera.js     (~100 lines) - Camera updates
├── renderingUtils.js      (~120 lines) - Picking, highlight, debug
└── sceneOctreeManager.js  (unchanged)
```

### Module Responsibilities

#### renderingCore.js
- Engine and Scene creation
- Camera and camera holder setup
- Scene readiness Promise and polling
- SceneOctreeManager instantiation
- dispose() logic for core objects

#### renderingLighting.js
- Main directional light creation
- `setMainLightOptions()`
- `excludeMeshFromMainLight()` / `includeMeshInMainLight()`
- `createLight()`
- tick() cleanup for disposed meshes

#### renderingMeshes.js
- `addMeshToScene()` with boundingInfo validation
- `removeMeshFromScene()`
- `setMeshVisibility()`
- Metadata flag management (`noa_added_to_scene`)

#### renderingMaterials.js
- `makeStandardMaterial()`
- `createStandardMaterial()`
- `createShaderMaterial()`
- `meshBuilder` getter
- `toColor3()` helper

#### renderingModels.js
- `loadModel()` async function
- `extractPBRColor()` helper
- Material conversion logic
- Resource disposal helpers

#### renderingCoords.js
- `worldToLocal()` / `localToWorld()`
- Cached variants
- Mesh position helpers
- `getWorldOriginOffset()`
- `updateShaderWorldOrigin()`
- `_rebaseOrigin()` internal

#### renderingCamera.js
- `updateCameraForRender()` (moved from module-level)
- `checkCameraEffect()` (water overlay)
- Camera screen plane setup
- Camera screen material management

#### renderingUtils.js
- `pickTerrainFromCamera()` / `pickTerrainWithRay()`
- `highlightBlockFace()` / `getHighlightMesh()`
- `debug_SceneCheck()` / `debug_MeshCount()`
- `setUpFPS()` / `fps_hook`
- `profile_hook`

### State Ownership

| Property | Owner | Facade Access |
|----------|-------|---------------|
| `engine` | RenderingCore | Getter |
| `scene` | RenderingCore | Getter |
| `camera` | RenderingCore | Getter |
| `sceneReady` | RenderingCore | Getter |
| `_octreeManager` | RenderingCore | Getter |
| `light` | RenderingLighting | Getter |
| `useAO` | **Rendering (facade)** | Direct property |
| `aoVals` | **Rendering (facade)** | Direct property |
| `revAoVal` | **Rendering (facade)** | Direct property |
| `renderOnResize` | **Rendering (facade)** | Direct property |
| `meshingCutoffTime` | **Rendering (facade)** | Direct property |

---

## 4. Migration Guide

### Phase 1: Extract Utilities (LOW RISK)

#### Step 1.1: Create renderingUtils.js

**File: src/lib/renderingUtils.js**

```javascript
import * as glvec3 from 'gl-vec3'
import { makeProfileHook } from './util'
import { CreatePlane, CreateLines, Vector3, Color3, Ray } from './babylonExports.js'

// Profiling
var PROFILE = 0
export var profile_hook = (PROFILE) ? makeProfileHook(200, 'render internals') : () => { }

// FPS display
export var fps_hook = function () { }

export function setUpFPS() {
    var div = document.createElement('div')
    div.id = 'noa_fps'
    div.style.position = 'absolute'
    div.style.top = '0'
    div.style.right = '0'
    div.style.zIndex = '0'
    div.style.color = 'white'
    div.style.backgroundColor = 'rgba(0,0,0,0.5)'
    div.style.font = '14px monospace'
    div.style.textAlign = 'center'
    div.style.minWidth = '2em'
    div.style.margin = '4px'
    document.body.appendChild(div)
    var every = 1000
    var ct = 0
    var longest = 0
    var start = performance.now()
    var last = start
    fps_hook = function () {
        ct++
        var nt = performance.now()
        if (nt - last > longest) longest = nt - last
        last = nt
        if (nt - start < every) return
        var fps = Math.round(ct / (nt - start) * 1000)
        var min = Math.round(1 / longest * 1000)
        div.innerHTML = fps + '<br>' + min
        ct = 0
        longest = 0
        start = nt
    }
}

// Highlight mesh cache
var hlpos = []

export class RenderingUtils {
    constructor(rendering) {
        this.rendering = rendering
        this._highlightMesh = null

        // Picking
        this._pickOriginVec = new Vector3(0, 0, 0)
        this._pickDirectionVec = new Vector3(0, 0, 1)
        this._pickRay = new Ray(this._pickOriginVec, this._pickDirectionVec, 1)
        this._terrainPickPredicate = (mesh) => mesh.metadata && mesh.metadata.noa_chunk_terrain_mesh
    }

    highlightBlockFace(show, posArr, normArr) {
        var m = this._getHighlightMesh()
        if (show) {
            var noa = this.rendering.noa
            noa.globalToLocal(posArr, null, hlpos)
            var dist = glvec3.dist(noa.camera._localGetPosition(), hlpos)
            var slop = 0.001 + 0.001 * dist
            for (var i = 0; i < 3; i++) {
                if (normArr[i] === 0) {
                    hlpos[i] += 0.5
                } else {
                    hlpos[i] += (normArr[i] > 0) ? 1 + slop : -slop
                }
            }
            m.position.copyFromFloats(hlpos[0], hlpos[1], hlpos[2])
            m.rotation.x = (normArr[1]) ? Math.PI / 2 : 0
            m.rotation.y = (normArr[0]) ? Math.PI / 2 : 0
        }
        m.setEnabled(show)
    }

    _getHighlightMesh() {
        if (!this._highlightMesh) {
            var rendering = this.rendering
            var mesh = CreatePlane("highlight", { size: 1.0 }, rendering.scene)
            var hlm = rendering.makeStandardMaterial('block_highlight_mat')
            hlm.backFaceCulling = false
            hlm.emissiveColor = new Color3(1, 1, 1)
            hlm.alpha = 0.2
            hlm.freeze()
            mesh.material = hlm

            var s = 0.5
            var lines = CreateLines("hightlightLines", {
                points: [
                    new Vector3(s, s, 0),
                    new Vector3(s, -s, 0),
                    new Vector3(-s, -s, 0),
                    new Vector3(-s, s, 0),
                    new Vector3(s, s, 0)
                ]
            }, rendering.scene)
            lines.color = new Color3(1, 1, 1)
            lines.parent = mesh

            rendering.addMeshToScene(mesh)
            rendering.addMeshToScene(lines)
            this._highlightMesh = mesh
        }
        return this._highlightMesh
    }

    pickTerrainFromCamera(distance = -1) {
        var noa = this.rendering.noa
        if (!this.rendering.scene || !noa || !noa.camera) return null
        var origin = noa.camera.getPosition()
        var dir = noa.camera.getDirection()
        return this.pickTerrainWithRay(origin, dir, distance, false)
    }

    pickTerrainWithRay(origin, direction, distance = -1, originIsLocal = false) {
        var rendering = this.rendering
        if (!rendering.scene) return null
        var originVec = this._pickOriginVec
        if (originIsLocal) {
            originVec.copyFromFloats(origin[0], origin[1], origin[2])
        } else {
            var off = rendering.noa.worldOriginOffset
            originVec.copyFromFloats(origin[0] - off[0], origin[1] - off[1], origin[2] - off[2])
        }
        var dirVec = this._pickDirectionVec
        dirVec.copyFromFloats(direction[0], direction[1], direction[2])
        dirVec.normalize()
        var ray = this._pickRay
        ray.origin.copyFrom(originVec)
        ray.direction.copyFrom(dirVec)
        ray.length = (distance > 0) ? distance : rendering.noa.blockTestDistance
        return rendering.scene.pickWithRay(ray, this._terrainPickPredicate)
    }

    debug_SceneCheck() {
        // ... (copy existing implementation)
    }

    debug_MeshCount() {
        // ... (copy existing implementation)
    }

    dispose() {
        this._highlightMesh = null
    }
}
```

**Update rendering.js:**
```javascript
import { RenderingUtils, setUpFPS, profile_hook, fps_hook } from './renderingUtils.js'

// In constructor:
this._utils = new RenderingUtils(this)

// Delegate methods:
Rendering.prototype.highlightBlockFace = function(show, pos, norm) {
    return this._utils.highlightBlockFace(show, pos, norm)
}
Rendering.prototype.pickTerrainFromCamera = function(dist) {
    return this._utils.pickTerrainFromCamera(dist)
}
// ... etc
```

**Verification:**
- [ ] Block highlight appears when looking at blocks
- [ ] pickTerrainFromCamera returns valid results
- [ ] FPS display works if enabled

---

#### Step 1.2: Create renderingCoords.js

**File: src/lib/renderingCoords.js**

```javascript
import { Vector3 } from './babylonExports.js'

// Cached arrays for hot paths
var _cachedLocalCoords = [0, 0, 0]
var _cachedWorldCoords = [0, 0, 0]
var _cachedMeshWorldPos = [0, 0, 0]
var _cachedOriginOffset = [0, 0, 0]
var _shaderOffsetVec = new Vector3(0, 0, 0)
var _rebaseVec = new Vector3(0, 0, 0)

export class RenderingCoords {
    constructor(rendering) {
        this.rendering = rendering
    }

    worldToLocal(x, y, z) {
        var off = this.rendering.noa.worldOriginOffset
        return [x - off[0], y - off[1], z - off[2]]
    }

    worldToLocalCached(x, y, z, out) {
        var off = this.rendering.noa.worldOriginOffset
        out = out || _cachedLocalCoords
        out[0] = x - off[0]
        out[1] = y - off[1]
        out[2] = z - off[2]
        return out
    }

    localToWorld(x, y, z) {
        var off = this.rendering.noa.worldOriginOffset
        return [x + off[0], y + off[1], z + off[2]]
    }

    localToWorldCached(x, y, z, out) {
        var off = this.rendering.noa.worldOriginOffset
        out = out || _cachedWorldCoords
        out[0] = x + off[0]
        out[1] = y + off[1]
        out[2] = z + off[2]
        return out
    }

    setMeshWorldPosition(mesh, x, y, z) {
        var local = this.worldToLocalCached(x, y, z)
        mesh.position.set(local[0], local[1], local[2])
    }

    getMeshWorldPosition(mesh) {
        var pos = mesh.position
        return this.localToWorld(pos.x, pos.y, pos.z)
    }

    getMeshWorldPositionCached(mesh, out) {
        var pos = mesh.position
        return this.localToWorldCached(pos.x, pos.y, pos.z, out || _cachedMeshWorldPos)
    }

    getWorldOriginOffset() {
        var off = this.rendering.noa.worldOriginOffset
        return [off[0], off[1], off[2]]
    }

    getWorldOriginOffsetCached(out) {
        var off = this.rendering.noa.worldOriginOffset
        out = out || _cachedOriginOffset
        out[0] = off[0]
        out[1] = off[1]
        out[2] = off[2]
        return out
    }

    updateShaderWorldOrigin(material, uniformName) {
        var off = this.rendering.noa.worldOriginOffset
        _shaderOffsetVec.set(off[0], off[1], off[2])
        material.setVector3(uniformName || 'worldOriginOffset', _shaderOffsetVec)
    }

    _rebaseOrigin(delta) {
        var rendering = this.rendering
        _rebaseVec.set(delta[0], delta[1], delta[2])
        var dvec = _rebaseVec

        rendering.scene.meshes.forEach(mesh => {
            if (mesh.parent) return
            mesh.position.subtractInPlace(dvec)
            if (mesh.isWorldMatrixFrozen) {
                mesh.freezeWorldMatrix()
            }
        })

        rendering._octreeManager.rebase(dvec)
    }
}
```

**Verification:**
- [ ] Walk far from spawn (>500 blocks), check origin rebasing
- [ ] Mesh positions remain correct after rebase
- [ ] Coordinate conversion functions return correct values

---

### Phase 2: Extract Factories (MEDIUM RISK)

#### Step 2.1: Create renderingMaterials.js

**File: src/lib/renderingMaterials.js**

```javascript
import { StandardMaterial, ShaderMaterial, Color3, MeshBuilder } from './babylonExports.js'

export class RenderingMaterials {
    constructor(rendering) {
        this.rendering = rendering
    }

    get meshBuilder() {
        return MeshBuilder
    }

    makeStandardMaterial(name) {
        var mat = new StandardMaterial(name, this.rendering.scene)
        mat.specularColor.copyFromFloats(0, 0, 0)
        mat.ambientColor.copyFromFloats(1, 1, 1)
        mat.diffuseColor.copyFromFloats(1, 1, 1)
        return mat
    }

    createStandardMaterial(name, options) {
        options = options || {}
        var mat = new StandardMaterial(name, this.rendering.scene)

        function toColor3(val, fallback) {
            if (!val) return fallback
            if (val.r !== undefined) return val
            return new Color3(val[0], val[1], val[2])
        }

        mat.diffuseColor = toColor3(options.diffuseColor, new Color3(1, 1, 1))
        mat.emissiveColor = toColor3(options.emissiveColor, new Color3(0, 0, 0))
        mat.specularColor = toColor3(options.specularColor, new Color3(0, 0, 0))
        mat.ambientColor = new Color3(1, 1, 1)

        if (options.specularPower !== undefined) mat.specularPower = options.specularPower
        if (options.alpha !== undefined) mat.alpha = options.alpha
        if (options.wireframe !== undefined) mat.wireframe = options.wireframe
        if (options.backFaceCulling !== undefined) mat.backFaceCulling = options.backFaceCulling
        if (options.maxSimultaneousLights !== undefined) mat.maxSimultaneousLights = options.maxSimultaneousLights

        return mat
    }

    createShaderMaterial(name, vertexSource, fragmentSource, options) {
        options = options || {}
        var attributes = options.attributes ? options.attributes.slice() : ['position', 'normal']
        var uniforms = options.uniforms ? options.uniforms.slice() : ['world', 'viewProjection']

        if (options.needInstancing) {
            if (attributes.indexOf('world0') === -1) attributes.push('world0')
            if (attributes.indexOf('world1') === -1) attributes.push('world1')
            if (attributes.indexOf('world2') === -1) attributes.push('world2')
            if (attributes.indexOf('world3') === -1) attributes.push('world3')
        }

        var shaderOptions = {
            attributes: attributes,
            uniforms: uniforms,
            samplers: options.samplers || [],
            defines: options.defines || [],
        }
        if (options.uniformBuffers) {
            shaderOptions.uniformBuffers = options.uniformBuffers
        }

        var mat = new ShaderMaterial(name, this.rendering.scene, {
            vertexElement: undefined,
            fragmentElement: undefined,
            vertexSource: vertexSource,
            fragmentSource: fragmentSource,
        }, shaderOptions)

        if (options.backFaceCulling !== undefined) {
            mat.backFaceCulling = options.backFaceCulling
        } else {
            mat.backFaceCulling = true
        }

        if (options.alphaMode !== undefined) {
            mat.alphaMode = options.alphaMode
        }

        if (options.needAlphaBlending) {
            mat.needAlphaBlending = function () { return true }
        }

        return mat
    }
}
```

**Verification:**
- [ ] Terrain materials render correctly
- [ ] Text shadow material works
- [ ] Custom shader materials compile

---

#### Step 2.2: Create renderingModels.js

**File: src/lib/renderingModels.js**

```javascript
import { SceneLoader, StandardMaterial, Color3 } from './babylonExports.js'

function extractPBRColor(mat) {
    if ('_albedoColor' in mat && mat._albedoColor) {
        return mat._albedoColor
    }
    if ('albedoColor' in mat && mat.albedoColor) {
        return mat.albedoColor
    }
    if ('baseColor' in mat && mat.baseColor) {
        return mat.baseColor
    }
    return null
}

export class RenderingModels {
    constructor(rendering) {
        this.rendering = rendering
    }

    async loadModel(url, options) {
        options = options || {}
        var self = this
        var rendering = this.rendering
        var scene = rendering.scene
        var registerMeshes = options.registerMeshes !== false
        var meshes = []
        var skeletons = []
        var animationGroups = []
        var rootMesh = null
        var cleanupFn = null
        var oldMaterials = []

        function disposeOldMaterials() {
            if (!oldMaterials) return
            for (var i = 0; i < oldMaterials.length; i++) {
                try { oldMaterials[i].dispose() } catch (e) { }
            }
            oldMaterials = null
        }

        function disposeLoadedResources() {
            for (var i = 0; i < animationGroups.length; i++) {
                var ag = animationGroups[i]
                if (ag) {
                    try { ag.dispose() } catch (e) { }
                }
            }
            for (var j = 0; j < skeletons.length; j++) {
                var sk = skeletons[j]
                if (sk) {
                    try { sk.dispose() } catch (e) { }
                }
            }
            for (var k = 0; k < meshes.length; k++) {
                var mesh = meshes[k]
                if (mesh && !mesh.isDisposed()) {
                    try { mesh.dispose() } catch (e) { }
                }
            }
        }

        try {
            var result = await SceneLoader.ImportMeshAsync('', '', url, scene)

            meshes = result.meshes || []
            skeletons = result.skeletons || []
            animationGroups = result.animationGroups || []

            if (meshes.length === 0) {
                throw new Error('No meshes found in model: ' + url)
            }

            rootMesh = meshes[0]

            if (options.scale !== undefined) {
                var s = options.scale
                if (typeof s === 'number') {
                    rootMesh.scaling.setAll(s)
                } else {
                    rootMesh.scaling.set(s[0], s[1], s[2])
                }
            }

            if (options.onMaterialLoaded) {
                meshes.forEach(function (mesh) {
                    if (mesh.material && mesh.name !== '__root__') {
                        var oldMat = mesh.material
                        var newMat = options.onMaterialLoaded(oldMat, mesh)
                        if (newMat && newMat !== oldMat) {
                            mesh.material = newMat
                            oldMaterials.push(oldMat)
                        }
                    }
                })
            } else if (options.convertToStandard) {
                meshes.forEach(function (mesh) {
                    if (mesh.material && mesh.name !== '__root__') {
                        var oldMat = mesh.material
                        var newMat = new StandardMaterial(oldMat.name + '_std', scene)

                        var baseColor = extractPBRColor(oldMat)
                        if (baseColor) {
                            newMat.diffuseColor = new Color3(baseColor.r, baseColor.g, baseColor.b)
                        } else {
                            newMat.diffuseColor = new Color3(0.6, 0.6, 0.6)
                        }

                        newMat.specularColor = new Color3(0.1, 0.1, 0.1)
                        newMat.ambientColor = new Color3(1, 1, 1)

                        mesh.material = newMat
                        oldMaterials.push(oldMat)
                    }
                })
            }

            disposeOldMaterials()

            if (registerMeshes) {
                meshes.forEach(function (mesh) {
                    var bi = mesh.getBoundingInfo && mesh.getBoundingInfo()
                    if (bi && bi.boundingSphere) {
                        rendering.addMeshToScene(mesh)
                    } else {
                        mesh.isVisible = false
                    }
                })
            }

            cleanupFn = function () {
                disposeLoadedResources()
            }

            return {
                rootMesh: rootMesh,
                meshes: meshes,
                skeletons: skeletons,
                animationGroups: animationGroups,
                cleanup: cleanupFn,
            }
        } catch (err) {
            disposeOldMaterials()
            if (cleanupFn) {
                try { cleanupFn() } catch (cleanupErr) { }
            } else {
                disposeLoadedResources()
            }
            console.error('[noa] Failed to load model:', url, err)
            throw err
        }
    }
}
```

**Verification:**
- [ ] GLB models load correctly
- [ ] PBR conversion works
- [ ] Cleanup function disposes resources

---

### Phase 3: Extract Mesh Management (MEDIUM-HIGH RISK)

#### Step 3.1: Create renderingMeshes.js

**File: src/lib/renderingMeshes.js**

```javascript
var addedToSceneFlag = 'noa_added_to_scene'

export class RenderingMeshes {
    constructor(rendering) {
        this.rendering = rendering
    }

    addMeshToScene(mesh, isStatic = false, pos = null, containingChunk = null) {
        var rendering = this.rendering
        if (!mesh.metadata) mesh.metadata = {}

        // Babylon 8 LOD fix
        if (!mesh._internalAbstractMeshDataInfo) {
            mesh._internalAbstractMeshDataInfo = { _currentLOD: new Map() }
        } else if (!mesh._internalAbstractMeshDataInfo._currentLOD) {
            mesh._internalAbstractMeshDataInfo._currentLOD = new Map()
        }

        var bi = mesh.getBoundingInfo && mesh.getBoundingInfo()
        if (!bi || !bi.boundingSphere) {
            mesh.isVisible = false
            return
        }

        if (mesh.subMeshes && mesh.subMeshes.length > 0) {
            for (var i = 0; i < mesh.subMeshes.length; i++) {
                var sm = mesh.subMeshes[i]
                if (!sm._boundingInfo) {
                    sm._boundingInfo = bi
                }
            }
        }

        if (mesh.metadata[addedToSceneFlag]) {
            rendering._octreeManager.setMeshVisibility(mesh, true)
            return
        }
        mesh.metadata[addedToSceneFlag] = true

        if (!mesh.parent) {
            if (!pos) pos = mesh.position.asArray()
            var lpos = rendering.noa.globalToLocal(pos, null, [])
            mesh.position.fromArray(lpos)
        }

        rendering._octreeManager.addMesh(mesh, isStatic, pos, containingChunk)
        mesh.onDisposeObservable.add(() => {
            rendering._octreeManager.removeMesh(mesh)
            mesh.metadata[addedToSceneFlag] = false
        })
    }

    removeMeshFromScene(mesh) {
        var rendering = this.rendering
        if (!mesh.metadata) return
        if (!mesh.metadata[addedToSceneFlag]) return

        rendering._octreeManager.removeMesh(mesh)
        mesh.metadata[addedToSceneFlag] = false
    }

    setMeshVisibility(mesh, visible = false) {
        var rendering = this.rendering
        if (!mesh.metadata) mesh.metadata = {}
        if (mesh.metadata[addedToSceneFlag]) {
            rendering._octreeManager.setMeshVisibility(mesh, visible)
        } else {
            if (visible) this.addMeshToScene(mesh)
        }
    }
}
```

**Verification:**
- [ ] Terrain chunks render correctly
- [ ] Entities appear in scene
- [ ] Mesh visibility toggles work
- [ ] Disposed meshes are removed

---

### Phase 4: Extract Lighting (MEDIUM RISK)

#### Step 4.1: Create renderingLighting.js

**File: src/lib/renderingLighting.js**

```javascript
import { DirectionalLight, HemisphericLight, Color3, Vector3 } from './babylonExports.js'

export class RenderingLighting {
    constructor(rendering, opts) {
        this.rendering = rendering
        this._light = null

        // Create main light
        var scene = rendering.scene
        var lightVec = Vector3.FromArray(opts.lightVector)
        this._light = new DirectionalLight('light', lightVec, scene)
        this._light.diffuse = Color3.FromArray(opts.lightDiffuse)
        this._light.specular = Color3.FromArray(opts.lightSpecular)
    }

    get light() {
        return this._light
    }

    setMainLightOptions(opts) {
        if (!this._light) return
        if (opts.direction) this._light.direction = opts.direction
        if (opts.intensity !== undefined) this._light.intensity = opts.intensity
        if (opts.diffuse) this._light.diffuse = opts.diffuse
        if (opts.specular) this._light.specular = opts.specular
    }

    excludeMeshFromMainLight(mesh, includeDescendants = true) {
        if (!this._light || !mesh) return
        var targets = [mesh]
        if (includeDescendants && typeof mesh.getChildMeshes === 'function') {
            targets = targets.concat(mesh.getChildMeshes(false))
        }
        targets.forEach(m => {
            if (this._light.excludedMeshes.indexOf(m) === -1) {
                this._light.excludedMeshes.push(m)
            }
        })
    }

    includeMeshInMainLight(mesh, includeDescendants = true) {
        if (!this._light || !mesh) return
        var targets = [mesh]
        if (includeDescendants && typeof mesh.getChildMeshes === 'function') {
            targets = targets.concat(mesh.getChildMeshes(false))
        }
        targets.forEach(m => {
            var idx = this._light.excludedMeshes.indexOf(m)
            if (idx >= 0) this._light.excludedMeshes.splice(idx, 1)
        })
    }

    createLight(type, name) {
        var scene = this.rendering.scene
        if (type === 'directional') {
            return new DirectionalLight(name, new Vector3(0, -1, 0), scene)
        } else if (type === 'hemispheric') {
            return new HemisphericLight(name, new Vector3(0, 1, 0), scene)
        }
        throw new Error('Unknown light type: ' + type)
    }

    tick(dt) {
        // Clean up disposed meshes
        if (this._light && this._light.excludedMeshes && this._light.excludedMeshes.length > 0) {
            var validMeshes = this._light.excludedMeshes.filter(function (m) {
                return m && !m.isDisposed()
            })
            if (validMeshes.length !== this._light.excludedMeshes.length) {
                this._light.excludedMeshes = validMeshes
            }
        }
    }

    dispose() {
        if (this._light) {
            this._light.dispose()
            this._light = null
        }
    }
}
```

**Verification:**
- [ ] Main light affects terrain
- [ ] Text lighting exclude/include works
- [ ] Light direction can be changed

---

### Phase 5: Extract Camera (MEDIUM RISK)

#### Step 5.1: Create renderingCamera.js

**File: src/lib/renderingCamera.js**

```javascript
import { CreatePlane } from './babylonExports.js'

export class RenderingCamera {
    constructor(rendering) {
        this.rendering = rendering
        this._camScreen = null
        this._camScreenMat = null
        this._camLocBlock = 0

        // Create camera screen overlay
        var scene = rendering.scene
        this._camScreen = CreatePlane('camScreen', { size: 10 }, scene)
        rendering.addMeshToScene(this._camScreen)
        this._camScreen.position.z = .1
        this._camScreen.parent = rendering.camera
        this._camScreenMat = rendering.makeStandardMaterial('camera_screen_mat')
        this._camScreen.material = this._camScreenMat
        this._camScreen.setEnabled(false)
        this._camScreenMat.freeze()
    }

    updateForRender() {
        var rendering = this.rendering
        var cam = rendering.noa.camera
        var tgtLoc = cam._localGetTargetPosition()
        rendering._cameraHolder.position.copyFromFloats(tgtLoc[0], tgtLoc[1], tgtLoc[2])
        rendering._cameraHolder.rotation.x = cam.pitch
        rendering._cameraHolder.rotation.y = cam.heading
        rendering.camera.position.z = -cam.currentZoom

        var cloc = cam._localGetPosition()
        var off = rendering.noa.worldOriginOffset
        var cx = Math.floor(cloc[0] + off[0])
        var cy = Math.floor(cloc[1] + off[1])
        var cz = Math.floor(cloc[2] + off[2])
        var id = rendering.noa.getBlock(cx, cy, cz)
        this._checkCameraEffect(id)
    }

    _checkCameraEffect(id) {
        if (id === this._camLocBlock) return
        if (id === 0) {
            this._camScreen.setEnabled(false)
        } else {
            var noa = this.rendering.noa
            var matId = noa.registry.getBlockFaceMaterial(id, 0)
            if (matId) {
                var matData = noa.registry.getMaterialData(matId)
                var col = matData.color
                var alpha = matData.alpha
                if (col && alpha && alpha < 1) {
                    this._camScreenMat.diffuseColor.set(0, 0, 0)
                    this._camScreenMat.ambientColor.set(col[0], col[1], col[2])
                    this._camScreenMat.alpha = alpha
                    this._camScreen.setEnabled(true)
                }
            }
        }
        this._camLocBlock = id
    }

    dispose() {
        if (this._camScreen) {
            this._camScreen.dispose()
            this._camScreen = null
        }
        if (this._camScreenMat) {
            this._camScreenMat.dispose()
            this._camScreenMat = null
        }
    }
}
```

**Verification:**
- [ ] Camera movement is smooth
- [ ] Water/transparent block overlay works
- [ ] Camera zoom functions correctly

---

### Phase 6: Extract Core (HIGH RISK - Final Step)

#### Step 6.1: Create renderingCore.js

This is the most complex extraction. See full implementation template below.

**Verification:**
- [ ] Game starts without errors
- [ ] Scene initializes correctly
- [ ] All meshes render
- [ ] Dispose works without errors

---

## 5. Facade Class Template

**File: src/lib/rendering.js (final form)**

```javascript
import { Material, Color3, Color4, TransformNode, FreeCamera, Vector3 } from './babylonExports.js'
import { RenderingCore } from './renderingCore.js'
import { RenderingLighting } from './renderingLighting.js'
import { RenderingMeshes } from './renderingMeshes.js'
import { RenderingMaterials } from './renderingMaterials.js'
import { RenderingModels } from './renderingModels.js'
import { RenderingCoords } from './renderingCoords.js'
import { RenderingCamera } from './renderingCamera.js'
import { RenderingUtils, setUpFPS, profile_hook, fps_hook } from './renderingUtils.js'

// Babylon 8 compatibility shim
if (typeof Material.prototype.needAlphaTestingForMesh !== 'function') {
    Material.prototype.needAlphaTestingForMesh = function (mesh) {
        return (typeof this.needAlphaTesting === 'function') ? this.needAlphaTesting() : false
    }
}

var defaults = {
    showFPS: false,
    antiAlias: true,
    clearColor: [0.8, 0.9, 1],
    ambientColor: [0.5, 0.5, 0.5],
    lightDiffuse: [1, 1, 1],
    lightSpecular: [1, 1, 1],
    lightVector: [1, -1, 0.5],
    useAO: true,
    AOmultipliers: [0.93, 0.8, 0.5],
    reverseAOmultiplier: 1.0,
    preserveDrawingBuffer: true,
    octreeBlockSize: 2,
    renderOnResize: true,
}

export class Rendering {
    constructor(noa, opts, canvas) {
        opts = Object.assign({}, defaults, opts)
        this.noa = noa

        // Settings (direct properties for external access)
        this.renderOnResize = !!opts.renderOnResize

        // CRITICAL: These MUST stay on facade - terrainMesher accesses directly
        this.useAO = !!opts.useAO
        this.aoVals = opts.AOmultipliers
        this.revAoVal = opts.reverseAOmultiplier
        this.meshingCutoffTime = 6
        this._disposed = false

        // Initialize sub-modules
        this._core = new RenderingCore(this, canvas, opts)
        this._lighting = new RenderingLighting(this, opts)
        this._meshes = new RenderingMeshes(this)
        this._materials = new RenderingMaterials(this)
        this._models = new RenderingModels(this)
        this._coords = new RenderingCoords(this)
        this._camera = new RenderingCamera(this)
        this._utils = new RenderingUtils(this)

        if (opts.showFPS) setUpFPS()
    }

    // ============ PROPERTY GETTERS ============

    get engine() { return this._core.engine }
    get scene() { return this._core.scene }
    get camera() { return this._core.camera }
    get light() { return this._lighting.light }
    get sceneReady() { return this._core.sceneReady }
    get meshBuilder() { return this._materials.meshBuilder }
    get _octreeManager() { return this._core.octreeManager }
    get _cameraHolder() { return this._core.cameraHolder }

    // ============ SCENE ACCESS ============

    getScene() { return this._core.scene }
    isSceneReady() { return this._core.isSceneReady() }
    onSceneReady(callback) { return this._core.onSceneReady(callback) }

    // ============ LIGHTING ============

    setMainLightOptions(opts) { return this._lighting.setMainLightOptions(opts) }
    excludeMeshFromMainLight(mesh, desc) { return this._lighting.excludeMeshFromMainLight(mesh, desc) }
    includeMeshInMainLight(mesh, desc) { return this._lighting.includeMeshInMainLight(mesh, desc) }
    createLight(type, name) { return this._lighting.createLight(type, name) }

    // ============ MESH MANAGEMENT ============

    addMeshToScene(mesh, isStatic, pos, chunk) { return this._meshes.addMeshToScene(mesh, isStatic, pos, chunk) }
    removeMeshFromScene(mesh) { return this._meshes.removeMeshFromScene(mesh) }
    setMeshVisibility(mesh, visible) { return this._meshes.setMeshVisibility(mesh, visible) }

    // ============ MATERIALS ============

    makeStandardMaterial(name) { return this._materials.makeStandardMaterial(name) }
    createStandardMaterial(name, opts) { return this._materials.createStandardMaterial(name, opts) }
    createShaderMaterial(name, vs, fs, opts) { return this._materials.createShaderMaterial(name, vs, fs, opts) }

    // ============ MODEL LOADING ============

    loadModel(url, opts) { return this._models.loadModel(url, opts) }

    // ============ COORDINATE CONVERSION ============

    worldToLocal(x, y, z) { return this._coords.worldToLocal(x, y, z) }
    worldToLocalCached(x, y, z, out) { return this._coords.worldToLocalCached(x, y, z, out) }
    localToWorld(x, y, z) { return this._coords.localToWorld(x, y, z) }
    localToWorldCached(x, y, z, out) { return this._coords.localToWorldCached(x, y, z, out) }
    setMeshWorldPosition(mesh, x, y, z) { return this._coords.setMeshWorldPosition(mesh, x, y, z) }
    getMeshWorldPosition(mesh) { return this._coords.getMeshWorldPosition(mesh) }
    getMeshWorldPositionCached(mesh, out) { return this._coords.getMeshWorldPositionCached(mesh, out) }
    getWorldOriginOffset() { return this._coords.getWorldOriginOffset() }
    getWorldOriginOffsetCached(out) { return this._coords.getWorldOriginOffsetCached(out) }
    updateShaderWorldOrigin(mat, name) { return this._coords.updateShaderWorldOrigin(mat, name) }

    // ============ PICKING & UTILS ============

    pickTerrainFromCamera(dist) { return this._utils.pickTerrainFromCamera(dist) }
    pickTerrainWithRay(orig, dir, dist, local) { return this._utils.pickTerrainWithRay(orig, dir, dist, local) }
    highlightBlockFace(show, pos, norm) { return this._utils.highlightBlockFace(show, pos, norm) }
    debug_SceneCheck() { return this._utils.debug_SceneCheck() }
    debug_MeshCount() { return this._utils.debug_MeshCount() }

    // ============ LIFECYCLE ============

    tick(dt) {
        this._lighting.tick(dt)
    }

    render() {
        profile_hook('start')
        this._camera.updateForRender()
        profile_hook('updateCamera')
        this.engine.beginFrame()
        profile_hook('beginFrame')

        // BoundingInfo validation
        this.scene.meshes.forEach(mesh => {
            if (!mesh.metadata) mesh.metadata = {}
            if (mesh.metadata._noaBoundingChecked) return
            var bi = null
            try { bi = mesh.getBoundingInfo && mesh.getBoundingInfo() } catch (e) { }
            if (!bi || !bi.boundingSphere) {
                mesh.isVisible = false
            }
            mesh.metadata._noaBoundingChecked = true
        })

        this.scene.render()
        profile_hook('render')
        fps_hook()
        this.engine.endFrame()
        profile_hook('endFrame')
        profile_hook('end')
    }

    postRender() { }

    resize() {
        this.engine.resize()
        if (this.noa._paused && this.renderOnResize) {
            this.scene.render()
        }
    }

    prepareChunkForRendering(chunk) { }
    disposeChunkForRendering(chunk) { }

    _rebaseOrigin(delta) {
        this._coords._rebaseOrigin(delta)
    }

    dispose() {
        if (this._disposed) return
        this._disposed = true

        this._utils.dispose()
        this._camera.dispose()
        this._lighting.dispose()
        this._core.dispose()
    }
}
```

---

## 6. Verification Checklist

### Build & Tests
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (if tests exist)
- [ ] No TypeScript/lint errors

### Functional Tests
- [ ] Game starts without console errors
- [ ] Terrain chunks render correctly
- [ ] Block highlighting works
- [ ] Text rendering works
- [ ] Text shadows render
- [ ] Entity meshes appear
- [ ] Camera movement is smooth
- [ ] Camera zoom works
- [ ] Water/transparent overlay works
- [ ] Walk far from spawn - origin rebasing works
- [ ] Model loading works (if used)
- [ ] Light direction affects terrain

### Breaking Change Verification
- [ ] `noa.rendering.useAO` returns correct value
- [ ] `noa.rendering.aoVals` returns array
- [ ] `noa.rendering.revAoVal` returns number
- [ ] `noa.rendering.scene` returns Scene
- [ ] `noa.rendering.engine` returns Engine
- [ ] All 13 consumer files work unchanged

---

## 7. Appendix: Code Transformations

### Pattern A: Prototype Method to Class Method

**Before:**
```javascript
Rendering.prototype.makeStandardMaterial = function (name) {
    var mat = new StandardMaterial(name, this.scene)
    // ...
    return mat
}
```

**After (in sub-module):**
```javascript
export class RenderingMaterials {
    constructor(rendering) {
        this.rendering = rendering
    }

    makeStandardMaterial(name) {
        var mat = new StandardMaterial(name, this.rendering.scene)
        // ...
        return mat
    }
}
```

**After (facade delegation):**
```javascript
makeStandardMaterial(name) {
    return this._materials.makeStandardMaterial(name)
}
```

### Pattern B: Module-Level Function to Class Method

**Before:**
```javascript
function updateCameraForRender(self) {
    var cam = self.noa.camera
    // ...
}

// Called in render():
updateCameraForRender(this)
```

**After (in RenderingCamera):**
```javascript
export class RenderingCamera {
    updateForRender() {
        var cam = this.rendering.noa.camera
        // ...
    }
}

// Called in render():
this._camera.updateForRender()
```

### Pattern C: Accessing Sibling Module State

**When module A needs module B's state:**
```javascript
// In RenderingMeshes, need octreeManager from RenderingCore
addMeshToScene(mesh) {
    // Access through facade
    this.rendering._octreeManager.addMesh(mesh, ...)
}
```

### Pattern D: Preserving External State Access

**For properties accessed directly by consumers:**
```javascript
// In facade class - MUST be direct properties
this.useAO = !!opts.useAO
this.aoVals = opts.AOmultipliers
this.revAoVal = opts.reverseAOmultiplier
```

---

## Implementation Notes

1. **Order matters**: Extract modules from lowest to highest risk
2. **Test after each step**: Verify functionality before proceeding
3. **Keep old code**: Comment out rather than delete until verified
4. **One module at a time**: Complete each extraction before starting the next
5. **Git commits**: Commit after each successful module extraction

---

*Document generated for noa voxel engine rendering system refactoring.*
