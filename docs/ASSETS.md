# Visual asset provenance — 2026-11-13

Reference: https://www.canva.com/design/DAHatjmc3X0/4TJ83hpcn9eKTO3QCzUGag/edit . Nine pages were inspected. The reference establishes sky/clouds, toy candy blocks, orange kitten, cream/lavender cards and purple/gold branding. Screenshots from the presentation are not used as gameplay UI textures.

## Generated artwork

Built-in image_gen was used. No CLI/API-key or paid external fallback. Original generated files remain in Codex generated_images; every runtime asset is copied into this project.

Existing `mascot-idle.png`, `mascot-happy.png`, `mascot-surprised.png` depict the same orange/cream kitten. The skin pipeline trims transparent margins and fits each into the same 1024×1024 canvas with an identical bottom baseline; output `mascot-*-skin.png`. Existing sources are preserved.

Original mascot prompt: one adorable orange kitten mascot, full body, facing viewer, huge friendly amber eyes, cream muzzle/belly, pink pads, orange stripes, soft upper-left lighting, polished 2.5D casual game art; idle waving, happy raised paws/closed eyes, surprised wide eyes/O mouth. Full silhouette, genuine transparent background; no scenery/text/logos. Happy/surprised used idle as identity reference.

### logo.png → logo-skin.png

Use case: logo-brand. Production transparent PNG wordmark for a playful mobile cat puzzle game. Exact text only: "MEOW POP". One horizontal line, large chunky rounded inflated yellow/golden letters, warm orange lower shading, cream specular highlights, thick rich purple extruded outline and subtle violet depth. Two little orange kitten ears peeking above the word, tiny pink paw print as the counter of the O in POP. Polished candy toy 2.5D mobile-game art, soft upper-left light. Clean compact silhouette, generous transparent margins, no subtitle, no other words, no backdrop, no mockup, no watermark. Truly transparent background. Readable at 240 px wide.

### cat-token-source.png → cat-token.png

Use case: stylized-concept. Reference image is character identity only (`mascot-idle.png`). Create a production transparent game token: ONLY the head of this same adorable orange tabby kitten, front facing, symmetric, friendly amber eyes and small smile. Preserve orange stripes, cream muzzle, pink inner ears, glossy brown amber eyes and soft upper-left light from reference. Simplify tiny hairs for readability at 40px, polished soft 2.5D toy game art, smooth silhouette, no neck, no body, no hands. One centered head including both whole ears, 10% transparent margin on every side. No background, no shadow plane, no border, no text. Genuine alpha.

Runtime logo is <=1024px wide; token 256×256. Source outputs are preserved as authoring inputs; unreferenced sources are not required by the game bundle.

## Code-native assets

`tools/skin-assets.cjs` renders deterministic SVG artwork to PNG: gradient sky, edge clouds, paw pattern, nine-slice cream/purple/gold panels, hearts, hint/inspect/retry icons, ×/dot/outline/ring, star/puff/ray/confetti/glow/contact shadow. These extend the existing code-native UI system. Small UI/VFX sprites use a 2048×2048 maximum auto-atlas with padding/bleed.

Block/tray/shards reuse the editable glTF geometry from `ModelGeometry.ts`. No new model download or generation service. Four pictures remain authored puzzle color matrices.

## Font

Nunito from https://github.com/google/fonts/tree/main/ofl/nunito . SIL Open Font License is bundled at `assets/art/fonts/OFL.txt`. `Nunito-Variable.ttf` is the official source; fontTools instantiated weight 600 (`Nunito-SemiBold.ttf`) and 800 (`Nunito-ExtraBold.ttf`) offline. fontTools is an authoring-only temporary tool, not a runtime dependency.

## Block/particle refresh

No new generated images or external assets were needed. RoundedBlock glTF is now exported from the crowned variant of `roundedCube(.18,.12)`; deformation normals use the inverse transpose. `ColorPlane.gltf` is a four-vertex/two-triangle plane used for unlit reveal colors below 3D fragments. `Flat_*.mtl` materials reference Cocos's builtin-unlit effect directly, preserving exported shader dependencies. Existing level colors remain the source of both lit caps and unlit reveal planes.
