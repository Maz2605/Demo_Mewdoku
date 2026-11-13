# Meow Pop visual standard

Reference: https://www.canva.com/design/DAHatjmc3X0/4TJ83hpcn9eKTO3QCzUGag/edit (nine pages inspected).

| Canva cue | Gameplay implementation |
|---|---|
| Sky/clouds | Gradient blue, quiet center, clouds restricted to edges |
| Golden purple logo | Compact transparent wordmark at top |
| Orange kitten | Matching idle/happy/surprised sprites and head token |
| Candy blocks | Straight, softly lit real 3D caps, thin bases |
| Cream/lavender cards | Nine-slice panels, soft contact shadows |
| Purple/gold controls | Hint primary accent, inspect secondary, retry quiet |
| Golden blast | Staged cross wave, sprite puffs/sparkles, bounded shards |

Palette: sky #7CCAFD; cream #FFF8EE; purple #7939CB; gold #FFD447; ink #44305F. Light from upper left. Nunito 800 titles/buttons; Nunito 600 body. UI sizes are authored in 720-wide portrait units (2 units/CSS px at 360px width): body 26, button 28, modal title 40. Button height 92; panel corner 24; white/lavender double border with soft purple contact shadow. Keep the board's authored hues and clean flat completed picture.

Portrait: compact logo/header, status, board, actions, instruction. Short portrait reduces decoration first. Landscape: left control rail/right board. Mascots never overlap board/touch targets. Minimum cell 36 CSS px at required 360px portrait sizes. Tutorial and result cards fit the viewport, with local-language text as Labels.

Current block refinement: domed .90-cell caps at .42-cell depth / 7-degree tilt, roughness .28 and specular .35. Exploded cells have only their original flat color, with no automatic dot. Reveal plates live in the 3D render pass below short-lived matching-color chips; small white glints and soft colored dust replace the broad golden spray.
