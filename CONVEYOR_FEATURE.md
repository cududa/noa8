# Conveyor Belt / Flow Animation Feature

## Overview

Added support for smooth vertex-based animation of block materials in noa-engine. This enables conveyor belt effects, flowing water, or any other material that needs to move smoothly in a specified direction.

## Implementation

### 1. Material Registration API (`registry.js`)

Added two new optional properties to `MaterialOptions`:

```javascript
noa.registry.registerMaterial('conveyor_red', {
  color: [0.9, 0.2, 0.2],    // Material color (as before)
  flowSpeed: 1.0,             // NEW: Speed in blocks per second
  flowDirection: [1, 0, 0],   // NEW: Direction vector [x, y, z]
})
```

**Properties:**
- `flowSpeed` (number): Animation speed in blocks per second. Default: 0 (no animation)
- `flowDirection` (array): Direction vector [x, y, z]. Default: [1, 0, 0]

### 2. Terrain Material Manager (`terrainMaterials.js`)

**Changes:**
- Animated materials get unique terrain IDs (can't be merged with other materials)
- Created `FlowAnimationPlugin` class that extends Babylon.js `MaterialPluginBase`
- Plugin adds shader uniforms and vertex shader modifications

**How it works:**
1. When a material has `flowSpeed > 0`, it creates a `FlowAnimationPlugin`
2. Plugin hooks into the scene's `onBeforeRenderObservable` to update time
3. Vertex shader receives:
   - `flowTime`: Accumulated time in seconds
   - `flowDirection`: Normalized direction vector
   - `flowSpeed`: Speed multiplier
4. Vertex positions are offset: `position += flowDirection * fract(flowTime * flowSpeed)`
5. `fract()` ensures seamless wrapping every block unit

### 3. Shader Integration

The plugin modifies the vertex shader via Babylon's material plugin system:

```glsl
// Uniforms (automatically added)
uniform float flowTime;
uniform vec3 flowDirection;
uniform float flowSpeed;

// Vertex main (injected code)
float flowOffset = fract(flowTime * flowSpeed);
positionUpdated += flowDirection * flowOffset;
```

The offset wraps at 1.0, creating a seamless loop as blocks appear to flow infinitely.

## Usage Example

### Basic Conveyor Belt

```javascript
// Register animated material
noa.registry.registerMaterial('conveyor', {
  color: [0.8, 0.3, 0.2],
  flowSpeed: 2.0,              // 2 blocks/second
  flowDirection: [1, 0, 0],    // Flow east
})

// Register block using the material
noa.registry.registerBlock(CONVEYOR_BLOCK_ID, {
  material: 'conveyor',
  solid: true,
  opaque: true,
})

// Place blocks
for (let i = 0; i < 10; i++) {
  noa.setBlock(CONVEYOR_BLOCK_ID, x + i, y, z)
}
```

### Different Directions

```javascript
// Flow north (+Z)
flowDirection: [0, 0, 1]

// Flow south (-Z)
flowDirection: [0, 0, -1]

// Flow east (+X)
flowDirection: [1, 0, 0]

// Flow west (-X)
flowDirection: [-1, 0, 0]

// Flow up (+Y)
flowDirection: [0, 1, 0]

// Diagonal flow (northeast)
flowDirection: [1, 0, 1]  // Will be normalized by shader
```

## Technical Details

### Performance Considerations

1. **Animated materials can't be frozen** - They need to update uniforms each frame
2. **Each animated material gets its own terrain mesh** - Can't be merged with other materials
3. **GPU-based animation** - Vertex offset happens on GPU, no CPU overhead per block
4. **Automatic time management** - Plugin handles time accumulation automatically

### Coordinate System

- X-axis: West (-) to East (+)
- Y-axis: Down (-) to Up (+)
- Z-axis: South (-) to North (+)

### Limitations

1. **Block colors only** - Currently only works with solid color materials (not textures)
   - Textures could be added by extending the implementation to also scroll UVs
2. **Visual only** - Does not affect physics or player movement
   - For gameplay conveyor effects, you'd need to add entity velocity changes separately
3. **Seamless wrapping at 1 block** - Animation repeats every block unit
   - This is intentional for infinite conveyor appearance

## Architecture

```
registry.js
  └─ MaterialOptions { flowSpeed, flowDirection }
       ↓
terrainMaterials.js
  ├─ decideTerrainMatID() - Animated materials get unique IDs
  └─ createTerrainMat() - Creates FlowAnimationPlugin
       ↓
FlowAnimationPlugin (extends MaterialPluginBase)
  ├─ Hooks scene.onBeforeRenderObservable for time updates
  ├─ Defines shader uniforms (flowTime, flowDirection, flowSpeed)
  └─ Injects vertex shader code for position offset
       ↓
Babylon.js Material System
  └─ Compiles shaders with injected code
       ↓
GPU renders terrain with animated vertices
```

## Demo

The roblox-mini project includes a demo in `conveyorDemo.ts`:

- Red conveyor belt (1 block/sec, flowing east)
- Blue conveyor belt (1.5 blocks/sec, flowing south)

Run `npm run dev` and look near spawn coordinates for the demo strips.

## Future Enhancements

1. **Texture UV scrolling** - Extend plugin to animate texture coordinates
2. **Per-face directions** - Allow different flow directions on different block faces
3. **Variable flow patterns** - Non-linear flow (waves, turbulence)
4. **Gameplay integration** - Entity velocity changes when standing on conveyors

## Testing

```bash
# Build noa-engine
cd /Users/cullendudas/Documents/GitHub/noa
npm run build

# Build and run roblox-mini demo
cd /Users/cullendudas/Documents/GitHub/roblox-mini
npm run build
npm run dev
```

Look for the red and blue conveyor strips near spawn. The blocks should smoothly slide in their configured directions with seamless wrapping.
