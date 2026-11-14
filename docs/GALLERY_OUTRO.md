# Level selection and picture outro — 2026-11-14

## Behavior

The user confirmed both choices: all 20 pictures are immediately selectable, and every won level has a large picture outro. The final level uses a collection-complete title. No save/progression service was added; completion checkmarks last for the current session.

Startup opens “Chọn tranh”. The same menu is accessible from the gameplay header and the outro. Close resumes the current board, hearts, hints and found cats; selecting any card starts that level fresh. Opening it during a blast cancels the old visual callbacks and renders the current logical state before showing the menu. Direct jumps to a mixed-blocker level chain the base tutorial, stone explanation and lock explanation once per session.

After the final cat's blast and clean-picture pause, a dedicated outro replaces the small win popup. Its opaque purple backdrop hides the HUD; a cream frame and soft glow surround the exact finished picture. A 0.65-second reveal settles before actions enable at 1 second. The image remains visible indefinitely. Portrait title/name/actions group around the picture; landscape places picture left and actions right. Confetti stays behind the frame. “Tranh tiếp theo” advances, “Chọn tranh” opens the menu; level 20 offers “Chơi từ đầu”. Closing the menu from a won board returns to the already-settled outro without another celebration.

## Ownership and authoring

- `core/Gallery.ts`: selector/outro geometry and a callback-free reveal clock.
- `view/GalleryView.ts`: serialized selector cards, image frames, outro presentation and button callbacks. It does not own puzzle state. Resize settles the reveal; hide/reset discards it. Selection callbacks reject invalid indices and inactive controls.
- `MeowGame`: level changes, session completion marks, tutorial sequencing, menu resume, input gates and generation cancellation. Existing loss/retry behavior and puzzle rules remain unchanged.
- `tools/picture-assets.cjs`: generates nearest-neighbor PNGs from each runtime level's original `cells` and `palette`, not a replacement illustration. `author-view` binds these 20 assets to both cards and outro and retains existing UUIDs. Existing 64-cell board, shard and particle pools remain bounded.

When changing pictures: export validated levels, run `node tools/picture-assets.cjs`, then deliberately regenerate the authored view if bindings change. Do not run view generation for routine verification; it overwrites authored layout customization.

## Verification

- Automated: 40 tests pass; typecheck passes with Creator 3.8.8. Tests cover gallery bounds/touch targets/readable base fonts at six viewports, header button clipping, reveal settle/reset, complete serialized catalog/input blockers, dark card-title ink and decoded image pixel identity with nearest sampling.
- Review: independent read-only review found no Important/Critical lifecycle or flow bugs. Its minor 4:3 mascot clipping was clamped. Runtime discovered white-on-cream titles and a cropped compact-header button; both received RED-to-GREEN regressions before fixes. Mobile card fonts were increased with a geometry regression.
- Fresh CLI builds and final browser evidence are recorded below after the last smoke run.

Native Editor Preview, physical devices, persistence and CPU/GPU profiling are outside this feature's verified runtime evidence. Existing Creator build warnings about shared cache/atlas assets are not hidden or treated as gameplay errors.
