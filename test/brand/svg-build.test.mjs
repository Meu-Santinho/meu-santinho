import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const files = [
  'logo-primary.svg', 'logo-horizontal.svg', 'logo-edition-2026.svg',
  'logo-negative.svg', 'logo-monochrome.svg', 'symbol.svg', 'favicon.svg'
];

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

test('SVG build finishes without warnings', () => {
  const result = spawnSync(process.execPath, ['scripts/brand/build-svg.mjs'], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
});
