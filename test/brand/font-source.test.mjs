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
