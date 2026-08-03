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
