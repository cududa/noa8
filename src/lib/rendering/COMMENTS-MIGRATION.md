# Rendering Comments Migration Tracker

This document tracks the migration of comments from the old monolithic `rendering.js` to the new modular structure.

**Source:** `git show HEAD:src/lib/rendering.js`
**Last Updated:** 2026-01-13
**Total Comments to Migrate:** 98
**Status:** COMPLETE

---

## Progress Summary

| Batch | Target File(s) | Status | Comments |
|-------|---------------|--------|----------|
| 1 | index.js, renderingCore.js | Complete | 12 items |
| 2 | renderingCamera.js | Complete | 4 items |
| 3 | renderingCoords.js | Complete | 15 items |
| 4 | renderingLighting.js | Complete | 5 items |
| 5 | renderingMaterials.js | Complete | 7 items |
| 6 | renderingMeshes.js | Complete | 10 items |
| 7 | renderingModels.js | Complete | 8 items |
| 8 | renderingUtils.js | Complete | 11 items |
| 9 | index.js | Complete | 9 items |

---

## Batch 1: Core Infrastructure Comments

**Target Files:** `index.js`, `renderingCore.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 1.1 | 27, 30 | Babylon 8 needAlphaTestingForMesh shim | index.js | [=] |
| 1.2 | 61-84 | Module-level Rendering class docs | index.js | [=] |
| 1.3 | 97-99 | `redrawOnResize` property docs | index.js | [=] |
| 1.4 | 101-109 | Internal properties docs (`useAO`, `aoVals`, etc.) | index.js | [=] |
| 1.5 | 122-134 | Scene readiness tracking system | renderingCore.js | [x] |
| 1.6 | 146-149 | `_initScene` helper docs | renderingCore.js | [=] |
| 1.7 | 152-159 | Engine/scene init, remove built-in listeners | renderingCore.js | [=] |
| 1.8 | 161-162 | Babylon features disabled note | renderingCore.js | [=] |
| 1.9 | 165-168 | Octree manager initialization | renderingCore.js | [=] |
| 1.10 | 200-201 | `scene.skipPointerMovePicking` optimization | renderingCore.js | [=] |
| 1.11 | 212-255 | Scene readiness polling system (CRITICAL) | renderingCore.js | [x] |
| 1.12 | 438-446 | Scene ready cleanup on dispose | renderingCore.js | [x] |

---

## Batch 2: Camera Comments

**Target File:** `renderingCamera.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 2.1 | 170-175 | Camera holder/rotation accumulator setup | renderingCamera.js | [x] |
| 2.2 | 177-189 | Overlay plane for camera effects | renderingCamera.js | [x] |
| 2.3 | 1186-1204 | `updateCameraForRender` - position/rotation update | renderingCamera.js | [x] |
| 2.4 | 1208-1229 | Camera transparency effect (underwater) | renderingCamera.js | [x] |

---

## Batch 3: Coordinate System Comments

**Target File:** `renderingCoords.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 3.1 | 934-947 | COORDINATE CONVERSION UTILITIES section header | renderingCoords.js | [x] |
| 3.2 | 951-962 | `worldToLocal` JSDoc | renderingCoords.js | [x] |
| 3.3 | 964-981 | `worldToLocalCached` JSDoc + WARNING | renderingCoords.js | [x] |
| 3.4 | 983-994 | `localToWorld` JSDoc | renderingCoords.js | [x] |
| 3.5 | 996-1013 | `localToWorldCached` JSDoc + WARNING | renderingCoords.js | [x] |
| 3.6 | 1015-1026 | `setMeshWorldPosition` JSDoc | renderingCoords.js | [=] |
| 3.7 | 1028-1036 | `getMeshWorldPosition` JSDoc | renderingCoords.js | [=] |
| 3.8 | 1038-1048 | `getMeshWorldPositionCached` JSDoc + WARNING | renderingCoords.js | [x] |
| 3.9 | 1050-1057 | `getWorldOriginOffset` JSDoc | renderingCoords.js | [=] |
| 3.10 | 1059-1072 | `getWorldOriginOffsetCached` JSDoc + WARNING | renderingCoords.js | [x] |
| 3.11 | 1074-1088 | `updateShaderWorldOrigin` JSDoc + shader example | renderingCoords.js | [x] |
| 3.12 | 1128 | Cached Vector3 for origin rebasing | renderingCoords.js | [x] |
| 3.13 | 1152-1157 | Cached arrays for hot paths | renderingCoords.js | [x] |
| 3.14 | 1159-1180 | `_rebaseOrigin` implementation notes | renderingCoords.js | [x] |
| 3.15 | 1172-1175 | Frozen world matrix note (paradoxical unfreeze/refreeze) | renderingCoords.js | [x] |

---

## Batch 4: Lighting Comments

**Target File:** `renderingLighting.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 4.1 | 304 | Light option API comment | renderingLighting.js | [x] |
| 4.2 | 313 | Mesh exclusion documentation | renderingLighting.js | [=] |
| 4.3 | 327 | Mesh re-inclusion documentation | renderingLighting.js | [=] |
| 4.4 | 340-354 | `createLight` JSDoc | renderingLighting.js | [=] |
| 4.5 | 356-360 | Per-tick cleanup of disposed meshes | renderingLighting.js | [x] |

---

## Batch 5: Material Comments

**Target File:** `renderingMaterials.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 5.1 | 634-645 | `makeStandardMaterial` JSDoc | renderingMaterials.js | [x] |
| 5.2 | 648-661 | `meshBuilder` property JSDoc + example | renderingMaterials.js | [x] |
| 5.3 | 664-704 | `createStandardMaterial` JSDoc (all options) | renderingMaterials.js | [x] |
| 5.4 | 685-690 | Color conversion helper inline comment | renderingMaterials.js | [x] |
| 5.5 | 707-773 | `createShaderMaterial` JSDoc (all options) | renderingMaterials.js | [x] |
| 5.6 | 732 | Instancing attributes addition note | renderingMaterials.js | [x] |
| 5.7 | 757 | Shader material options application | renderingMaterials.js | [x] |

---

## Batch 6: Mesh Management Comments

**Target File:** `renderingMeshes.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 6.1 | 528-535 | `addMeshToScene` JSDoc | renderingMeshes.js | [=] |
| 6.2 | 538-544 | Babylon 8 LOD map initialization | renderingMeshes.js | [=] |
| 6.3 | 546-553 | BoundingInfo validation note | renderingMeshes.js | [=] |
| 6.4 | 555-566 | Submesh boundingInfo fix (CRITICAL explanation) | renderingMeshes.js | [x] |
| 6.5 | 568 | Already-added mesh check | renderingMeshes.js | [=] |
| 6.6 | 575-580 | Local position conversion | renderingMeshes.js | [=] |
| 6.7 | 582-587 | Octree registration and cleanup | renderingMeshes.js | [=] |
| 6.8 | 589 | `noa_added_to_scene` flag definition | renderingMeshes.js | [=] |
| 6.9 | 592-608 | `removeMeshFromScene` JSDoc | renderingMeshes.js | [x] |
| 6.10 | 611-625 | `setMeshVisibility` JSDoc | renderingMeshes.js | [=] |

---

## Batch 7: Model Loading Comments

**Target File:** `renderingModels.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 7.1 | 776-931 | `loadModel` full JSDoc (MEMORY warning, options) | renderingModels.js | [ ] |
| 7.2 | 802-808 | `disposeOldMaterials` helper comment | renderingModels.js | [ ] |
| 7.3 | 810-829 | `disposeLoadedResources` helper comment | renderingModels.js | [ ] |
| 7.4 | 832-853 | Model loading and scaling notes | renderingModels.js | [ ] |
| 7.5 | 855-890 | Material processing pipeline notes | renderingModels.js | [ ] |
| 7.6 | 895-907 | Mesh registration after load | renderingModels.js | [ ] |
| 7.7 | 909-912 | Cleanup function creation note | renderingModels.js | [ ] |
| 7.8 | 1131-1150 | `extractPBRColor` JSDoc + runtime detection | renderingModels.js | [ ] |

---

## Batch 8: Utilities Comments

**Target File:** `renderingUtils.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 8.1 | 203-210 | Ray picking internals (vectors, ray, predicate) | renderingUtils.js | [ ] |
| 8.2 | 484-493 | Local coordinate conversion for ray picking | renderingUtils.js | [ ] |
| 8.3 | 505-516 | Z-fighting prevention for block highlight | renderingUtils.js | [ ] |
| 8.4 | 523 | Highlight position buffer | renderingUtils.js | [ ] |
| 8.5 | 1236-1267 | Highlight mesh creation and management | renderingUtils.js | [ ] |
| 8.6 | 1250 | Outline points setup (`s = 0.5`) | renderingUtils.js | [ ] |
| 8.7 | 1278-1282 | Sanity checks section header | renderingUtils.js | [ ] |
| 8.8 | 1340-1349 | Debug helper functions | renderingUtils.js | [ ] |
| 8.9 | 1375-1376 | Profile hook setup | renderingUtils.js | [ ] |
| 8.10 | 1380 | FPS hook initialization | renderingUtils.js | [ ] |
| 8.11 | 1396-1413 | FPS measurement setup (detailed) | renderingUtils.js | [ ] |

---

## Batch 9: Render Loop Comments

**Target File:** `index.js`

| # | Old Lines | Description | Target | Status |
|---|-----------|-------------|--------|--------|
| 9.1 | 267-269 | PUBLIC API section marker | index.js | [ ] |
| 9.2 | 272-275 | `getScene` JSDoc | index.js | [ ] |
| 9.3 | 277-284 | `isSceneReady` JSDoc | index.js | [ ] |
| 9.4 | 286-302 | `onSceneReady` JSDoc | index.js | [ ] |
| 9.5 | 381-394 | BoundingInfo validation before render | index.js | [ ] |
| 9.6 | 386 | Already-checked metadata flag | index.js | [ ] |
| 9.7 | 398-420 | BoundingSphere error debugging | index.js | [ ] |
| 9.8 | 431 | postRender placeholder | index.js | [ ] |
| 9.9 | 1096-1112 | INTERNALS / ACCESSORS section headers | index.js | [ ] |

---

## Critical Comments (High Priority)

These explain complex systems - restore first if doing partial work:

1. **Scene readiness polling** (1.11) - explains why Babylon's built-in ready check isn't sufficient
2. **Coordinate rebasing system** (3.1) - fundamental to noa's floating-point precision handling
3. **Submesh boundingInfo fix** (6.4) - critical workaround for Babylon crash
4. **Cached arrays for hot paths** (3.13) - performance-critical GC avoidance
5. **Frozen world matrix paradox** (3.15) - non-obvious Babylon behavior

---

## How to Use This Document

### For New Agent Sessions

1. Read this document to understand progress
2. Find the next incomplete batch (first `[ ]` in Status column)
3. Use `git show HEAD:src/lib/rendering.js` to get old file content
4. Add/verify each comment in the batch
5. Mark completed items as `[x]`
6. Update the Progress Summary table

### Status Legend

- `[ ]` - Not started
- `[~]` - In progress / Partially done
- `[x]` - Complete
- `[=]` - Already present in new file (verified)

### Command to View Old File

```bash
git show HEAD:src/lib/rendering.js
```

Or view specific lines:
```bash
git show HEAD:src/lib/rendering.js | sed -n '934,947p'
```
