# Text Subsystem Architecture

This document describes the architecture of the noa text rendering subsystem, which provides 3D text rendering with camera-relative lighting and ground shadows.

## Overview

The text subsystem is an optional module that uses [meshwriter](https://github.com/briantbutton/meshwriter) for text-to-mesh conversion. It provides:

- 3D extruded text meshes in world space
- Billboard text that always faces the camera
- Camera-relative lighting for consistent edge definition (accessibility feature)
- Ground shadows via raycasting
- WCAG contrast color derivation for dyslexic readability

## Directory Structure

```
src/lib/text/
├── index.js                 # Main entry - exports Text, TextHandle
├── TextSystem.js            # Text class - orchestrates subsystems
├── TextDefaults.js          # Default options for text creation
├── ReadyState.js            # Initialization state management
├── MeshWriterLoader.js      # Dynamic meshwriter import
├── TextFactory.js           # Text mesh creation functions
├── MaterialConfigurator.js  # Color processing & Fresnel setup
├── TextHandle.js            # Handle for managing text instances
├── logging.js               # Namespaced console logging
├── lighting/
│   ├── index.js             # Exports TextLighting
│   ├── TextLighting.js      # Camera-relative lighting orchestrator
│   ├── LightPresets.js      # Light direction presets
│   ├── LightFactory.js      # Babylon light creation
│   ├── MeshRegistry.js      # Text mesh tracking with LOD state
│   ├── SceneLightIsolation.js  # Scene light observer
│   └── DirectionController.js  # Camera-relative direction math
└── shadows/
    ├── index.js             # Exports TextShadowManager
    ├── ShadowManager.js     # Shadow system orchestrator
    ├── ShadowResources.js   # Disc mesh, material, texture creation
    ├── ShadowInstances.js   # Per-text shadow tracking
    ├── ShadowMeasurement.js # Bounding box measurement
    └── ShadowUpdater.js     # Per-frame shadow positioning
```

## Module Responsibilities

### Core Modules

**TextSystem.js** - Main `Text` class
- Composes all subsystems (lighting, shadows, ready state)
- Provides public API: `createWorldText()`, `createBillboardText()`, `updateText()`
- Manages render observer for per-frame updates
- Handles initialization flow with meshwriter

**TextHandle.js** - Instance management
- Wraps meshwriter text instance and Babylon mesh
- Provides `setColor()`, `setAlpha()`, `dispose()` methods
- Coordinates cleanup with lighting and shadow systems
- Uses dependency injection for cleanup callbacks

**TextFactory.js** - Mesh creation
- Pure functions for creating text meshes
- `createWorldText()` - creates positioned 3D text
- `createBillboardText()` - creates camera-facing text
- `updateText()` - recreates text with new content (preserves position)

**MaterialConfigurator.js** - Visual quality
- `processContrastColors()` - derives edge colors for WCAG contrast
- `configureMaterial()` - sets up Fresnel for edge definition
- Handles autoContrast and highContrast modes

**ReadyState.js** - Initialization
- Manages `ready`, `initFailed` flags
- Handles deferred `onReady()` callbacks
- Provides `setReady()`, `setFailed()`, `reset()` methods

**MeshWriterLoader.js** - Optional dependency
- Dynamic `import('meshwriter')` with error handling
- Loads and registers default Helvetica font
- Extracts color contrast utilities from meshwriter

### Lighting Modules

**TextLighting.js** - Camera-relative lighting
- Creates DirectionalLight + HemisphericLight for text
- Updates light direction based on camera orientation each frame
- Implements LOD switching (nearby text uses camera light, distant uses world light)
- Isolates text meshes from scene lights when using camera lighting

**LightPresets.js** - Direction presets
- `above-front`, `headlamp`, `above-left`, `above-right`, `custom`
- Each preset defines azimuth and elevation offsets from camera forward

**MeshRegistry.js** - Mesh tracking
- `Set<Mesh>` for all registered text meshes
- `WeakMap<Mesh, boolean>` for LOD state (using text light or world light)
- Auto-prunes disposed meshes

**DirectionController.js** - Math utilities
- Rotates light direction by azimuth/elevation relative to camera
- Uses reusable vectors to avoid per-frame allocations
- `distanceSquared()` for LOD distance checks

**SceneLightIsolation.js** - Light exclusion
- Observes `scene.onNewLightAddedObservable`
- Excludes text meshes from new scene lights
- Maintains isolation when lights are added dynamically

### Shadow Modules

**ShadowManager.js** - Shadow orchestrator
- Creates shared shadow resources (disc mesh, material, texture)
- Manages per-text shadow instances
- Calls `updateShadows()` each frame from render observer

**ShadowResources.js** - Shared resources
- Creates source disc mesh for instancing
- Creates black unlit material with radial gradient texture
- Material is frozen for performance

**ShadowInstances.js** - Instance tracking
- `Map<textId, ShadowData>` storage
- ShadowData includes: textHandle, shadow mesh, options, dimensions, center offsets

**ShadowMeasurement.js** - Dimensions
- Extracts width/depth from text mesh bounding box
- Calculates center offset for proper shadow positioning

**ShadowUpdater.js** - Per-frame updates
- Raycasts down from text position to find ground
- Positions shadow at ground level with height-based fade
- Scales shadow based on blur setting and height

## Data Flow

### Initialization
```
Text constructor
  └─> ReadyState (initial state)
  └─> TextShadowManager (created but not initialized)
  └─> _initWhenReady() waits for scene
        └─> MeshWriterLoader.loadMeshWriter()
        └─> ReadyState.setReady()
        └─> ShadowManager.initialize()
        └─> new TextLighting()
        └─> Register render observer
```

### Text Creation
```
createWorldText(content, options)
  └─> Merge with defaultOptions
  └─> processContrastColors()
  └─> new MeshWriter(content, ...)
  └─> configureMaterial()
  └─> noa.rendering.addMeshToScene()
  └─> TextLighting.addTextMesh() if using camera light
  └─> new TextHandle()
  └─> ShadowManager.createShadowsForText()
  └─> return TextHandle
```

### Per-Frame Update
```
scene.onBeforeRenderObservable
  └─> ShadowManager.updateShadows()
  │     └─> For each shadow: raycast, position, scale
  └─> TextLighting.update()
        └─> updateLightDirection() (camera-relative)
        └─> _updateAllMeshLOD() (distance-based switching)
```

### Disposal
```
TextHandle.dispose()
  └─> TextLighting.removeTextMesh() (BEFORE mesh dispose)
  └─> textInstance.dispose()
  └─> noa.rendering.removeMeshFromScene()
  └─> mesh.dispose()
  └─> ShadowManager.removeShadows()
  └─> Remove from activeTexts registry
```

## Key Design Decisions

### Dependency Injection in TextHandle
TextHandle receives cleanup callbacks via a config object rather than holding references to Text, TextLighting, and ShadowManager. This:
- Avoids circular imports
- Makes cleanup explicit
- Allows testing with mock callbacks

### LOD for Lighting
Text meshes switch between camera-relative lighting (nearby) and world lighting (distant) based on configurable distance threshold. Uses hysteresis to prevent flickering at the boundary.

### WeakMap for LOD State
`MeshRegistry` uses WeakMap for LOD state so disposed meshes can be garbage collected without manual cleanup of the map.

### Frozen Shadow Material
Shadow material is frozen after creation for Babylon.js rendering optimization. Opacity changes require unfreeze/refreeze.

### Center Offset Calculation
Shadow positions use a pre-calculated center offset rather than `boundingBox.centerWorld` directly. This avoids timing issues after world origin rebasing.

## Public API

```javascript
// Create text
const handle = noa.text.createWorldText('Hello', {
    position: [10, 5, 10],
    letterHeight: 2,
    color: '#FFAA00',
    shadow: true,
    useCameraLight: true
})

// Billboard text
const label = noa.text.createBillboardText('Player', { ... })

// Update content (recreates mesh)
const newHandle = noa.text.updateText(handle, 'New text')

// Modify
handle.setColor('#FF0000')
handle.setAlpha(0.8)

// Access mesh directly
handle.mesh.rotation.y = Math.PI / 4

// Dispose
handle.dispose()

// Access managers
const lighting = noa.text.getTextLighting()
lighting.setPreset('above-left')
lighting.setIntensity(1.2)

const shadows = noa.text.getShadowManager()
shadows.setDefaults({ blur: 0.7, opacity: 0.5 })
```

## Configuration Options

### Text Options
- `font` - Font family name (default: 'Helvetica')
- `letterHeight` - Height in world units (default: 1)
- `letterThickness` - Depth of extrusion (default: 0.1)
- `color` - Emissive/face color (default: '#FFFFFF')
- `alpha` - Transparency 0-1 (default: 1)
- `anchor` - 'left', 'center', 'right' (default: 'center')
- `autoContrast` - Auto-derive edge colors (default: true)
- `highContrast` - Adjust colors for WCAG (default: false)
- `contrastLevel` - Target WCAG ratio (default: 4.5)
- `useCameraLight` - Use camera-relative lighting (default: true)
- `shadow` - Shadow options or false to disable

### Lighting Options (via constructor or setters)
- `enabled` - Enable camera lighting (default: true)
- `preset` - 'above-front', 'headlamp', 'above-left', 'above-right', 'custom'
- `intensity` - Light intensity (default: 1.0)
- `lodDistance` - Distance for LOD switch (default: 50)
- `isolateFromSceneAmbient` - Zero ambient on text (default: false)
- `ambientIntensity` - Text ambient light intensity (default: 0.2)

### Shadow Options
- `enabled` - Enable shadows (default: true)
- `blur` - Softness 0-1 (default: 0.5)
- `opacity` - Shadow opacity 0-1 (default: 0.4)
- `maxDistance` - Max raycast distance (default: 10)
