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
  assert.doesNotMatch(sheet, /<text\b/);
});

test('usage guide catalogs every deliverable and the core restrictions', async () => {
  const guide = await readFile('brand/README.md', 'utf8');
  const assets = [
    'logo-primary.svg', 'logo-horizontal.svg', 'logo-edition-2026.svg',
    'logo-negative.svg', 'logo-monochrome.svg', 'symbol.svg', 'favicon.svg',
    'logo-primary-1200.png', 'logo-horizontal-1600.png',
    'logo-edition-2026-1600.png', 'symbol-1024.png', 'avatar-1080.png',
    'favicon-32.png', 'brand-sheet.svg', 'brand-sheet.png'
  ];
  for (const asset of assets) assert.match(guide, new RegExp(asset.replace('.', '\\.')));
  assert.match(guide, /Não alterar cores, inclinação ou proporções/);
  assert.match(guide, /SIL OFL 1\.1/);
});
