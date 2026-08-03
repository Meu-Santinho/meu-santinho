# Meu Santinho Logomarca Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir o sistema vetorial completo da logomarca Meu Santinho, suas exportações digitais e evidências objetivas de qualidade.

**Architecture:** Um gerador determinístico em Node.js monta o símbolo a partir de geometria SVG e converte o lettering Nunito em curvas com `fontkit`. Scripts independentes geram SVGs, PNGs e a folha de marca; testes do `node:test` validam tokens, estrutura vetorial, dimensões, transparência e paridade de renderização.

**Tech Stack:** Node.js 22.16.0+, npm, JavaScript ESM, SVG 1.1, `fontkit`, `sharp`, `svgo`, `node:test`.

## Global Constraints

- A marca permanente é `meu santinho`; `eleições 2026` é uma assinatura removível.
- Paleta exata: `#143C35`, `#0759A5`, `#168F61`, `#F6C700`, `#F2F7EF` e `#FFFFFF`.
- O cartão usa inclinação de −5°, contorno uniforme, cantos arredondados, duas linhas internas e confirmação circular sobreposta.
- Todos os SVGs finais devem usar curvas; são proibidos elementos `<text>`, `<image>`, gradientes e filtros.
- A versão de favicon remove as duas linhas internas para preservar leitura em 24 × 24 px.
- Devem existir versões positiva, negativa e monocromática.
- A marca nunca incorpora número, fotografia, sigla, estrela ou símbolo partidário.
- A neutralidade política deve permanecer explícita em todas as aplicações e exemplos.
- O layout completo do story e o código do produto permanecem fora deste plano.
- A fonte de construção é Nunito variável, peso 900, licenciada sob SIL OFL 1.1 e convertida em curvas nos entregáveis.

---

## File Map

- `package.json` — comandos de geração e verificação da identidade.
- `package-lock.json` — versões reproduzíveis das dependências.
- `brand/source/tokens.mjs` — cores, geometria, nomes de variantes e dimensões.
- `brand/source/symbol.mjs` — geometria do cartão, sombra, linhas e confirmação.
- `brand/source/wordmark.mjs` — conversão da fonte em curvas e composições do nome.
- `brand/source/lockups.mjs` — montagem das versões principal, horizontal e sazonal.
- `brand/source/fonts/Nunito[wght].ttf` — fonte de construção vendorizada.
- `brand/source/fonts/OFL.txt` — licença da fonte vendorizada.
- `scripts/brand/build-svg.mjs` — geração e otimização dos SVGs finais.
- `scripts/brand/render-png.mjs` — rasterização determinística dos PNGs.
- `scripts/brand/build-sheet.mjs` — folha visual e contact sheet de inspeção.
- `brand/dist/svg/*.svg` — entregáveis vetoriais.
- `brand/dist/png/*.png` — entregáveis raster.
- `brand/dist/brand-sheet.svg` — folha vetorial da identidade.
- `brand/dist/brand-sheet.png` — folha raster para inspeção e compartilhamento.
- `brand/README.md` — orientação curta de uso, área de proteção e catálogo de arquivos.
- `test/brand/*.test.mjs` — testes de tokens, vetores, exportações e paridade.

### Task 1: Deterministic Brand Toolchain and Licensed Font

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `brand/source/fonts/Nunito[wght].ttf`
- Create: `brand/source/fonts/OFL.txt`
- Create: `test/brand/font-source.test.mjs`

**Interfaces:**
- Consumes: nenhum arquivo anterior.
- Produces: fonte em `brand/source/fonts/Nunito[wght].ttf`; scripts npm `test`, `brand:svg`, `brand:png`, `brand:sheet` e `brand:verify`.

- [ ] **Step 1: Create the font provenance test**

```js
// test/brand/font-source.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

test('the vendored Nunito font and license match the approved sources', async () => {
  const font = await readFile('brand/source/fonts/Nunito[wght].ttf');
  const license = await readFile('brand/source/fonts/OFL.txt');
  assert.equal(sha256(font), 'bb55a5ca5c2042335b3991af27c4d0705d0ef41cac6164ac737fd8f2a1e85207');
  assert.equal(sha256(license), '580df76c95a1ec5ab878ceb25bb3d85c6a076804e9c970c8c6972aea775fdf65');
  assert.match(license.toString('utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
});
```

- [ ] **Step 2: Run the test and confirm the assets are absent**

Run: `node --test test/brand/font-source.test.mjs`  
Expected: FAIL with `ENOENT` for `brand/source/fonts/Nunito[wght].ttf`.

- [ ] **Step 3: Initialize npm, install exact dependencies, and vendor the approved font**

```bash
npm init -y
npm pkg set type=module
npm pkg set scripts.test='node --test test/brand/*.test.mjs'
npm pkg set scripts.brand:svg='node scripts/brand/build-svg.mjs'
npm pkg set scripts.brand:png='node scripts/brand/render-png.mjs'
npm pkg set scripts.brand:sheet='node scripts/brand/build-sheet.mjs'
npm pkg set scripts.brand:verify='npm test && npm run brand:svg && npm run brand:png && npm run brand:sheet && npm test'
npm install --save-exact fontkit sharp svgo
mkdir -p 'brand/source/fonts'
curl -fsSL 'https://raw.githubusercontent.com/google/fonts/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/nunito/Nunito%5Bwght%5D.ttf' -o 'brand/source/fonts/Nunito[wght].ttf'
curl -fsSL 'https://raw.githubusercontent.com/google/fonts/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/nunito/OFL.txt' -o 'brand/source/fonts/OFL.txt'
```

The source is the official [Google Fonts repository pinned at commit `2796410`](https://github.com/google/fonts/tree/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/nunito). Do not substitute another Nunito build because the checksum locks the approved outlines.

- [ ] **Step 4: Run the provenance test**

Run: `npm test`  
Expected: 1 test passes, 0 failures.

- [ ] **Step 5: Commit the toolchain**

```bash
git add package.json package-lock.json brand/source/fonts test/brand/font-source.test.mjs
git commit -m "build: add deterministic brand asset toolchain"
```

### Task 2: Brand Tokens and Symbol Geometry

**Files:**
- Create: `brand/source/tokens.mjs`
- Create: `brand/source/symbol.mjs`
- Create: `test/brand/symbol.test.mjs`

**Interfaces:**
- Consumes: nenhum módulo de aplicação.
- Produces: `COLORS`, `SYMBOL`, `EXPORTS`; `buildSymbol({ mode, simplified }): string`.

- [ ] **Step 1: Write tests for exact tokens and the full/simplified symbol**

```js
// test/brand/symbol.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { COLORS, SYMBOL } from '../../brand/source/tokens.mjs';
import { buildSymbol } from '../../brand/source/symbol.mjs';

test('brand tokens preserve the approved palette and geometry', () => {
  assert.deepEqual(COLORS, {
    deep: '#143C35', blue: '#0759A5', green: '#168F61',
    yellow: '#F6C700', mist: '#F2F7EF', white: '#FFFFFF'
  });
  assert.equal(SYMBOL.rotation, -5);
  assert.equal(SYMBOL.strokeWidth, 4);
});

test('full symbol is native SVG without forbidden elements', () => {
  const svg = buildSymbol({ mode: 'color', simplified: false });
  assert.match(svg, /viewBox="0 0 128 144"/);
  assert.match(svg, /data-part="list-lines"/);
  assert.doesNotMatch(svg, /<(text|image|linearGradient|radialGradient|filter)\b/);
});

test('favicon symbol removes only the list lines', () => {
  const svg = buildSymbol({ mode: 'color', simplified: true });
  assert.doesNotMatch(svg, /data-part="list-lines"/);
  assert.match(svg, /data-part="card"/);
  assert.match(svg, /data-part="confirmation"/);
});
```

- [ ] **Step 2: Run the tests and confirm the modules do not exist**

Run: `node --test test/brand/symbol.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `brand/source/tokens.mjs`.

- [ ] **Step 3: Implement immutable tokens**

```js
// brand/source/tokens.mjs
export const COLORS = Object.freeze({
  deep: '#143C35', blue: '#0759A5', green: '#168F61',
  yellow: '#F6C700', mist: '#F2F7EF', white: '#FFFFFF'
});

export const SYMBOL = Object.freeze({
  viewBox: '0 0 128 144', rotation: -5, strokeWidth: 4,
  card: { x: 20, y: 12, width: 76, height: 102, radius: 15 },
  shadow: { dx: 8, dy: 9 },
  confirmation: { cx: 87, cy: 105, radius: 23 }
});

export const EXPORTS = Object.freeze({
  primary: 1200, horizontal: 1600, edition2026: 1600,
  symbol: 1024, avatar: 1080, favicon: 32, sheet: 1920
});
```

- [ ] **Step 4: Implement symbol modes with exact geometry**

```js
// brand/source/symbol.mjs
import { COLORS, SYMBOL } from './tokens.mjs';

const paletteFor = (mode) => mode === 'negative'
  ? { outline: COLORS.white, paper: COLORS.deep, shadow: COLORS.yellow, confirm: COLORS.green }
  : mode === 'mono'
    ? { outline: COLORS.deep, paper: COLORS.white, shadow: COLORS.deep, confirm: COLORS.deep }
    : { outline: COLORS.deep, paper: COLORS.white, shadow: COLORS.yellow, confirm: COLORS.green };

export function buildSymbol({ mode = 'color', simplified = false } = {}) {
  const c = paletteFor(mode);
  const lines = simplified ? '' : `<g data-part="list-lines" stroke="${c.outline}" stroke-width="7" stroke-linecap="round"><path d="M38 43h38"/><path d="M38 62h38"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SYMBOL.viewBox}" role="img" aria-label="Símbolo Meu Santinho"><g transform="rotate(-5 58 65)"><rect data-part="shadow" x="28" y="21" width="76" height="102" rx="15" fill="${c.shadow}"/><rect data-part="card" x="20" y="12" width="76" height="102" rx="15" fill="${c.paper}" stroke="${c.outline}" stroke-width="4"/>${lines}</g><g data-part="confirmation"><circle cx="87" cy="105" r="23" fill="${c.confirm}" stroke="${c.outline}" stroke-width="4"/><path d="M76 105l8 8 15-18" fill="none" stroke="${mode === 'mono' ? c.paper : COLORS.white}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
}
```

- [ ] **Step 5: Run the symbol tests**

Run: `node --test test/brand/symbol.test.mjs`  
Expected: 3 tests pass, 0 failures.

- [ ] **Step 6: Commit the approved symbol geometry**

```bash
git add brand/source/tokens.mjs brand/source/symbol.mjs test/brand/symbol.test.mjs
git commit -m "feat: generate Meu Santinho symbol"
```

### Task 3: Wordmark Curves and Lockup Composition

**Files:**
- Create: `brand/source/wordmark.mjs`
- Create: `brand/source/lockups.mjs`
- Create: `test/brand/lockups.test.mjs`

**Interfaces:**
- Consumes: `COLORS`, `buildSymbol()`, `brand/source/fonts/Nunito[wght].ttf`.
- Produces: `outlineText({ text, fontSize, tracking, fill }): Promise<{ markup, width, height }>`; `buildWordmark({ layout, mode }): Promise<{ markup, width, height }>`; `buildLockup({ variant, mode }): Promise<string>`.

- [ ] **Step 1: Write lockup contract tests**

```js
// test/brand/lockups.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWordmark } from '../../brand/source/wordmark.mjs';
import { buildLockup } from '../../brand/source/lockups.mjs';

test('wordmark converts lowercase copy to curves', async () => {
  const result = await buildWordmark({ layout: 'stacked', mode: 'color' });
  assert.ok(result.width > 0 && result.height > 0);
  assert.match(result.markup, /<path\b/);
  assert.doesNotMatch(result.markup, /<text\b/);
});

test('primary and horizontal lockups contain symbol and outlined name', async () => {
  for (const variant of ['primary', 'horizontal']) {
    const svg = await buildLockup({ variant, mode: 'color' });
    assert.match(svg, /data-component="symbol"/);
    assert.match(svg, /data-component="wordmark"/);
    assert.doesNotMatch(svg, /<(text|image)\b/);
  }
});

test('edition lockup includes outlined eleições 2026 signature', async () => {
  const svg = await buildLockup({ variant: 'edition-2026', mode: 'color' });
  assert.match(svg, /data-component="edition"/);
  assert.doesNotMatch(svg, /<text\b/);
});
```

- [ ] **Step 2: Run the tests and confirm missing modules**

Run: `node --test test/brand/lockups.test.mjs`  
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `brand/source/wordmark.mjs`.

- [ ] **Step 3: Implement deterministic text-to-path conversion**

Implement the reusable outlining helper and wordmark wrapper with this contract. The helper uses `fontkit.openSync('brand/source/fonts/Nunito[wght].ttf').getVariation({ wght: 900 })`, calls `font.layout(text)`, accumulates `position.xAdvance`, and returns paths in SVG coordinates:

```js
// brand/source/wordmark.mjs
import fontkit from 'fontkit';
import { COLORS } from './tokens.mjs';

const baseFont = fontkit.openSync('brand/source/fonts/Nunito[wght].ttf');
const font = baseFont.getVariation({ wght: 900 });

export async function outlineText({ text, fontSize, tracking = 0, fill = COLORS.blue }) {
  const run = font.layout(text);
  const scale = fontSize / font.unitsPerEm;
  let cursor = 0;
  const paths = run.glyphs.map((glyph, index) => {
    const x = cursor + run.positions[index].xOffset;
    const y = run.positions[index].yOffset;
    cursor += run.positions[index].xAdvance + tracking / scale;
    return `<path d="${glyph.path.toSVG()}" transform="translate(${x * scale} ${(font.ascent + y) * scale}) scale(${scale} ${-scale})" fill="${fill}"/>`;
  });
  return { markup: paths.join(''), width: cursor * scale, height: (font.ascent - font.descent) * scale };
}
```

Use these exact wordmark settings:

```js
export const WORDMARK_SETTINGS = Object.freeze({
  copy: 'meu santinho',
  stackedLines: ['meu', 'santinho'],
  fontSize: 72,
  lineHeight: 60,
  letterSpacing: -1.2,
  color: '#0759A5'
});
```

`buildWordmark()` calls `outlineText()` once for the single-line layout and once per line for the stacked layout, offsetting the second line by `lineHeight`. It returns curve markup and measured bounds. For `mode: 'negative'`, use `#FFFFFF`; for `mode: 'mono'`, use `#143C35`. Do not retain a `<text>` element as fallback.

- [ ] **Step 4: Implement the three lockup geometries**

Use these compositions in `brand/source/lockups.mjs`:

```js
export const LOCKUP_LAYOUTS = Object.freeze({
  primary: { symbol: { x: 0, y: 0, width: 128 }, wordmark: { x: 152, y: 11, layout: 'stacked' }, padding: 12 },
  horizontal: { symbol: { x: 0, y: 0, width: 104 }, wordmark: { x: 128, y: 31, layout: 'single-line' }, padding: 12 },
  'edition-2026': { symbol: { x: 0, y: 0, width: 128 }, wordmark: { x: 152, y: 11, layout: 'stacked' }, edition: { x: 152, y: 137, copy: 'eleições 2026' }, padding: 12 }
});
```

Extract the inner markup from `buildSymbol()`, wrap components in named `<g data-component="…">` groups, and calculate the final `viewBox` from measured wordmark bounds plus padding. Convert `eleições 2026` with Nunito weight 900 at 18 px, tracking 1.8 px, inside a rounded yellow capsule with deep-green outline.

- [ ] **Step 5: Run lockup and full tests**

Run: `npm test`  
Expected: 7 tests pass, 0 failures.

- [ ] **Step 6: Commit the wordmark and lockups**

```bash
git add brand/source/wordmark.mjs brand/source/lockups.mjs test/brand/lockups.test.mjs
git commit -m "feat: add outlined wordmark and lockups"
```

### Task 4: SVG Variant Build and Structural Validation

**Files:**
- Create: `scripts/brand/build-svg.mjs`
- Create: `test/brand/svg-build.test.mjs`
- Create: `brand/dist/svg/logo-primary.svg`
- Create: `brand/dist/svg/logo-horizontal.svg`
- Create: `brand/dist/svg/logo-edition-2026.svg`
- Create: `brand/dist/svg/logo-negative.svg`
- Create: `brand/dist/svg/logo-monochrome.svg`
- Create: `brand/dist/svg/symbol.svg`
- Create: `brand/dist/svg/favicon.svg`

**Interfaces:**
- Consumes: `buildSymbol()`, `buildLockup()`.
- Produces: sete SVGs otimizados em `brand/dist/svg/`.

- [ ] **Step 1: Write the SVG build acceptance test**

```js
// test/brand/svg-build.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const files = ['logo-primary.svg', 'logo-horizontal.svg', 'logo-edition-2026.svg',
  'logo-negative.svg', 'logo-monochrome.svg', 'symbol.svg', 'favicon.svg'];

test('all required optimized SVG assets exist and remain native vectors', async () => {
  for (const file of files) {
    const svg = await readFile(`brand/dist/svg/${file}`, 'utf8');
    assert.match(svg, /^<svg\b/);
    assert.match(svg, /viewBox="[^"]+"/);
    assert.doesNotMatch(svg, /<(text|image|linearGradient|radialGradient|filter)\b/);
  }
});

test('favicon uses the approved simplified symbol', async () => {
  const svg = await readFile('brand/dist/svg/favicon.svg', 'utf8');
  assert.doesNotMatch(svg, /data-part="list-lines"/);
});
```

- [ ] **Step 2: Run the build test and confirm outputs are absent**

Run: `node --test test/brand/svg-build.test.mjs`  
Expected: FAIL with `ENOENT` for `brand/dist/svg/logo-primary.svg`.

- [ ] **Step 3: Implement the SVG builder**

`scripts/brand/build-svg.mjs` must create `brand/dist/svg`, generate this exact mapping, optimize each string with `svgo.optimize()`, preserve `viewBox` and `data-*` attributes, and write a trailing newline:

```js
const jobs = [
  ['logo-primary.svg', () => buildLockup({ variant: 'primary', mode: 'color' })],
  ['logo-horizontal.svg', () => buildLockup({ variant: 'horizontal', mode: 'color' })],
  ['logo-edition-2026.svg', () => buildLockup({ variant: 'edition-2026', mode: 'color' })],
  ['logo-negative.svg', () => buildLockup({ variant: 'primary', mode: 'negative' })],
  ['logo-monochrome.svg', () => buildLockup({ variant: 'primary', mode: 'mono' })],
  ['symbol.svg', () => buildSymbol({ mode: 'color', simplified: false })],
  ['favicon.svg', () => buildSymbol({ mode: 'color', simplified: true })]
];
```

SVGO configuration must set `removeViewBox: false`, `cleanupIds: false` and disable any plugin that removes `data-component` or `data-part` attributes.

- [ ] **Step 4: Build and test all SVGs**

Run: `npm run brand:svg && npm test`  
Expected: seven files generated; all tests pass.

- [ ] **Step 5: Commit SVG generation and outputs**

```bash
git add scripts/brand/build-svg.mjs test/brand/svg-build.test.mjs brand/dist/svg
git commit -m "feat: export complete SVG logo system"
```

### Task 5: PNG, Avatar, Favicon and Render-Parity Checks

**Files:**
- Create: `scripts/brand/render-png.mjs`
- Create: `test/brand/png-build.test.mjs`
- Create: `test/brand/render-parity.test.mjs`
- Create: `brand/dist/png/logo-primary-1200.png`
- Create: `brand/dist/png/logo-horizontal-1600.png`
- Create: `brand/dist/png/logo-edition-2026-1600.png`
- Create: `brand/dist/png/symbol-1024.png`
- Create: `brand/dist/png/avatar-1080.png`
- Create: `brand/dist/png/favicon-32.png`

**Interfaces:**
- Consumes: SVGs de `brand/dist/svg/`, `EXPORTS`.
- Produces: seis PNGs com dimensões e transparência verificadas.

- [ ] **Step 1: Write PNG dimension and alpha tests**

```js
// test/brand/png-build.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';

const expected = new Map([
  ['logo-primary-1200.png', 1200], ['logo-horizontal-1600.png', 1600],
  ['logo-edition-2026-1600.png', 1600], ['symbol-1024.png', 1024],
  ['avatar-1080.png', 1080], ['favicon-32.png', 32]
]);

test('PNG exports have exact widths and alpha channels', async () => {
  for (const [file, width] of expected) {
    const metadata = await sharp(`brand/dist/png/${file}`).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.hasAlpha, true);
  }
});
```

- [ ] **Step 2: Run the PNG test and confirm outputs are absent**

Run: `node --test test/brand/png-build.test.mjs`  
Expected: FAIL because `brand/dist/png/logo-primary-1200.png` does not exist.

- [ ] **Step 3: Implement deterministic raster exports**

`scripts/brand/render-png.mjs` must run the SVG builder first, create `brand/dist/png`, and render each SVG with `sharp(Buffer.from(svg), { density: 288 })`. Resize with `fit: 'inside'` and no enlargement. The avatar job must composite the full symbol, occupying 62% of a 1080 × 1080 transparent square; do not bake the rounded container into the symbol. All other jobs retain transparent backgrounds.

- [ ] **Step 4: Add SVG-to-PNG parity verification**

```js
// test/brand/render-parity.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

test('the primary PNG matches a fresh render of its SVG', async () => {
  const svg = await readFile('brand/dist/svg/logo-primary.svg');
  const expected = await sharp(svg).resize({ width: 1200 }).ensureAlpha().raw().toBuffer();
  const actual = await sharp('brand/dist/png/logo-primary-1200.png').ensureAlpha().raw().toBuffer();
  assert.equal(actual.length, expected.length);
  let different = 0;
  for (let index = 0; index < actual.length; index += 1) {
    if (Math.abs(actual[index] - expected[index]) > 2) different += 1;
  }
  assert.ok(different / actual.length <= 0.005, `pixel mismatch ratio: ${different / actual.length}`);
});
```

- [ ] **Step 5: Build and verify raster assets**

Run: `npm run brand:png && npm test`  
Expected: six PNGs generated; width, alpha and parity tests pass.

- [ ] **Step 6: Commit raster outputs and verification**

```bash
git add scripts/brand/render-png.mjs test/brand/png-build.test.mjs test/brand/render-parity.test.mjs brand/dist/png
git commit -m "feat: export verified raster brand assets"
```

### Task 6: Brand Sheet, Usage Guide and Visual QA

**Files:**
- Create: `scripts/brand/build-sheet.mjs`
- Create: `brand/dist/brand-sheet.svg`
- Create: `brand/dist/brand-sheet.png`
- Create: `brand/README.md`
- Create: `test/brand/brand-sheet.test.mjs`

**Interfaces:**
- Consumes: todos os SVGs, PNGs, `COLORS` e a especificação aprovada.
- Produces: folha 1920 × 1080, guia de uso e evidência visual final.

- [ ] **Step 1: Write the brand-sheet content test**

```js
// test/brand/brand-sheet.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('brand sheet documents every approved color and logo version', async () => {
  const sheet = await readFile('brand/dist/brand-sheet.svg', 'utf8');
  for (const color of ['#143C35', '#0759A5', '#168F61', '#F6C700', '#F2F7EF', '#FFFFFF']) {
    assert.match(sheet.toUpperCase(), new RegExp(color));
  }
  for (const label of ['Principal', 'Horizontal', 'Símbolo', 'Eleições 2026', 'Monocromática']) {
    assert.match(sheet, new RegExp(`data-label="${label}"`));
  }
});
```

- [ ] **Step 2: Run the test and confirm the sheet is absent**

Run: `node --test test/brand/brand-sheet.test.mjs`  
Expected: FAIL with `ENOENT` for `brand/dist/brand-sheet.svg`.

- [ ] **Step 3: Build the 1920 × 1080 brand sheet**

`scripts/brand/build-sheet.mjs` must compose a native 1920 × 1080 SVG with these regions: title and positioning statement; principal, horizontal, isolated, seasonal and monochrome marks; six named color chips with uppercase hex values; minimum-size example at 24 px; clear-space diagram using one confirmation-circle diameter as unit. Wrap the five version samples in groups whose `data-label` values are exactly `Principal`, `Horizontal`, `Símbolo`, `Eleições 2026` and `Monocromática`. Convert all visible sheet labels to paths through `outlineText()`; the sheet must not contain `<text>`.

Render `brand/dist/brand-sheet.png` at exactly 1920 × 1080 with `sharp`.

- [ ] **Step 4: Write the concise usage guide**

`brand/README.md` must contain:

```markdown
# Identidade Meu Santinho

## Arquivos

| Arquivo | Uso |
|---|---|
| `svg/logo-primary.svg` | Assinatura principal em duas linhas |
| `svg/logo-horizontal.svg` | Cabeçalhos e espaços largos |
| `svg/logo-edition-2026.svg` | Comunicação específica da eleição de 2026 |
| `svg/logo-negative.svg` | Fundos escuros |
| `svg/logo-monochrome.svg` | Reprodução em uma cor |
| `svg/symbol.svg` | Ícone e avatar em escala média ou grande |
| `svg/favicon.svg` | Ícone simplificado entre 16 e 31 px |
| `png/logo-primary-1200.png` | Uso raster geral da assinatura principal |
| `png/logo-horizontal-1600.png` | Uso raster em cabeçalhos largos |
| `png/logo-edition-2026-1600.png` | Peças raster da edição 2026 |
| `png/symbol-1024.png` | Símbolo raster em alta resolução |
| `png/avatar-1080.png` | Perfil quadrado para redes sociais |
| `png/favicon-32.png` | Favicon raster de 32 px |
| `brand-sheet.svg` | Folha vetorial de referência |
| `brand-sheet.png` | Folha de referência para visualização rápida |

## Área de proteção
Reserve ao redor da marca pelo menos o diâmetro do círculo de confirmação.

## Tamanho mínimo
Use o símbolo completo a partir de 32 px. Entre 16 e 31 px, use `favicon.svg`, sem linhas internas.

## Fundos
Use a versão principal em fundos claros, a negativa em fundos escuros e a monocromática quando houver limitação de cor.

## Não fazer
Não alterar cores, inclinação ou proporções; não adicionar gradientes; não fundir a marca com fotografia, número, sigla ou símbolo partidário.

## Fonte e licença
Nunito é usada apenas para construir curvas e é distribuída sob SIL OFL 1.1. Os SVGs finais não dependem da fonte.
```

- [ ] **Step 5: Run automated verification**

Run: `npm run brand:verify`  
Expected: every test passes; every SVG and PNG is regenerated without errors.

- [ ] **Step 6: Inspect the rendered sheet and small-size assets**

Open `brand/dist/brand-sheet.png`, `brand/dist/png/avatar-1080.png` and `brand/dist/png/favicon-32.png` with the image inspection tool. Confirm all of the following visually:

- no clipping or overlap;
- even optical spacing between symbol and wordmark;
- confirmation circle remains distinct at 32 px;
- the primary wordmark reads `meu santinho` without malformed glyphs;
- negative and monochrome variants remain recognizable;
- the yellow shadow does not appear as a second card;
- none of the marks resembles a candidate or party badge.

If a criterion fails, modify only the responsible geometry or spacing token, regenerate all assets, rerun `npm run brand:verify`, and repeat the image inspection.

- [ ] **Step 7: Verify repository cleanliness and commit the finished package**

```bash
git status --short
git add scripts/brand/build-sheet.mjs brand/dist/brand-sheet.svg brand/dist/brand-sheet.png brand/README.md test/brand/brand-sheet.test.mjs
git commit -m "docs: add Meu Santinho brand guide"
git status --short
```

Expected: the final `git status --short` prints no output.
