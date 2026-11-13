# Implementation record — Canva skin

## Approved contract

Seven-package visual upgrade (2026-11-13): cohesive candy/sky/orange-kitten skin, keeping Creator 3.8.4, real 3D board, four existing puzzles and core gameplay. Full plan/ledger: `superpowers/plans/2026-11-13-canva-visual.md`; style: `visual/STYLE.md`.

## Implemented

- Golden transparent generated wordmark and matching generated head token; preserved three existing kitten expressions, normalized to shared 1024×1024 canvases.
- Code-native sky/cloud/paw/panel/button/icon/heart/mark/VFX textures, small-sprite auto-atlas, static Nunito 600/800 with OFL.
- Serialized gameplay/modals/mascot/frame/font references in GameRoot; separate size badge, three heart sprites, Hint badge and responsive action controls.
- MascotView + pure expression clock own idle/happy/surprised and cancellation. Removed per-frame procedural mascot drawing from controller.
- Crowned .90-cell caps / .42 depth, unlit reveal planes, cream/lavender tray, nonmetallic roughness .28/specular .35. Shared 64 tiles/32 fragments and 1024 RenderTexture retained.
- Sprite-only ray/puff/sparkle/confetti effects use 128 authored sprites and fixed-capacity particle model. Drop excess; late emissions have independent ages. Single bounded shake per find; blastDuration includes the final puff.
- Illustrated tutorial, opaque cream result card, short animated reveal, 0.6-second clean-picture pause, one celebration burst, Retry and peek preserved. Modal actions have >=44 CSS px touch targets in the required matrix.
- Retry/resize/disable invalidate scheduled work, clear pools and expressions, cancel tweens and restore the effect root to board space.

## Decisions and integration findings

- HEAD is unborn and baseline is entirely untracked. Changes were made in place with source/tools/prefab backups under `temp/visual-baseline`; no commit/worktree/merge/push.
- Fresh CLI build reproduced blank output: the scene's linked prefab existed but was not expanded. Owning engine source (`Scene._load` → `expandNestedPrefabInstanceNode`) requires `scene._prefab.nestedPrefabInstanceRoots`. Generator now registers GameRoot there; regression added. Ordinary Editor-expandable prefab instance retained.
- A dimmer Sprite on the modal parent cascaded its alpha into the card. Runtime measured card effective opacity .72549. Moved dimming onto a sibling backdrop; regression prevents reintroducing translucent result cards.
- Independent reviewer found two Important issues: stale authored Preview roots could leave old board cameras/geometry active; modal action hitboxes were too short in landscape. Added failing regressions, retired old children while preserving Canvas screen camera, and increased/spaced modal actions. Full suite returned green.
- Existing Editor Preview compiled target still served the earlier skin after browser reload. Native Creator UI control was not approved; current visual acceptance uses a fresh CLI Web Mobile build. Do not describe the running old Preview as verification of the new skin.

## Checks

See `VERIFICATION.md` for actual current runs, screenshots, timing samples and environment boundaries. Historical earlier-build results are superseded, not evidence for this skin.

## Follow-up: stronger blocks, clean reveal and revised burst

User requested a clearer 3D block shape, color-only exploded cells without dots, and a revised particle burst. RoundedBlock now has a smoothly crowned face (inverse-transpose normals), wider bevel, .90-cell footprint, .42-cell depth, 7-degree tilt and roughness .28/specular .35. All palette data is unchanged.

Excluded cells reveal an unlit ColorPlane at their own wave break, retaining the authored hue and no automatic markers. These planes remain inside the 3D pass below shards; UI pixel sprites are reserved for the final clean picture, avoiding particle occlusion. Board3D.onTileBreak also supplies the cell index; the controller updates that cell's overlays when the break occurs. Deferred state does not prematurely replace unbroken caps.

The revised burst emits three small rotating chips per tile, at most 32 active; excess chips are dropped rather than replacing flying ones. Velocity/size scale with the cell. Two low-opacity colored dust wisps and one white glint replace the dense golden spark spray, and thin cross rays disappear after .24 seconds. Confetti on completion remains unchanged. Node/material/mesh identities already in use are preserved; ColorPlane and its unlit palette are new authored dependencies.

