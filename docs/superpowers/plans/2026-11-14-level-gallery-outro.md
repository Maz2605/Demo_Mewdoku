# Level gallery and picture outro

User request: add level selection and an outro emphasizing the finished picture.

Confirmed by the user: all 20 levels open; outro on every win, special collection text on level 20. Initially proceeded with these recommended defaults while the optional asynchronous choices were pending; the user's subsequent reply confirmed both. No persistent progression or new picture art.

Design: authored gallery modal (4×5 portrait, 5×4 landscape) with exact-data thumbnails and close/resume; a dedicated full-screen win presentation with an opaque dark-purple backdrop, large crisp picture, cream frame, soft glow, brief reveal and two actions. Portrait text/buttons group around the art, landscape uses art-left/actions-right. The picture stays visible indefinitely. All selection routes reset the chosen level. Opening/closing the menu preserves the current game; changing level cancels old effects. Full-screen win replaces the small result card for wins; loss/tutorial stay unchanged. Native Creator 3.8.8, existing palette and UUIDs preserved.

- [ ] Geometry/reveal regression tests, pure gallery layouts and outro clock.
- [ ] Data-native picture assets and serialized GalleryView.
- [ ] Controller: menu entry/start screen, choose/resume, first tutorials, large win flow.
- [ ] Runtime: direct level jumps, close/resume, wins, replay/final outro, responsive and interrupted effects.
- [ ] Review, checks, evidence and docs.
