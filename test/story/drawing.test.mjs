import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateCoverCrop,
  drawCoverImage,
  drawEmptyPhoto,
  drawPhotoFallback,
  roundedRectPath,
} from '../../story/source/drawing.mjs';

function recordingContext({ withRoundRect = true } = {}) {
  const calls = [];
  const ctx = {
    calls,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalAlpha: 1,
    lineWidth: 1,
  };

  for (const method of [
    'save', 'restore', 'beginPath', 'clip', 'drawImage', 'fill', 'stroke',
    'moveTo', 'lineTo', 'quadraticCurveTo', 'closePath', 'arc', 'ellipse',
  ]) {
    ctx[method] = (...args) => calls.push([method, ...args]);
  }
  if (withRoundRect) ctx.roundRect = (...args) => calls.push(['roundRect', ...args]);
  return ctx;
}

test('calculates centered square crops for landscape and portrait sources', () => {
  assert.deepEqual(
    calculateCoverCrop(400, 200, 170, 170),
    { sx: 100, sy: 0, sw: 200, sh: 200 },
  );
  assert.deepEqual(
    calculateCoverCrop(200, 400, 170, 170),
    { sx: 0, sy: 100, sw: 200, sh: 200 },
  );
});

test('rejects unusable intrinsic image dimensions', () => {
  assert.throws(
    () => calculateCoverCrop(0, 400, 170, 170),
    /dimensões positivas/i,
  );
  assert.throws(
    () => calculateCoverCrop(200, Number.NaN, 170, 170),
    /dimensões positivas/i,
  );
});

test('clips before drawing a centered cover image and restores afterwards', () => {
  const ctx = recordingContext();
  const image = { width: 400, height: 200 };
  drawCoverImage(ctx, image, { x: 20, y: 30, width: 170, height: 170 }, 22);

  assert.deepEqual(ctx.calls.map(([method]) => method), [
    'save', 'beginPath', 'roundRect', 'clip', 'drawImage', 'restore',
  ]);
  assert.deepEqual(ctx.calls[4], [
    'drawImage', image, 100, 0, 200, 200, 20, 30, 170, 170,
  ]);
});

test('builds a rounded path without relying on roundRect support', () => {
  const ctx = recordingContext({ withRoundRect: false });
  roundedRectPath(ctx, { x: 10, y: 20, width: 100, height: 80 }, 16);

  assert.equal(ctx.calls[0][0], 'beginPath');
  assert.ok(ctx.calls.some(([method]) => method === 'quadraticCurveTo'));
  assert.equal(ctx.calls.at(-1)[0], 'closePath');
});

test('empty photo well contains no silhouette while failed photo fallback does', () => {
  const empty = recordingContext();
  drawEmptyPhoto(empty, { x: 0, y: 0, width: 170, height: 170 }, 22);
  assert.equal(empty.calls.some(([method]) => method === 'arc'), false);

  const failed = recordingContext();
  drawPhotoFallback(failed, { x: 0, y: 0, width: 170, height: 170 }, 22);
  assert.equal(failed.calls.filter(([method]) => method === 'arc').length, 1);
  assert.ok(failed.calls.some(([method]) => method === 'ellipse'));
});
