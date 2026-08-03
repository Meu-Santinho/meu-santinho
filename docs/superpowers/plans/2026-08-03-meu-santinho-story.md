# Meu Santinho Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar o mockup de referência do story eleitoral com ImageGen e implementar um renderizador Canvas determinístico que exporte um PNG 1080 × 1920 com seis posições vazias ou preenchidas por dados válidos.

**Architecture:** A referência visual raster fica isolada em `story/reference/`. O código de produção é dividido em contrato/tokens, validação, ajuste de texto, utilitários de desenho e um renderizador que aceita qualquer `CanvasRenderingContext2D` compatível. Apenas o adaptador Node importa `@napi-rs/canvas`; assim, os módulos de produção permanecem utilizáveis diretamente no navegador. Testes unitários usam contextos gravadores determinísticos e os testes de integração inspecionam o PNG real.

**Tech Stack:** Node.js 22.16.0+, npm, JavaScript ESM, Canvas 2D API, `@napi-rs/canvas`, `node:test`, PNG e SVG.

## Global Constraints

- O story final mede exatamente 1080 × 1920 px e respeita zonas protegidas de 120 px no topo e 180 px na base.
- A ordem é fixa: deputado federal, deputado estadual/distrital, senador 1ª vaga, senador 2ª vaga, governador e presidente.
- A UF `DF` troca apenas o rótulo do segundo cargo para `deputado distrital`.
- Os seis cards têm a mesma hierarquia e dimensões; presidente ou governador não recebem destaque adicional.
- Campos não preenchidos permanecem vazios; somente o rótulo do cargo continua visível.
- O mockup não contém pessoas, nomes, números ou partidos inventados.
- A marca usa o SVG existente `brand/dist/svg/logo-horizontal.svg`; ImageGen não é fonte para o logotipo final.
- Paleta exata: mist `#F2F7EF`, deep green `#143C35`, blue `#0759A5`, green `#168F61`, yellow `#F6C700` e white `#FFFFFF`.
- São proibidos gradientes, sombras difusas, barras laterais, cores partidárias e cápsulas decorativas adicionais.
- `number` é string e preserva zeros à esquerda.
- Os dois senadores devem ter `id` diferentes quando ambos estiverem preenchidos.
- Os módulos importados pelo navegador não podem depender de Node.js ou de `@napi-rs/canvas`.
- Toda exportação deve ser precedida por validação; dados inválidos não produzem PNG.

---

## File Map

- `package.json` — scripts gerais, de story e de verificação.
- `package-lock.json` — versão exata instalada de `@napi-rs/canvas`.
- `story/reference/imagegen-prompt.md` — prompt final e critérios de seleção do mockup.
- `story/reference/story-layout-imagegen-v1.png` — mockup aprovado como referência visual.
- `story/source/tokens.mjs` — dimensões, paleta e definições imutáveis dos seis slots.
- `story/source/validation.mjs` — normalização de UF e validação do contrato eleitoral.
- `story/source/text.mjs` — quebra, redução e truncamento determinístico de nomes.
- `story/source/drawing.mjs` — retângulos arredondados, recorte cover e fallback neutro.
- `story/source/render.mjs` — composição integral do story em Canvas 2D.
- `scripts/story/render-demo.mjs` — adaptador Node que carrega fonte/logo/fotos e grava PNG.
- `story/dist/story-empty.png` — exportação vazia de referência, 1080 × 1920.
- `story/dist/story-demo.png` — exportação de integração com dados sintéticos explicitamente técnicos.
- `story/README.md` — contrato, integração no navegador e comandos.
- `test/story/tokens.test.mjs` — geometria, ordem, rótulos e quantidade de dígitos.
- `test/story/validation.test.mjs` — UF, campos, números e duplicidade do Senado.
- `test/story/text.test.mjs` — nomes curtos, longos, compostos e acentuados.
- `test/story/drawing.test.mjs` — clipping, `cover`, fallback e ausência de placeholders.
- `test/story/render.test.mjs` — sequência de desenho, posições e neutralidade do template.
- `test/story/png-build.test.mjs` — dimensões, formato e cores do raster exportado.

### Task 1: Generate the ImageGen Visual Reference

**Files:**
- Create: `story/reference/imagegen-prompt.md`
- Create: `story/reference/story-layout-imagegen-v1.png`

**Interfaces:**
- Consumes: `brand/dist/brand-sheet.png`, `brand/dist/svg/logo-horizontal.svg` and the approved story specification.
- Produces: one project-bound raster reference; it is never imported by the Canvas renderer.

- [ ] **Step 1: Record the complete prompt before generation**

Create `story/reference/imagegen-prompt.md` with this exact production prompt:

```md
# ImageGen prompt — story Meu Santinho 2026

Use case: ui-mockup.

Create a polished vertical Instagram Story UI mockup in a strict 9:16 composition, designed to be implemented later at exactly 1080 × 1920 px with JavaScript Canvas API. This is a neutral Brazilian election ballot reminder branded “meu santinho” for the 2026 general election.

Visual system: warm mist background #F2F7EF; white cards #FFFFFF; deep green #143C35 for outlines and primary text; blue #0759A5 for brand, party line and footer; fresh green #168F61 for office labels; saffron yellow #F6C700 for the year and number areas. Friendly civic identity, rounded geometry, precise modern editorial layout, generous whitespace, high legibility, no political-party styling.

Canvas structure: 72 px-equivalent side margins, protected top area, protected bottom area. Header contains the horizontal “meu santinho” identity at left and a separate yellow “2026” accent at right. Add exactly six equal white horizontal candidate cards in one vertical column with uniform spacing. Every card has: a blank rounded-square photo area on the left, a central blank content area, and a blank saffron-yellow number rectangle on the right. Keep all candidate fields visibly empty: no faces, silhouettes, names, initials, numbers, party acronyms or sample data.

The only text inside the six cards is the fixed office label, in this exact order: “DEPUTADO FEDERAL”, “DEPUTADO ESTADUAL”, “SENADOR · 1ª VAGA”, “SENADOR · 2ª VAGA”, “GOVERNADOR”, “PRESIDENTE”. All six cards must have identical visual weight. Footer is a solid blue bar with centered white text “MEUSANTINHO.COM.BR”.

Decorations: one saffron-yellow circle partially cropped at the upper-right corner and one fresh-green dot partially cropped close to the footer. These decorations must not overlap any card.

Hard constraints: no gradients, no diffuse shadows, no colored strip on the left edge, no extra pills, no ballot box, no Brazilian flag, no stars, no party symbols, no campaign slogans, no checkboxes, no voting-machine imagery, no people, no candidate portraits, no fake electoral data. Preserve a clean, buildable grid with all essential content inside the central safe area. Return a single front-facing flat UI composition, not a phone mockup and not a photographed poster.
```

- [ ] **Step 2: Generate a new image with the integrated ImageGen tool**

Use the prompt above as a new generation with no referenced image arguments. The visual identity is communicated through exact palette and composition; do not ask ImageGen to trace the SVG.

Expected: one vertical UI mockup with six equal blank cards and no invented candidate data.

- [ ] **Step 3: Inspect the generation against blocking criteria**

Reject the generation if any of these are present:

- a person, face, fake name, candidate number or party;
- fewer or more than six candidate cards;
- the two Senate rows are missing or merged;
- a left-edge stripe, gradient or diffuse shadow;
- content outside a safe central 9:16 composition.

If exactly one blocking defect is present, run one directed edit naming only that defect. Do not introduce a new visual concept.

- [ ] **Step 4: Persist and verify the selected raster**

Copy the selected output to `story/reference/story-layout-imagegen-v1.png`, then run:

```bash
node -e "import('sharp').then(async ({default:sharp}) => { const m=await sharp('story/reference/story-layout-imagegen-v1.png').metadata(); if (!m.width || !m.height || Math.abs(m.width/m.height-9/16)>0.03) process.exit(1); console.log(m); })"
```

Expected: a readable PNG whose aspect ratio is within 0.03 of 9:16.

- [ ] **Step 5: Commit the visual reference**

```bash
git add story/reference/imagegen-prompt.md story/reference/story-layout-imagegen-v1.png
git commit -m "design: add ImageGen story reference"
```

### Task 2: Add the Canvas Runtime and Story Contract

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `story/source/tokens.mjs`
- Create: `test/story/tokens.test.mjs`

**Interfaces:**
- Produces: `STORY`, `COLORS`, `SLOT_DEFINITIONS`, `getSlotDefinitions(uf)`.
- Keeps: existing `brand:*` scripts and brand tests unchanged.

- [ ] **Step 1: Write the token contract test**

```js
// test/story/tokens.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { COLORS, SLOT_DEFINITIONS, STORY, getSlotDefinitions } from '../../story/source/tokens.mjs';

test('story geometry is exactly 1080 by 1920 with six equal rows', () => {
  assert.deepEqual({ width: STORY.width, height: STORY.height }, { width: 1080, height: 1920 });
  assert.equal(STORY.safeTop, 120);
  assert.equal(STORY.safeBottom, 180);
  assert.equal(STORY.marginX, 72);
  assert.equal(STORY.card.height, 210);
  assert.equal(STORY.card.gap, 18);
  assert.equal(STORY.card.photoSize, 170);
  assert.equal(SLOT_DEFINITIONS.length, 6);
});

test('slots preserve official order and digit counts', () => {
  assert.deepEqual(SLOT_DEFINITIONS.map(({ key, digits }) => [key, digits]), [
    ['federalDeputy', 4], ['stateOrDistrictDeputy', 5],
    ['senatorFirstSeat', 3], ['senatorSecondSeat', 3],
    ['governor', 2], ['president', 2]
  ]);
});

test('only DF switches the state office label', () => {
  assert.equal(getSlotDefinitions('BA')[1].label, 'DEPUTADO ESTADUAL');
  assert.equal(getSlotDefinitions('df')[1].label, 'DEPUTADO DISTRITAL');
});

test('story palette matches the approved brand colors', () => {
  assert.deepEqual(COLORS, {
    mist: '#F2F7EF', deep: '#143C35', blue: '#0759A5',
    green: '#168F61', yellow: '#F6C700', white: '#FFFFFF'
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `node --test test/story/tokens.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `story/source/tokens.mjs`.

- [ ] **Step 3: Install the exact Node Canvas adapter and expose scripts**

```bash
npm install --save-exact @napi-rs/canvas
npm pkg set scripts.test='node --test test/brand/*.test.mjs test/story/*.test.mjs'
npm pkg set scripts.story:empty='node scripts/story/render-demo.mjs --empty'
npm pkg set scripts.story:demo='node scripts/story/render-demo.mjs'
npm pkg set scripts.story:verify='npm test && npm run story:empty && npm run story:demo && npm test'
```

Do not import `@napi-rs/canvas` from any file in `story/source/`.

- [ ] **Step 4: Implement immutable dimensions and slot definitions**

Use these exact coordinates in `story/source/tokens.mjs`:

```js
export const COLORS = Object.freeze({
  mist: '#F2F7EF', deep: '#143C35', blue: '#0759A5',
  green: '#168F61', yellow: '#F6C700', white: '#FFFFFF'
});

export const STORY = Object.freeze({
  width: 1080, height: 1920, marginX: 72, safeTop: 120, safeBottom: 180,
  header: Object.freeze({ logoX: 72, logoY: 132, logoWidth: 390, logoHeight: 92,
    yearX: 842, yearY: 145, yearWidth: 166, yearHeight: 66 }),
  card: Object.freeze({ x: 72, firstY: 300, width: 936, height: 210, gap: 18,
    radius: 28, padding: 20, photoSize: 170, photoRadius: 22,
    textX: 282, textWidth: 500, numberX: 812, numberY: 50,
    numberWidth: 176, numberHeight: 110, numberRadius: 22 }),
  footer: Object.freeze({ x: 0, y: 1668, width: 1080, height: 72 })
});

export const SLOT_DEFINITIONS = Object.freeze([
  Object.freeze({ key: 'federalDeputy', label: 'DEPUTADO FEDERAL', digits: 4 }),
  Object.freeze({ key: 'stateOrDistrictDeputy', label: 'DEPUTADO ESTADUAL', digits: 5 }),
  Object.freeze({ key: 'senatorFirstSeat', label: 'SENADOR · 1ª VAGA', digits: 3 }),
  Object.freeze({ key: 'senatorSecondSeat', label: 'SENADOR · 2ª VAGA', digits: 3 }),
  Object.freeze({ key: 'governor', label: 'GOVERNADOR', digits: 2 }),
  Object.freeze({ key: 'president', label: 'PRESIDENTE', digits: 2 })
]);

export function getSlotDefinitions(uf = '') {
  const normalized = String(uf).trim().toUpperCase();
  return SLOT_DEFINITIONS.map((slot, index) => index === 1 && normalized === 'DF'
    ? { ...slot, label: 'DEPUTADO DISTRITAL' }
    : { ...slot });
}
```

- [ ] **Step 5: Run the token tests and full regression suite**

Run: `node --test test/story/tokens.test.mjs && npm test`  
Expected: all story token and existing brand tests pass.

- [ ] **Step 6: Commit the runtime and contract**

```bash
git add package.json package-lock.json story/source/tokens.mjs test/story/tokens.test.mjs
git commit -m "feat: define story canvas contract"
```

### Task 3: Validate Electoral Data Before Rendering

**Files:**
- Create: `story/source/validation.mjs`
- Create: `test/story/validation.test.mjs`

**Interfaces:**
- Produces: `normalizeUf(value): string`; `validateStoryData(input): { ok: true, value } | { ok: false, issues }`.
- Issue shape: `{ path: string, code: string, message: string }`.
- A candidate slot accepts `null`/`undefined` or `{ id, photo, name, number, party }`.

- [ ] **Step 1: Write failing validation tests**

Cover all of these cases in `test/story/validation.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { validateStoryData } from '../../story/source/validation.mjs';

const candidate = (id, number) => ({ id, photo: null, name: 'Nome Técnico', number, party: 'XX' });

test('accepts an entirely empty BA template', () => {
  const result = validateStoryData({ uf: 'ba' });
  assert.equal(result.ok, true);
  assert.equal(result.value.uf, 'BA');
});

test('preserves number as a string including leading zero', () => {
  const result = validateStoryData({ uf: 'BA', governor: candidate('g1', '01') });
  assert.equal(result.ok, true);
  assert.equal(result.value.governor.number, '01');
});

test('rejects a number with the wrong length or non-digits', () => {
  const result = validateStoryData({ uf: 'BA', federalDeputy: candidate('d1', '12A') });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(({ code }) => code === 'invalid_number'));
});

test('rejects the same candidate in both Senate seats', () => {
  const result = validateStoryData({
    uf: 'BA', senatorFirstSeat: candidate('s1', '123'), senatorSecondSeat: candidate('s1', '456')
  });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(({ code }) => code === 'duplicate_senator'));
});

test('rejects invalid UF and incomplete candidate identity', () => {
  const result = validateStoryData({ uf: 'ZZ', president: { number: '12' } });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some(({ path }) => path === 'uf'));
  assert.ok(result.issues.some(({ path }) => path === 'president.id'));
});
```

- [ ] **Step 2: Confirm red state**

Run: `node --test test/story/validation.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement pure validation**

Implementation rules:

- valid UFs are `AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO`;
- normalize only trimming and uppercase; never guess a UF;
- an absent candidate becomes `null`;
- a present candidate requires non-empty string `id`, `name`, `number` and `party`; `photo` may be a Canvas image source, URL string or `null`;
- number must match `^\\d{N}$` for its fixed slot;
- compare Senate `id` values after trimming and only when both slots are populated;
- return all detected issues in one pass;
- return a fresh normalized object and never mutate input.

- [ ] **Step 4: Run validation and regression tests**

Run: `node --test test/story/validation.test.mjs && npm test`  
Expected: all tests pass.

- [ ] **Step 5: Commit validation**

```bash
git add story/source/validation.mjs test/story/validation.test.mjs
git commit -m "feat: validate story electoral data"
```

### Task 4: Fit Candidate Names Deterministically

**Files:**
- Create: `story/source/text.mjs`
- Create: `test/story/text.test.mjs`

**Interfaces:**
- Produces: `fitCandidateName(ctx, name, options): { lines, fontSize, truncated }`.
- Options default to `{ maxWidth: 500, maxLines: 2, preferredSize: 42, minSize: 30, weight: 800, family: 'Nunito' }`.

- [ ] **Step 1: Write tests with a deterministic measurement context**

Use a fake `measureText()` that reads the pixel size from `ctx.font` and returns `text.length * size * 0.58`. Test:

- one short accented name remains one line at 42 px;
- a composed name wraps at whitespace into at most two lines;
- an unbroken long token shrinks no lower than 30 px;
- text still too wide at 30 px is truncated with the single-character ellipsis `…`;
- empty input returns `lines: []`, `fontSize: 42`, `truncated: false`;
- output never removes or decomposes Portuguese accents.

- [ ] **Step 2: Confirm red state**

Run: `node --test test/story/text.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the fitting algorithm**

Algorithm, in order:

1. trim and collapse internal whitespace;
2. for each integer font size from 42 down to 30, greedily wrap at spaces;
3. accept the largest size producing at most two lines with each line within 500 px;
4. if no size fits, use 30 px and truncate only the final line by Unicode code points until `line + '…'` fits;
5. keep at most two lines and report whether any content was removed.

Set `ctx.font` only for measurement and restore its previous value before returning.

- [ ] **Step 4: Run text and full tests**

Run: `node --test test/story/text.test.mjs && npm test`  
Expected: all tests pass.

- [ ] **Step 5: Commit text fitting**

```bash
git add story/source/text.mjs test/story/text.test.mjs
git commit -m "feat: fit candidate names in story cards"
```

### Task 5: Implement Canvas Drawing Primitives

**Files:**
- Create: `story/source/drawing.mjs`
- Create: `test/story/drawing.test.mjs`

**Interfaces:**
- Produces: `roundedRectPath(ctx, box, radius)`; `drawCoverImage(ctx, image, box, radius)`; `drawPhotoFallback(ctx, box, radius)`; `drawEmptyPhoto(ctx, box, radius)`.

- [ ] **Step 1: Write recording-context tests**

The fake context records method name and arguments. Assert:

- `roundedRectPath` uses `roundRect` when available and a path fallback otherwise;
- `drawCoverImage` clips before drawing and restores afterward;
- landscape and portrait sources both compute a centered crop with no deformation;
- a missing candidate calls `drawEmptyPhoto`, which paints only a neutral white/mist region and no symbol/text;
- a populated candidate whose photo fails calls `drawPhotoFallback`, which draws a simple neutral head-and-shoulders silhouette in mist/deep-green opacity without letters or icons.

- [ ] **Step 2: Confirm red state**

Run: `node --test test/story/drawing.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement cover-crop math**

Given source `sw × sh` and destination `dw × dh`:

```js
const sourceRatio = sw / sh;
const destinationRatio = dw / dh;
const crop = sourceRatio > destinationRatio
  ? { sx: (sw - sh * destinationRatio) / 2, sy: 0, sw: sh * destinationRatio, sh }
  : { sx: 0, sy: (sh - sw / destinationRatio) / 2, sw, sh: sw / destinationRatio };
```

Then clip the rounded destination and call the nine-argument `drawImage`. Reject images whose intrinsic width/height are not finite positive numbers.

- [ ] **Step 4: Implement separate empty and failure states**

- Empty slot: white photo well with a 2 px `#143C35` stroke at 14% alpha.
- Failed selected photo: same well plus a centered geometric head-and-shoulders silhouette; no external asset and no invented face.
- Always restore `globalAlpha`, fill/stroke styles and clipping state via `save()`/`restore()`.

- [ ] **Step 5: Run drawing and regression tests**

Run: `node --test test/story/drawing.test.mjs && npm test`  
Expected: all tests pass.

- [ ] **Step 6: Commit drawing primitives**

```bash
git add story/source/drawing.mjs test/story/drawing.test.mjs
git commit -m "feat: add story canvas drawing primitives"
```

### Task 6: Compose the Complete Story Renderer

**Files:**
- Create: `story/source/render.mjs`
- Create: `test/story/render.test.mjs`

**Interfaces:**
- Produces: `renderStory(ctx, input, assets): Promise<{ width: 1080, height: 1920 }>`.
- `assets` shape: `{ logo, resolvePhoto?: async (photo, candidate) => CanvasImageSource }`.
- Throws: `StoryValidationError` with `.issues` before the first draw call when data is invalid.

- [ ] **Step 1: Write renderer contract tests**

With a recording Canvas context, assert:

- invalid data causes zero drawing operations;
- background is filled `#F2F7EF` at 1080 × 1920;
- cards begin at y values `300, 528, 756, 984, 1212, 1440`;
- each card is `936 × 210` at x `72`;
- the six office labels appear exactly once and in official order;
- UF `DF` produces `DEPUTADO DISTRITAL`;
- an empty input draws no candidate names, parties or numbers;
- number areas remain yellow but blank for empty candidates;
- populated number is drawn as a string, preserving leading zeros;
- the actual supplied logo image is drawn at the header coordinates;
- footer text is exactly `MEUSANTINHO.COM.BR`;
- only the top yellow circle and lower green dot are drawn as decoration.

- [ ] **Step 2: Confirm red state**

Run: `node --test test/story/render.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement renderer order and typography**

Draw in this exact order:

1. mist background;
2. upper-right yellow circle centered at `(1022, 48)`, radius `164`;
3. lower-left green dot centered at `(20, 1704)`, radius `62`;
4. supplied horizontal logo at `(72, 132, 390, 92)` with contained proportions;
5. yellow rounded year area and deep-green `2026` centered inside it;
6. six white cards with 2 px deep-green stroke at 12% alpha;
7. each photo well at card x + 20 and y + 20, 170 × 170;
8. cargo at `(282, cardY + 42)`, 22 px Nunito 800, green, letter spacing emulated character-by-character at 1.4 px;
9. candidate name beginning at `(282, cardY + 86)`, deep green, 42–30 px Nunito 800, max two lines with 1.08 line height;
10. party at `(282, cardY + 176)`, 23 px Nunito 700, blue;
11. yellow number field at `(812, cardY + 50, 176, 110)`, radius 22;
12. candidate number centered, 58 px Nunito 900, deep green, only when populated;
13. blue footer at y 1668 with centered 25 px white Nunito 900 URL.

Use `ctx.textBaseline = 'alphabetic'` for body text and explicit baseline coordinates. Implement a private `drawTrackedText` helper because Canvas 2D `letterSpacing` support is not uniform.

- [ ] **Step 4: Resolve photos without contaminating browser modules**

- If `candidate.photo` is already drawable, pass it to `drawCoverImage`.
- Otherwise call `assets.resolvePhoto(photo, candidate)` when supplied.
- Catch only photo resolution/drawing errors and render the neutral failure silhouette.
- Do not catch validation errors or swallow Canvas programming errors.

- [ ] **Step 5: Run renderer and regression tests**

Run: `node --test test/story/render.test.mjs && npm test`  
Expected: all tests pass.

- [ ] **Step 6: Commit the renderer**

```bash
git add story/source/render.mjs test/story/render.test.mjs
git commit -m "feat: render Meu Santinho story with Canvas"
```

### Task 7: Build Real 1080 × 1920 PNG Exports

**Files:**
- Create: `scripts/story/render-demo.mjs`
- Create: `story/dist/story-empty.png`
- Create: `story/dist/story-demo.png`
- Create: `test/story/png-build.test.mjs`

**Interfaces:**
- `npm run story:empty` writes `story/dist/story-empty.png`.
- `npm run story:demo` writes `story/dist/story-demo.png`.
- The CLI exits non-zero and writes no output when validation fails.

- [ ] **Step 1: Write integration tests before the CLI**

In `test/story/png-build.test.mjs`, spawn both npm scripts and use `sharp` to assert:

- both files are PNG, 1080 × 1920, sRGB and have an alpha channel or opaque RGB output;
- representative background pixel is mist;
- footer-center pixel is blue;
- representative number-field pixel is yellow;
- empty output contains no demonstration name/party/number strings in its input path;
- repeated empty renders produce identical SHA-256 hashes.

- [ ] **Step 2: Confirm red state**

Run: `node --test test/story/png-build.test.mjs`  
Expected: FAIL because `scripts/story/render-demo.mjs` does not exist.

- [ ] **Step 3: Implement the Node adapter**

`scripts/story/render-demo.mjs` must:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { renderStory } from '../../story/source/render.mjs';

GlobalFonts.registerFromPath('brand/source/fonts/Nunito[wght].ttf', 'Nunito');
const canvas = createCanvas(1080, 1920);
const ctx = canvas.getContext('2d');
const logo = await loadImage('brand/dist/svg/logo-horizontal.svg');
```

Use `loadImage` as `resolvePhoto` for URL/file/buffer photo values. Create `story/dist/`, call `renderStory`, encode with `canvas.encode('png')`, then write the selected output.

The default demo uses neutral synthetic integration data, not real candidates:

```js
{
  uf: 'BA',
  federalDeputy: { id: 'test-federal', photo: null, name: 'Nome de Integração', number: '0123', party: 'TESTE' },
  stateOrDistrictDeputy: { id: 'test-state', photo: null, name: 'Nome Composto Muito Longo para Verificação', number: '04567', party: 'TESTE' },
  senatorFirstSeat: { id: 'test-senate-1', photo: null, name: 'Álvaro Ção', number: '001', party: 'TESTE' },
  senatorSecondSeat: { id: 'test-senate-2', photo: null, name: 'Bia Técnica', number: '002', party: 'TESTE' },
  governor: { id: 'test-governor', photo: null, name: 'Nome Técnico', number: '01', party: 'TESTE' },
  president: { id: 'test-president', photo: null, name: 'Outro Nome', number: '02', party: 'TESTE' }
}
```

These values are test fixtures only and must never appear in the ImageGen mockup or the user-facing empty template.

- [ ] **Step 4: Generate and verify both PNGs**

Run: `npm run story:empty && npm run story:demo && node --test test/story/png-build.test.mjs`  
Expected: both PNGs exist and all integration assertions pass.

- [ ] **Step 5: Inspect both images visually**

Open `story/dist/story-empty.png` and `story/dist/story-demo.png` at full resolution and a phone-width preview. Confirm:

- no overlap between cards, footer or safe zones;
- exactly six equally weighted cards;
- text stays within the center region;
- numbers stay centered in yellow fields;
- empty export contains no placeholder content;
- Canvas result follows the ImageGen hierarchy but uses the real SVG logo and exact labels.

- [ ] **Step 6: Commit exports and integration tests**

```bash
git add scripts/story/render-demo.mjs story/dist/story-empty.png story/dist/story-demo.png test/story/png-build.test.mjs
git commit -m "feat: export story PNG references"
```

### Task 8: Document Browser Integration and Verify the Deliverable

**Files:**
- Create: `story/README.md`
- Modify: `package.json` only if the verification sequence needs correction.

**Interfaces:**
- Documents direct browser imports, asynchronous photo loading, validation errors and PNG export.

- [ ] **Step 1: Write the integration documentation**

Include this minimal browser example in `story/README.md`:

```js
import { renderStory } from './story/source/render.mjs';

const canvas = document.querySelector('#story');
canvas.width = 1080;
canvas.height = 1920;
const ctx = canvas.getContext('2d');

const loadBrowserImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

await document.fonts.load('900 42px Nunito');
const logo = await loadBrowserImage('/brand/dist/svg/logo-horizontal.svg');
await renderStory(ctx, storyData, { logo, resolvePhoto: loadBrowserImage });

const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
```

Also document:

- every slot and required candidate property;
- digit counts and why number remains a string;
- DF label behavior;
- duplicate Senate validation;
- CORS requirement for remote photos;
- empty template behavior;
- distinction between `story-layout-imagegen-v1.png`, `story-empty.png` and production rendering.

- [ ] **Step 2: Run the complete verification pipeline**

Run:

```bash
npm run brand:verify
npm run story:verify
git status --short
```

Expected:

- all brand and story tests pass;
- brand and story generation commands exit 0;
- the generated PNGs remain 1080 × 1920;
- `git status --short` lists only the intended README change before its commit.

- [ ] **Step 3: Perform final visual QA**

Inspect `brand/dist/brand-sheet.png`, `story/reference/story-layout-imagegen-v1.png`, `story/dist/story-empty.png` and `story/dist/story-demo.png` together. Verify the palette and brand are consistent, while treating the ImageGen file only as compositional reference.

- [ ] **Step 4: Commit documentation**

```bash
git add story/README.md package.json package-lock.json
git commit -m "docs: explain story Canvas integration"
```

- [ ] **Step 5: Report completion evidence**

Report exact test counts, the two 1080 × 1920 PNG paths, the ImageGen prompt and reference path, and any intentional visual difference between the generated mockup and deterministic Canvas output. Do not claim completion from visual inspection alone; include the terminal verification results.
