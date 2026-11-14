# 20 picture levels and blockers — implementation ledger

Approved specification: user plan in the current chat, 2026-11-14.

- [x] Toolchain: Creator 3.8.8, shared resolver, explicit author exports.
- [x] Rules: stone, threshold lock, accessible solver/hints, reachable-state validator.
- [x] View: authored overlays, unlock feedback, first-mechanic tutorials, picture thumbnail.
- [x] Content: 20 immutable authored pictures, unique logical answers, contact sheet/report.
- [x] Flow: /20 progress, final collection completion, peek/retry preserved.
- [x] Verification: 36 tests, typecheck, author --check, fresh builds, all 20 gesture-completed and six responsive checks. Native Editor Preview/device profiling remain unverified; see PICTURE_LEVELS.md.

Ruling: implement in the selected workspace in place, preserving existing engine/import changes — the approved plan explicitly targets these changes and the running Creator project; no reset, stash, commit or new worktree.

Pre-flight: blocker schema is shared by authoring, reducers, solver and view. Lock availability is derived from found count, never a second mutable source of truth. Art pixels remain the same data for rules and finished picture. No image generator or replacement picture is involved.

Task 1: complete — shared toolchain uses package creator version and MEOW overrides; author default/check/preview do not write runtime source.

Task 2: complete — 5 blocker RED failures resolved. BFS covers every reachable correct subset, 2,622 across catalog. Old fixtures remain green.

Task 3: complete — overlay and prefab binding RED checks resolved; UI feedback uses existing cancellation. Authored sprite icons are code-native, material additions retain UUIDs.

Task 4: complete — pictures revised at draft stage, then frozen. Export does not modify approved pixels. Original four IDs/pixels retained. Contact sheet and full per-picture validation report produced.

Task 5: complete — /20 labels, finished collection, thumbnail, peek/reopen and first-mechanic tutorials integrated.

Review: one Important wave-timing bug fixed RED→GREEN; no other concrete Important findings. Ruling: use previous found count only for deferred exclusions, so a previously open lock never reappears. Full 36 tests pass.

Task 6: automated/build/browser checks complete — full runtime evidence and explicit remaining profiling/Editor/device boundaries in docs/PICTURE_LEVELS.md. Browser left at a fresh level 1; viewport reset. No commits or integration operations requested/performed.
