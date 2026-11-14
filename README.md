# Meow Pop — 20 picture puzzles

Cocos Creator **3.8.8**. Twenty Vietnamese pixel-art puzzles (4×4–8×8), each with one unique answer and a non-backtracking logical solution. The board itself is the finished picture. Stone and threshold-lock cells introduce new deductions while retaining the original cat rules. Real 3D candy blocks sit inside a cream/lavender tray with the orange kitten, golden logo and sky/cloud skin.

## Run

Open `assets/scenes/MeowPop.scene` in Creator and Preview. The scene owns an ordinary linked instance of `assets/resources/prefabs/GameRoot.prefab`. After external changes, refresh/reopen the scene so the Editor imports the latest assets. The scene registers its linked root in `nestedPrefabInstanceRoots`; omitting this produces an empty placeholder in builds.

Build Web Mobile:

```powershell
& 'C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe' --project 'F:/Cocos/Demo_Mewdoku' --build 'configPath=F:/Cocos/Demo_Mewdoku/tools/build-web.json'
node tools/serve.cjs
```

Open http://localhost:8088/ or http://127.0.0.1:8088/ through HTTP. The current config is a debug browser build, not an ad-network package.

## Play

- Choose any of the 20 pictures at startup or use “Chọn tranh” in the header. Closing the menu resumes the board; choosing a card restarts that level. Checkmarks indicate pictures completed this session.
- One cat per row, column and color; cats cannot touch, including diagonally. Disconnected cells of the same color share one region.
- Tap to toggle ×. Hold an unmarked cell for 0.4 seconds to search. Movement >12 UI units or touch-cancel cancels the hold; one pointer owns input.
- Correct searches exclude the row/column/color and neighbors. Blocks break in a wave; no gravity/refill. Three hearts; a repeated guess at the same wrong cell does not charge again.
- Two hints per level explain a logical step and clear a wrong manual mark on the hinted cell; they never collect a cat automatically. Inspect shows A–H and highlights all cells of one color.
- Stones never contain cats and cannot be marked/searched. Locked cells retain their color; the number means the total cats required to open them. Blocked gestures cost nothing. Excluded locks reveal normally. The first stone/lock level explains its mechanic.
- A completed board becomes its original flat picture. After the clean-picture pause, a full-screen outro presents that image in a large cream frame against purple, with a soft glow and brief reveal. It stays until you choose “Tranh tiếp theo” or “Chọn tranh”. Retry resets the current level.
- Progress shows the current picture out of 20. The last outro celebrates the collection and offers restarting. Progress is session-only. Feature details and verification: `docs/GALLERY_OUTRO.md`.

## Visual architecture

- `MeowGame` owns model/input/flow, responsive layout, generation cancellation and serialized UI bindings. It can load the authored GameRoot by UUID in Preview or resource path in builds for an older scene snapshot.
- `MascotView` owns three direct SpriteFrame references, a temporary expression clock and mild idle motion. No per-frame Graphics mascot drawing.
- `Board3D` owns **64 preauthored tiles / 32 rotating shards**, shared palette materials, a dedicated orthographic camera and **1024×1024** RenderTexture. Domed caps are 0.90 cell wide / 0.42 cell deep with a 7-degree tilt; no physics simulation. Resize/Retry reconfigure the pool, rather than recreating meshes/materials.
- `GameEffects` owns **128 preauthored particle sprites**, four ray arms and sprite frames. Each particle has its own age, so late wave puffs finish normally. Excess emissions are dropped. The same pool moves above the result card for one confetti burst. Tile bursts use three short-lived colored 3D chips plus two small dust wisps and one glint, scaled to the cell size.
- `PixelCell` presents the final pixel, token, manual ×, inspection letters, outline and hold ring. `Motion.blastDuration` covers the last delayed puff/shard before unlocking.
- `Layout` reserves >=36 CSS px per 8×8 cell at 360×480/640 and >=44 CSS px button height in the required viewport matrix.
- `assets/art/fonts` contains static Nunito 600/800 instances and the SIL OFL license. UI text is real Label text. Small UI/VFX sprites use a <=2048 atlas in exported builds.

## Authoring

Edit the GameRoot prefab in Creator for normal visual work. The offline generator is destructive to authored prefab/scene customization: only regenerate when deliberately editing the generator as the source of that layout.

```powershell
node tools/skin-assets.cjs
node tools/picture-assets.cjs
node tools/author-view.cjs
```

`skin-assets` renders code-native SVG textures and normalizes generated PNGs using the bundled authoring-only Sharp module (`MEOW_SHARP` can override its location). `author-view` writes prefab/scene/material bindings while retaining existing asset UUIDs. `author-skin.cjs` delegates to the current texture authoring pipeline. `create-scene.cjs` delegates to author-view; prepare textures first.

Keep puzzle data/palette unchanged for skin edits. Frozen picture inputs live in `tools/data/pictures.json`; edit these deliberately when authoring a new picture. The tool never changes picture pixels to force a solution. Revise a draft if the independent solver rejects it.

```powershell
node tools/author-levels.cjs --check
node tools/author-levels.cjs --preview
node tools/author-levels.cjs --export
node tools/picture-assets.cjs
node tools/blocker-assets.cjs
```

Only `--export` writes runtime `core/Levels.ts` and `docs/level-validation.json`. Preview writes `docs/images/pictures.svg` and `.png`; running without arguments prints usage. Validation checks every reachable correct-cat subset, so locks cannot force guessing or trap a valid play order. After changing palettes or overlay bindings, deliberately run `author-view` to update authored materials/prefabs; it replaces authored layout customization.

## Verify

```powershell
npm test
npm run typecheck
```

TypeScript and authoring templates resolve through `tools/toolchain.cjs` using the version in package.json (`MEOW_CREATOR` and `MEOW_TYPESCRIPT` overrides supported). Open the project in Creator first to generate `temp/tsconfig.cocos.json`; do not edit that generated file. Automated checks cover rules/blockers, all 20 pictures, immutable authoring, input, responsive geometry, prefab wiring/scene expansion, mesh/shard motion, particles and expression cancellation. They do not establish visual recognition or physical-device behavior. Latest feature evidence: `docs/PICTURE_LEVELS.md`; previous skin evidence: `docs/VERIFICATION.md`.


For geometry edits, run `node tools/export-models.cjs` and let Creator import any new model before `node tools/author-view.cjs`. The current ColorPlane model/material references are already authored and imported; existing asset UUIDs were retained.
