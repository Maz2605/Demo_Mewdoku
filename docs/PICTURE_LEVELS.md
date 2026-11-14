# Picture levels, stones and locks — 2026-11-14

The later selector/full-size outro feature is documented in [GALLERY_OUTRO.md](GALLERY_OUTRO.md). It replaces the small win thumbnail/peek presentation described in this feature's historical verification below; puzzle/blocker contracts are unchanged.

## Contract and data

20 pictures, 4×4–8×8, exactly N region colors on an N×N board. The same `cells`/`palette` feed rules, in-game colors, result thumbnail and finished picture. No separate replacement artwork. Frozen inputs: `tools/data/pictures.json`; runtime export: `assets/scripts/core/Levels.ts`. Original IDs `fish`, `paw`, `kitten`, `ginger` and their pixels are retained. New pictures were revised as drafts, then frozen; production authoring only reads them.

Stone cells are not candidates and do not accept mark/find actions. They remain colored, keep their overlay through automatic exclusions, and disappear in the final picture. Locks remain candidates but cannot be marked/searched before their total-found threshold (1/2). Colors and inspection remain visible. Exclusion removes a lock at the tile's wave reveal; reaching a threshold emits one `unlocked` event per surviving lock. Finding a cat never requires guessing a closed lock.

`cellAccess` derives availability from level/blockers, cell state and found count. There is no separately persisted lock flag. Reducer guards make blocked gestures free even if called outside the view. The logical solver keeps locked candidates in constraints but selects only accessible singles. Hints use the same solver and ignore incorrect manual marks, as before. The offline validator walks every reachable correct subset and requires a full logical continuation from each state.

## Ownership and integration

- `MeowGame`: state, blocked input messages, first-mechanic tutorials, progress, thumbnail and unlock pop feedback. Generation cancellation/unscheduling handles retry/resize/disable. Tutorial flags last for the session.
- `PixelCell`: authored stone/lock sprites and outlined threshold label; pure `blockerAppearance` preserves a closing lock overlay until deferred wave reveal and hides all obstacles when finished. Unlock pop uses the existing bounded cell tween; reset stops it.
- `Board3D`: existing 64-tile/32-fragment pools and material palettes. Stones do not join exclusion bursts. Finished rendering hides all 3D tiles and presents exact UI pixel colors.
- Author tooling: shared Creator 3.8.8 resolver, UUID-preserving view generator, two code-native SVG overlay icons. Only explicit `--export` writes runtime levels. No dependency installation or runtime procedural art.

## Authoring and progression

1–8 ordinary puzzles; 9–12 stones (1–3); 13–16 locks (threshold 1, then 2); 17–20 both. Contact sheet: [20 pictures](images/pictures.png). The numbered catalog keeps the approved picture sequence. Generated validation report: `level-validation.json`, including hashes, reachable-state counts and logical steps. Each picture has a unique answer; blocker count alone is not a difficulty metric.

Revise the draft manually if an image is illegible or not uniquely/logically solvable. Then run `node tools/author-levels.cjs --check --preview`, inspect the sheet, and explicitly `--export`. Palette additions require `node tools/author-view.cjs`; that command replaces prefab/scene authoring, so do not use it for routine checks.

## Verification

### Automated and review

- Final `npm test`: **36/36 passed**. `npm run typecheck`: exit 0 with Creator 3.8.8 generated declarations. `node tools/author-levels.cjs --check`: all 20 passed. `git diff --check`: no whitespace errors.
- The 20 offline reports cover **2,622 reachable correct-cat subsets** (16–256 per picture), each with a complete accessible logical continuation. Answer search does not read authored cats; logical solve is also checked with `cats: []`.
- RED→GREEN runs: missing blocker behavior (5 failures → all pass), absent 20-picture input → catalog pass, absent overlays/bindings (2 failures → pass). Independent read-only review found one wave-timing issue: the cat that reaches a lock threshold can also exclude it. Added the failing crossing-threshold case and corrected deferred presentation; already-open locks do not reappear. Full suite returned green.

### Fresh Web Mobile builds and browser gestures

- Creator CLI imported/generated assets and finished the Web Mobile build. Final log: `temp/build-final.stdout.log`, `build Task (web-mobile) Finished in (14 s)`. A previous cold-engine build took 108 s. Local server: http://127.0.0.1:8088/ . Build process logs also include Electron shared GPU-cache access warnings, an asset-db timing warning and worker shutdown `SIGTERM` diagnostics; these are not described as a pristine CLI run. The exported package loaded and browser gameplay produced no console errors.
- Completed **all 20 pictures** with actual hold gestures, retaining 3 hearts on each completed run. Observed the final “Hoàn thành bộ tranh” modal, correct thumbnail, final clean picture, peek/reopen without another celebration, and “Chơi từ đầu” action. The final restart action itself was not clicked; the final package was reloaded for the smoke test below. Used the offline logical paths for input coordinates; no runtime state placement or cat-collection methods were called.
- Tested stone gestures: 0 found, 3 hearts, no mark/search. Tested closed-lock gestures: same free rejection. Hint on the first lock board selected an open cell, spent one hint, and did not collect a cat. Both threshold-1 and threshold-2 boards completed.
- On mixed level 17, after finding the second cat and observing “Đã mở 2 khóa!”, Retry restored 0/8, 3 hearts, 2 hints, both locks and stones, with no stale completion. Continued and completed the level. Level 14 retained its two found cats through an orientation change and then completed.
- Reviewed mixed 8×8 at CSS viewport sizes **360×480, 360×640, 390×844, 640×360, 844×390, 1280×720**. Board, actions and overlays remained in their intended areas. DOM viewport dimensions were checked; captures include in-app browser fitting/letterboxing. Existing geometry tests enforce the 36 CSS px minimum portrait cell and 44 CSS px actions. The browser viewport override was reset afterward.
- A browser scaling change during QA invalidated a coordinate helper. A diagnostic gesture hit an adjacent wrong cell; Retry restored it before the successful level-17 run. This is not counted as game-generated heart loss. The corrected helper passes current dimensions explicitly.
- The full 20-picture traversal used the first fresh package. After the independent overlay timing fix, rebuilt the final package and reloaded it: start tutorial, correct hold, Retry during blast, 0/4 and 3 hearts restored; console error list empty. The final-wave change is additionally covered by its regression test. Final package is left at level 1 ready to play.

Screenshots under `docs/visual/picture-levels`: stone, locks, six responsive views, retry-reset, collection-complete, final-picture and ready. Contact sheet: `docs/images/pictures.png`.

### Boundaries

- No physical-device test, CPU/GPU profiler benchmark or reliable final 8×8 frame-time measurement was performed. Browser completion and responsive checks do not establish device performance. Some batched gestures landed during the animation lock; remaining cells were replayed after settling.
- Native Editor UI access timed out awaiting approval; fresh native Editor Preview was not evaluated. CLI import/build and browser execution were available.
- Picture recognition was visually inspected by the implementer, not tested with independent players. Low-resolution artwork remains an authored approximation; the frozen source can be revised deliberately without the export tool repainting pixels.
- No dependencies installed, no commit/merge/push/publication. Existing engine and model-import changes were preserved. Historical 27-test/4-level reports in older skin documents are not current evidence for this feature. Old unborn-HEAD notes describe a past session only.
