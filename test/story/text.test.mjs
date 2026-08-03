import assert from 'node:assert/strict';
import test from 'node:test';

import { fitCandidateName } from '../../story/source/text.mjs';

function createMeasurementContext() {
  return {
    font: '12px sans-serif',
    measureText(text) {
      const size = Number.parseFloat(this.font.match(/([\d.]+)px/)?.[1] ?? '12');
      return { width: [...text].length * size * 0.58 };
    },
  };
}

test('keeps a short accented name on one line at the preferred size', () => {
  const ctx = createMeasurementContext();
  const result = fitCandidateName(ctx, 'Álvaro Ção');

  assert.deepEqual(result, {
    lines: ['Álvaro Ção'],
    fontSize: 42,
    truncated: false,
  });
  assert.equal(ctx.font, '12px sans-serif');
});

test('collapses whitespace and wraps a composed name into at most two lines', () => {
  const ctx = createMeasurementContext();
  const result = fitCandidateName(
    ctx,
    '  Maria   das Graças de Albuquerque  ',
    { maxWidth: 400 },
  );

  assert.deepEqual(result.lines, ['Maria das Graças', 'de Albuquerque']);
  assert.equal(result.fontSize, 42);
  assert.equal(result.truncated, false);
});

test('reduces the font only as far as necessary', () => {
  const ctx = createMeasurementContext();
  const result = fitCandidateName(ctx, 'Abcdefghijklmnopqr', { maxWidth: 400 });

  assert.deepEqual(result.lines, ['Abcdefghijklmnopqr']);
  assert.equal(result.fontSize, 38);
  assert.equal(result.truncated, false);
});

test('truncates an unbroken token by Unicode code points at the minimum size', () => {
  const ctx = createMeasurementContext();
  const result = fitCandidateName(
    ctx,
    'ÁrvoreÇoraçãoExtraordinariamenteCompridaSemEspaço',
    { maxWidth: 240 },
  );

  assert.equal(result.fontSize, 30);
  assert.equal(result.lines.length, 1);
  assert.match(result.lines[0], /…$/u);
  assert.ok(ctx.measureText(result.lines[0]).width <= 240);
  assert.equal(result.truncated, true);
});

test('returns the neutral preferred state for empty input', () => {
  const result = fitCandidateName(createMeasurementContext(), '   ');

  assert.deepEqual(result, { lines: [], fontSize: 42, truncated: false });
});
