# Text Subsystem Split Plan

## Goals & Constraints
- Keep the public API exactly the same (`import { Text } from '../lib/text.js'` continues to work).
- Reduce the 3 monolithic files (`text.js`, `textLighting.js`, `textShadow.js`) into composable modules under `src/lib/text/` without functional regressions.
- Eliminate existing and potential leaks by making ownership/lifecycle of Babylon resources explicit and ensuring observers, lights, and meshes are released when text is disposed.
- Preserve optional dependency handling (lazy meshwriter import) and dyslexia-focused rendering features.

## Current Responsibilities (condensed)
- `src/lib/text.js`
  - Owns initialization flow, meshwriter loading, font registration, default options, text creation, shadow + lighting integration, ready callbacks, and `TextHandle` lifecycle.
  - Contains color/contrast helpers and Babylon material configuration.
- `src/lib/textLighting.js`
  - Implements camera-relative key/fill lights, mesh registration/LOD handling, and scene light isolation observers in one class.
- `src/lib/textShadow.js`
  - Handles creation of shared shadow resources, per-text instance tracking, measurement, raycasting, and frame updates.

These concerns are tightly coupled and large enough that each file is hard to reason about or audit for leaks. Shadow/light managers also mix resource creation, config, mesh bookkeeping, and per-frame behaviors.

## Proposed Directory Layout
```text
src/lib/text/
  index.js                 # Stable entry: exports Text class
  TextSystem.js            # Former Text class minus helpers
  TextDefaults.js          # defaultOptions + constructor defaults
  ReadyState.js            # initFailed/ready flags + callback queue
  MeshWriterLoader.js      # lazy import + font registration tools
  TextFactory.js           # createWorldText/createBillboard/update logic
  MaterialConfigurator.js  # color processing + Fresnel/material setup
  TextHandle.js            # standalone class
  logging.js               # small logger util w/ namespaced warnings
  lighting/
    index.js               # export TextLighting
    TextLighting.js        # orchestrates submodules, retains public API
    LightPresets.js        # PRESETS map + validation
    LightFactory.js        # Babylon light creation/config
    MeshRegistry.js        # add/remove meshes, LOD switching, WeakMap cleanup
    SceneLightIsolation.js # observer wiring for onNewLightAdded
    DirectionController.js # camera-relative direction math + reusable vectors
  shadows/
    index.js               # export TextShadowManager
    ShadowManager.js       # orchestrates rest, keeps API
    ShadowResources.js     # CreateDisc/material/texture setup & disposal
    ShadowInstances.js     # Map of textId -> instance (separate from manager)
    ShadowMeasurement.js   # bounding-box measurement utilities
    ShadowUpdater.js       # per-frame update w/ raycast + fade logic
```

> The filenames are descriptive but flexible; the essential part is to isolate concerns so each module stays <200 lines and focuses on one job.

## Module Breakdown & How Existing Logic Maps
1. **index.js**
   - Default export shim that re-exports `Text` from `TextSystem.js`.
   - `src/lib/text.js` will be trimmed down to `export { Text } from './text/index.js'` to keep consumers unchanged.
2. **TextSystem.js**
   - Houses the class definition, but delegates:
     - meshwriter import + readiness to `MeshWriterLoader` & `ReadyState`.
     - default option merges to `TextDefaults` helper.
     - mesh/material creation to `TextFactory` + `MaterialConfigurator`.
     - handles/shadows/lighting interactions by composing `TextHandle`, `shadowManager`, `textLighting`.
     - render observer registration via a small helper so cleanup is centralized.
3. **MeshWriterLoader.js**
   - Encapsulates `import('meshwriter')`, default font registration, and storing `MeshWriter`, `registerFont`, and contrast helpers.
   - Returns a struct `{ writer, contrastUtils, registerFont }` or throws a typed error so TextSystem can set `initFailed` cleanly.
4. **ReadyState.js**
   - Manages `ready`, `initFailed`, `_readyCallbacks`, `_flushReadyCallbacks` logic.
   - Provides methods `onReady(cb)` and `setReady(boolean)` to avoid duplication.
5. **MaterialConfigurator.js**
   - Moves `_processContrastColors` and the Fresnel setup for the Babylon material into one place.
   - Accepts `contrastUtils` and `textLighting` state so only this module knows how to manipulate `Color3`/`FresnelParameters`.
6. **TextFactory.js**
   - Exposes `createWorldText`, `createBillboardText`, and `updateText` as pure-ish helpers that receive dependencies (writer, defaults, lighting manager, shadow manager, MaterialConfigurator).
   - Returns `TextHandle` instances supplied by `TextHandle.js`.
7. **TextHandle.js**
   - Extracted verbatim but gains explicit dependency injection for cleanup (lighting/shadow hooks) to avoid circular imports.
8. **lighting/**
   - `TextLighting.js` stays the public class but delegates to:
     - `LightPresets.js` for preset definitions and validation/clamping of custom offsets.
     - `LightFactory.js` for constructing Babylon lights and the observer registration (ensures disposal unsubscribes to avoid orphaned lights).
     - `MeshRegistry.js` for tracking `Set`/`WeakMap` and cleaning disposed meshes; isolates `_switchToTextLight/_switchToWorldLight` logic.
     - `SceneLightIsolation.js` for hooking `scene.onNewLightAddedObservable` and filtering lights.
     - `DirectionController.js` for per-frame vector math, keeping static reusable vectors private.
   - This split makes it easier to reason about potential leaks (registries own their sets and release them on dispose).
9. **shadows/**
   - `ShadowManager.js` composes resources + updater.
   - `ShadowResources.js` handles CreateDisc/material/texture creation/freeze/dispose.
   - `ShadowInstances.js` owns the `Map` and cleanup (`removeShadows`, `hasShadows`).
   - `ShadowMeasurement.js` exposes `_measureTextMesh` logic.
   - `ShadowUpdater.js` runs `updateShadows`, accepts dependencies (noa references, measurement helper, instances map) and returns IDs to prune.

## Memory / Leak Mitigations Embedded in the Split
- Lifecycle modules (`ReadyState`, `LightFactory`, `ShadowResources`) will expose `dispose()` hooks and TextSystem will call them from a single place.
- Registries (`MeshRegistry`, `ShadowInstances`) will expose `attach(mesh)`/`detach(mesh)` and internally use `mesh.onDisposeObservable.add` to auto-detach if a mesh is disposed elsewhere.
- Render observers and scene observers will be wrapped in tiny helper classes that store the observable token and clear it deterministically, preventing hanging closures.
- Shadow updater will stop raycasting for handles marked disposed and allow GC by deleting entries from the map immediately.

## Migration / Implementation Steps
1. **Bootstrap
   1. Create entry files (`src/lib/text/index.js`, `TextSystem.js`, etc.) with exports mirroring the existing API.
   2. Convert `src/lib/text.js` into a thin wrapper re-exporting from the new index.
2. **Text System Extraction**
   1. Move the `Text` class into `TextSystem.js` and swap internal helpers for imports (`TextDefaults`, `ReadyState`, etc.).
   2. Extract `_processContrastColors` + material logic into `MaterialConfigurator` and update call sites.
   3. Extract `TextHandle` into its own file and update creation/disposal code.
   4. Add dependency-injection seams so lighting/shadow modules are passed in from `TextSystem`.
3. **MeshWriter + Ready State Modules**
   1. Implement `MeshWriterLoader.load(noa, opts)` returning everything `TextSystem` needs.
   2. Move ready-callback handling into `ReadyState` to reduce noise in `TextSystem`.
4. **Lighting Split**
   1. Move existing `TextLighting` class to `lighting/TextLighting.js` unchanged.
   2. Incrementally peel out helpers into the proposed submodules, ensuring imports remain internal to `lighting/`.
   3. Keep `export { TextLighting } from './lighting/index.js'` so other modules still import from `'./textLighting.js'` until downstream updates happen.
5. **Shadow Split**
   1. Move `TextShadowManager` to `shadows/ShadowManager.js` and add a stable `shadows/index.js` re-export.
   2. Extract resource creation, measurement, and per-frame update loops into helper files to make it easier to audit for leaks.
6. **Compatibility Layer**
   - Update any internal imports (e.g., `import { TextShadowManager } from './text/shadows/index.js'`) but keep original `./textShadow.js` and `./textLighting.js` files as re-export shims until all call sites transition.
   - Once confident, optionally replace shims with `export * from './text/shadows/index.js'` etc. while keeping filenames for backwards compatibility.
7. **Validation**
   - Add targeted smoke tests or debug scripts to create/dispose text repeatedly to check for lingering meshes/lights.
   - Use Babylon inspector or custom instrumentation to ensure `scene.lights` and `_allTextMeshes` stop growing after disposing handles.
   - Manual testing: spawn text, toggle camera-light presets, rebase world, confirm shadows/lights respond correctly.

## Testing & Verification Strategy
- **Unit-ish tests**: if feasible, add headless tests around `MaterialConfigurator` and `ReadyState` to keep behavior identical (color derivation, callback ordering).
- **Integration**: create a dev command/script that spawns/destroys hundreds of text handles while monitoring memory/logs.
- **Regression checklist**: verify default font loads, custom fonts register, text lighting toggles work, and shadows respect blur/opacity settings.
- **Leak watch**: instrument registries (temporary counters/logs) ensuring `Set` sizes drop back to zero after dispose.

## Open Questions for Follow-up Work
- Do we want to expose the new modules (`MaterialConfigurator`, `MeshWriterLoader`) publicly, or keep them internal to avoid API churn?
- Should we adopt tree-shaking-friendly exports (e.g., `export class Text` vs default) for lighting/shadow modules once shims are removed?
- Are there additional diagnostics we want (e.g., devtools panel to inspect registered text meshes) while touching this area?
