# Meow Pop Canva visual implementation

Approved design: user-supplied seven-package plan in this chat (2026-11-13).
Goal: cohesive sky/cream/lavender/gold toy skin, preserving the real 3D board and all four puzzles.
Stack: Creator 3.8.4, TypeScript, existing Node test harness; no runtime dependencies.

## Packages
- [x] 1. Baseline screenshots, resolve old Preview/source mismatch; style board.
- [x] 2. Sprite mascot expressions/token, generated logo, code-native UI/VFX, Nunito + OFL.
- [x] 3. Responsive gameplay skin, sprite hearts, badges, separate board-size label.
- [x] 4. Straight 0.92-cell caps / 0.24 depth, soft materials and cream/lavender tray.
- [x] 5. Sprite pools (32 3D, 128 2D), once-per-find shake, wave-safe timing/cancellation.
- [x] 6. Illustrated tutorial, 0.6s clean art, animated win/lose, confetti, peek.
- [x] 7. Preserve UUIDs, sync authoring/prefab, fresh Preview/build validation and docs.

## Constraints and interfaces
Preserve core/Levels and HoldInput. MascotView.setExpression('idle'|'happy'|'surprised', duration?) and reset(); GameEffects.cross/poof/clear plus celebrate(width,height). blastDuration owns unlock timing; generation invalidates old callbacks. Decorations never own board input. SpriteFrames/materials/fonts wired directly into authored GameRoot.
36 CSS px minimum cells at 360x480/640; buttons >=44 CSS px tall. Viewports: 360x480, 360x640, 390x844, 640x360, 844x390, 1280x720. 64 tiles, 32 shards, 128 sprite particles. Metallic 0 / roughness .42 / specular .15. Palette UI #7CCAFD/#FFF8EE/#7939CB/#FFD447/#44305F. Level colors unchanged.

## Verification
npm test; npm run typecheck; fresh Creator Web Mobile build; actual gestures on all four levels; Hint/Inspect/mark/wrong/retry/peek, rotation and Retry during blast, modal resize; screenshot states; browser frame/draw-call comparison where available. Physical device/network checks remain separate.

## Ledger
- Baseline: 20/20 tests + typecheck pass. HEAD is unborn, all project files untracked.
- Ruling: work in selected workspace, backup source/tools/prefab under temp/visual-baseline; no baseline commit/worktree possible without adopting unrelated user content.
- Pre-flight: layout -> controller -> prefab; mascot properties -> authoring; wave duration -> controller unlock -> pooled effects. Timing/cancellation must ship together.
- Ruling: retain existing three matching PNG mascots, import normalized copies; generate logo/token. No paid API fallback.
- Package 1: source/tools/prefab baseline backed up; portrait tutorial/gameplay/8x8/win/lose captured. Baseline landscape capture letterboxed by the browser and is not used for visual comparison.
- Packages 2–4: generated wordmark/head token, normalized three mascot expressions, Nunito 600/800 + OFL, code-native skin/atlas; responsive HUD and straight soft-material board integrated.
- Packages 5–6: sprite effects and expression clocks, bounded pools and independent late-puff lifetime; illustrated tutorial/opaque results/clean-art pause/confetti integrated.
- RED→GREEN: new layout contract, late puff duration, fixed-capacity particle/temporary-expression cancellation, authored skin wiring and scene expansion registration.
- Ruling: fresh build showed an unexpanded empty prefab placeholder; Scene._load requires root nestedPrefabInstanceRoots. Added registration in generator rather than flattening the linked prefab or adding runtime bootstrap workarounds.
- Final review: independent read-only reviewer reported two Important issues, no Critical/minors. Fixed stale-root camera/geometry retention and modal touch targets; regressions failed before changes and full suite returned 25/25 green.
- Runtime finding: modal parent's alpha cascaded into child card; moved dimmer into separate backdrop, added failing regression then passed it. Runtime card opacity now 1.
- Ruling: exported scene optimized away HDR ambient values while the runtime selected HDR. Apply neutral ambient through public color setters after the pipeline starts; palette albedos remain unchanged.
- Browser tooling: after tab changes, explicitly select the active test tab before changing viewport; do not use closures bound to a prior tab for evidence. Replaced affected final screenshots with captures from the active tab.
- Performance sample (360x640 level-one idle): baseline rAF p95 16.8ms/median16.7ms/draw39; skin p95 16.7ms/median16.7ms/draw27. Browser/compositor sample only, not direct GPU timing or device benchmark.
- Package 7: fresh Web Mobile build success at 17:59:29 Asia/Saigon; all four levels completed using actual holds (3 hearts each), 8x8 rotated during blast and continued, large-region Retry returned clean pools. Six viewport matrix observed; native Editor Preview remains explicitly unverified due the stale running Editor and unavailable UI control.
- Final benchmark rerun: p95 16.8ms / median16.7ms / draw27 (baseline p95 16.8ms / median16.7ms / draw39). No >15% frame-cadence regression in this sample; no claim about direct GPU or physical-device speed.
- Final evidence: docs/visual/after and docs/VERIFICATION.md. Viewport override reset, fresh level one left on http://127.0.0.1:8088/ . No commits/push/publication.

