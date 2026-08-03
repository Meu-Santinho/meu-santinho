import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import sharp from 'sharp';

const EMPTY_PATH = 'story/dist/story-empty.png';
const DEMO_PATH = 'story/dist/story-demo.png';

function runScript(name) {
  const result = spawnSync('npm', ['run', name], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

async function hash(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function pixel(path, left, top) {
  const { data, info } = await sharp(path)
    .extract({ left, top, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 3);
  return [...data];
}

test('builds exact-size empty and populated PNG references', async () => {
  runScript('story:empty');
  runScript('story:demo');

  for (const path of [EMPTY_PATH, DEMO_PATH]) {
    const metadata = await sharp(path).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 1080);
    assert.equal(metadata.height, 1920);
    assert.equal(metadata.space, 'srgb');
  }

  assert.notEqual(await hash(EMPTY_PATH), await hash(DEMO_PATH));
});

test('uses exact flat colors at representative empty-template pixels', async () => {
  runScript('story:empty');

  assert.deepEqual(await pixel(EMPTY_PATH, 520, 260), [242, 247, 239]);
  assert.deepEqual(await pixel(EMPTY_PATH, 850, 355), [246, 199, 0]);
  assert.deepEqual(await pixel(EMPTY_PATH, 100, 1700), [7, 89, 165]);
});

test('renders the empty PNG deterministically', async () => {
  runScript('story:empty');
  const first = await hash(EMPTY_PATH);
  runScript('story:empty');
  const second = await hash(EMPTY_PATH);

  assert.equal(first, second);
});
