import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';

const expected = new Map([
  ['logo-primary-1200.png', 1200],
  ['logo-horizontal-1600.png', 1600],
  ['logo-edition-2026-1600.png', 1600],
  ['symbol-1024.png', 1024],
  ['avatar-1080.png', 1080],
  ['favicon-32.png', 32]
]);

test('PNG exports have exact widths and alpha channels', async () => {
  for (const [file, width] of expected) {
    const metadata = await sharp(`brand/dist/png/${file}`).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.hasAlpha, true);
  }
});
