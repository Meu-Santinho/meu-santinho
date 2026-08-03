import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

test('the primary PNG matches a fresh render of its SVG', async () => {
  const svg = await readFile('brand/dist/svg/logo-primary.svg');
  const expected = await sharp(svg, { density: 288 })
    .resize({ width: 1200 })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const actual = await sharp('brand/dist/png/logo-primary-1200.png').ensureAlpha().raw().toBuffer();
  assert.equal(actual.length, expected.length);
  let different = 0;
  for (let index = 0; index < actual.length; index += 1) {
    if (Math.abs(actual[index] - expected[index]) > 2) different += 1;
  }
  assert.ok(different / actual.length <= 0.005, `pixel mismatch ratio: ${different / actual.length}`);
});
