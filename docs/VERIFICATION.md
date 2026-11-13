# Verification — Canva skin, 2026-11-13

## Automated checks

- `npm test`: **27/27 passing**, zero failures.
- `npm run typecheck`: exit 0 with Creator 3.8.4 bundled TypeScript.
- Existing four level definitions/core rules were preserved. Independent solver/logic tests still prove unique answers and non-backtracking completion.
- New RED→GREEN checks cover responsive gameplay/modal targets, bounded particles, independent late-puff lifetime, expression reset, stale-root retirement, authored skin bindings, opaque modal composition and linked scene prefab expansion.
- An independent read-only source reviewer found two Important issues (legacy board retirement and modal touch targets), no Critical/minor findings. Both were corrected and their regressions returned green.

## Fresh build

Latest verified build: `temp/builder/log/web-mobile11-13-2026 18-22.log`, **success at 18:23:00 Asia/Saigon**. CLI stdout: `temp/block-refresh-final.stdout.log`. Source, normalized/generated textures, fonts, materials and authored scene/prefab were included in this build. HTTP server: http://127.0.0.1:8088/ . A fresh playable level one is left ready.

Earlier attempts exposed a blank scene caused by missing `nestedPrefabInstanceRoots`. Engine source confirmed the expansion requirement; added registration and tested the fresh build. Later runtime confirmed GameRoot, logo, companion, all 64 authored cells and the pools were present. A translucent modal issue was independently measured and fixed by separating the dimmer from the card's parent; final card effective opacity is 1.

## Browser gameplay evidence

Tests used actual click/hold gestures, not calls that place cats or change puzzle state. DevTools reads were used only to inspect state/rendering/coordinates and sample timing.

- Final build completed **4/4, 5/5, 6/6 and 8/8** cats with **3 hearts retained** on every level; final “Hoàn tất demo” popup observed.
- Tap marked an answer; Hint cleared the marked singleton-color answer, reduced hints to 1, kept found count 0 and showed its explanation. Inspect showed region letters and highlighted all same-color cells; 8×8 displayed A–H.
- Holding a wrong cell charged one heart; holding it again retained the same heart count. Two other wrong cells caused loss, empty heart sprites and the surprised mascot. Retry reset hearts/hints/cells.
- Retry during a 4×4 blast and during the large yellow-region 8×8 blast returned to 0 cats, 3 hearts, 2 hints, no lock and zero active particles/shards after settling; no delayed old completion restored.
- Rotated 8×8 **during** its first blast to 640×360: retained 1/8, retired old effects, then successfully found another cat. Returned to portrait and completed the remaining cats.
- “Xem tranh” displayed the exact authored flat picture. Tapping it reopened the result; the confetti did not replay. Result/intro cards remained opaque and fitted short portrait/landscape.
- Runtime binding/loaded material/font checks and screenshots confirmed generated logo/head token, three character expressions, real 3D tray/tiles, icon buttons, sprite hearts, hint badge and sprite VFX.
- Final browser console **error list empty**. Known warnings: deprecated Creator `View.enableRetina` and synthetic viewport `Unexpected screen orientation: 13`; no associated stuck state or runtime error observed. CLI emits a build-config version/migration notice.

## Responsive matrix

All six viewports were checked on the current skin; 64-block 8×8 checked in short portrait and landscape as well as larger views. No board/control clipping observed.

| Viewport | 8×8 cell size (CSS px) | Evidence |
|---|---:|---|
| 360×480 | 36.5 | `visual/after/8x8-360x480.jpg` |
| 360×640 | 40.5 | `visual/after/8x8-360x640.jpg` |
| 390×844 | 43.875 | `visual/after/gameplay-390x844.jpg` |
| 640×360 | 36 | `visual/after/gameplay-640x360.jpg` |
| 844×390 | 39 | `visual/after/gameplay-844x390.jpg` |
| 1280×720 | 72 | `visual/after/gameplay-1280x720.jpg` |

Gameplay buttons and modal Confirm/Peek hit targets are >=44 CSS px at these sizes. Tutorial screenshots include 360×480, 360×640 and 640×360. Browser viewport overrides were reset after testing. A tooling episode produced mismatched host/emulated screenshots; affected final captures were replaced after explicitly selecting the active test tab. Baseline landscape capture is letterboxed and excluded from visual comparison.

## Previous skin benchmark (before the block refresh)

Historical sample from the preceding 17:59 skin build; this is not a new benchmark of the crowned blocks/unlit reveal pass. Same level-one idle board, 360×640 browser viewport, 120 frame intervals per sample:

| Metric | Before | Final build |
|---|---:|---:|
| Median rAF interval | 16.7 ms | 16.7 ms |
| p95 rAF interval | 16.8 ms | 16.8 ms |
| Engine draw calls | 39 | 27 |

This short compositor/frame-cadence sample did not show a >15% regression. It is **not** CPU work duration, direct GPU timing, a blast benchmark or a physical-device performance claim. An intermediate skin sample gave p95 16.7ms; the table uses the final fresh run.

## Artifacts and boundaries

- Visual style: `visual/STYLE.md`; comparison gallery: `visual/index.html`.
- Before/after screenshots: `visual/before` and `visual/after`; final ready-to-play image: `visual/after/demo.jpg`.
- Prompts/source/licensing: `ASSETS.md`; implementation/rulings: `IMPLEMENTATION.md` and approved plan ledger.
- **Fresh native Editor Preview remains unverified.** The running Preview served its older compiled scene/scripts after reload; native Creator UI control was not approved in this session. Refresh/reopen the project/scene in Creator before evaluating that Preview. Web Mobile is the verified current engine execution path.
- No physical device, ad-network SDK/package acceptance, audio change, blocker/booster expansion or publication was performed.
- No commit/merge/push: the selected repository has an unborn HEAD and an entirely untracked baseline. Work remains in the selected workspace; relevant original source/tools/prefab backup is in ignored `temp/visual-baseline`.



## Current block/particle follow-up

- Actual crowned 3D mesh, thicker caps and glossier material exported/imported; flat unlit reveal planes and their shader/material dependencies serialized into GameRoot. Level data unchanged.
- After finding cat 13 on 4×4, inspected **9 excluded cells**: each used its corresponding `Flat_*` material, **0 active dots**, **0 UI pixel overlays** covering the fragments. After settling: **0 particles, 0 shards, input unlocked**, 3 hearts. Saved `visual/block-refresh/blocks.jpg`, `burst.jpg`, `8x8.jpg`.
- Replayed all four levels on the refreshed build: 4/4, 5/5, 6/6, 8/8 with 3 hearts retained. Retry during a large 8×8 region burst reset to 0/8, 3 hearts and no active effects/lock.
- Source checks: 27/27 tests and typecheck pass. New regressions cover actual crown curvature/unit normals, color-only excluded presentation and exported unlit palette dependencies. Existing scene/interaction/solver tests remain green.
- An inspector query using an unavailable global MeshRenderer type produced a diagnostic log entry; corrected it to inspect the owning renderer directly. This was not caused by game interaction and did not mutate state.
- Native Editor Preview and physical device checks remain unverified; current evidence is from the fresh Web Mobile package.

