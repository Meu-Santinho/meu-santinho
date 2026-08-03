# ImageGen prompt — story Meu Santinho 2026

**Use case:** `ui-mockup`

```text
Use case: ui-mockup
Asset type: high-fidelity Instagram Story UI reference
Primary request: Create a polished vertical Instagram Story UI mockup in a strict 9:16 composition, designed to be implemented later at exactly 1080 × 1920 px with JavaScript Canvas API. This is a neutral Brazilian election ballot reminder branded “meu santinho” for the 2026 general election.
Style/medium: realistic shippable product UI, flat front-facing composition, not concept art, not a device mockup.
Color palette: warm mist background #F2F7EF; white cards #FFFFFF; deep green #143C35 for outlines and primary text; blue #0759A5 for brand, party line and footer; fresh green #168F61 for office labels; saffron yellow #F6C700 for the year and number areas.
Composition/framing: 72 px-equivalent side margins, protected top area, protected bottom area. Header contains the horizontal “meu santinho” identity at left and a separate yellow “2026” accent at right. Add exactly six equal white horizontal candidate cards in one vertical column with uniform spacing. Every card has a blank rounded-square photo area on the left, a central blank content area, and a blank saffron-yellow number rectangle on the right. Keep all candidate fields visibly empty: no faces, silhouettes, names, initials, numbers, party acronyms or sample data.
Text (verbatim): “meu santinho”; “2026”; “DEPUTADO FEDERAL”; “DEPUTADO ESTADUAL”; “SENADOR · 1ª VAGA”; “SENADOR · 2ª VAGA”; “GOVERNADOR”; “PRESIDENTE”; “MEUSANTINHO.COM.BR”. Render each exact string once and add no other text.
Hierarchy: the six office labels appear in the exact listed order. All six cards have identical visual weight. Footer is a solid blue bar with centered white text “MEUSANTINHO.COM.BR”. Friendly civic identity, rounded geometry, precise modern editorial layout, generous whitespace, high legibility, no political-party styling.
Decorations: one saffron-yellow circle partially cropped at the upper-right corner and one fresh-green dot partially cropped close to the footer. These decorations do not overlap any card.
Constraints: six cards exactly; fields remain blank; all essential content stays inside the central safe area; no candidate imagery or data; no watermark.
Avoid: gradients, diffuse shadows, colored strip on the left edge, extra pills, ballot box, Brazilian flag, stars, party symbols, campaign slogans, checkboxes, voting-machine imagery, people, candidate portraits, fake names, fake numbers, fake parties, phone frame, photographed poster.
```

## Critérios de seleção

- proporção 9:16;
- exatamente seis cards equivalentes;
- dois cards separados para o Senado;
- nenhum rosto, nome, número ou partido de candidato;
- nenhuma barra lateral, gradiente ou sombra difusa;
- estrutura aproveitável como referência da implementação Canvas.

## Iteração dirigida aplicada

```text
Use case: precise-object-edit
Input images: Image 1 is the generated Meu Santinho Instagram Story UI mockup and is the edit target.
Primary request: Change only the surface rendering to a completely flat UI style. Remove every gradient and every shadow, including subtle card shadows, inner shadows, glow, shading, and tonal variation inside the yellow rectangles, footer, background, cards, and decorations.
Constraints: preserve the exact 9:16 composition, six card count, card order, spacing, blank photo/name/party/number fields, all existing office labels, header, 2026, footer URL, palette hues, and decorative circle positions. Keep all fills perfectly solid and uniform. Keep thin flat outlines. Do not add or remove any element or text. No people, fake names, candidate numbers, parties, symbols, phone frame, poster perspective, texture, watermark, gradients, or shadows.
```
