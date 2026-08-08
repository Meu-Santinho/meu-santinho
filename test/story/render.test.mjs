import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PreviewStaleError,
  StoryValidationError,
  renderStory,
} from '../../story/source/render.mjs';

function recordingContext() {
  const calls = [];
  const ctx = {
    calls,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    globalAlpha: 1,
    lineWidth: 1,
    font: '12px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    measureText(text) {
      const size = Number.parseFloat(this.font.match(/([\d.]+)px/)?.[1] ?? '12');
      return { width: [...text].length * size * 0.58 };
    },
  };

  for (const method of [
    'save', 'restore', 'beginPath', 'clip', 'drawImage', 'fill', 'stroke',
    'moveTo', 'lineTo', 'quadraticCurveTo', 'closePath', 'arc', 'ellipse',
    'fillRect',
  ]) {
    ctx[method] = (...args) => calls.push({
      method, args, fillStyle: ctx.fillStyle, strokeStyle: ctx.strokeStyle,
      globalAlpha: ctx.globalAlpha, lineWidth: ctx.lineWidth,
    });
  }
  ctx.roundRect = (...args) => calls.push({ method: 'roundRect', args });
  ctx.fillText = (...args) => calls.push({
    method: 'fillText', args, fillStyle: ctx.fillStyle, font: ctx.font,
    textAlign: ctx.textAlign, textBaseline: ctx.textBaseline,
  });
  return ctx;
}

const logo = { width: 604.58, height: 141 };

function candidate(id, number, overrides = {}) {
  return {
    id,
    photo: null,
    name: 'Nome Técnico',
    number,
    party: 'XX',
    ...overrides,
  };
}

function textAt(ctx, y) {
  return ctx.calls
    .filter(({ method, args }) => method === 'fillText' && args[2] === y)
    .map(({ args }) => args[0])
    .join('');
}

test('rejects invalid electoral data before drawing anything', async () => {
  const ctx = recordingContext();
  const input = {
    uf: 'BA',
    senatorFirstSeat: candidate('same', '123'),
    senatorSecondSeat: candidate('same', '456'),
  };

  await assert.rejects(
    () => renderStory(ctx, input, { logo }),
    (error) => error instanceof StoryValidationError
      && error.issues.some(({ code }) => code === 'duplicate_senator'),
  );
  assert.deepEqual(ctx.calls, []);
});

test('renders the empty template with six equal cards in official order', async () => {
  const ctx = recordingContext();
  const result = await renderStory(ctx, { uf: 'BA' }, { logo });

  assert.deepEqual(result, { width: 1080, height: 1920 });
  assert.deepEqual(ctx.calls[0], {
    method: 'fillRect', args: [0, 0, 1080, 1920], fillStyle: '#F2F7EF',
    strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1,
  });

  const cardYs = ctx.calls
    .filter(({ method, args }) => method === 'roundRect'
      && args[0] === 72 && args[2] === 936 && args[3] === 210)
    .map(({ args }) => args[1]);
  assert.deepEqual([...new Set(cardYs)], [300, 528, 756, 984, 1212, 1440]);

  assert.deepEqual(
    [300, 528, 756, 984, 1212, 1440].map((y) => textAt(ctx, y + 47)),
    [
      'DEPUTADO FEDERAL', 'DEPUTADO ESTADUAL', 'SENADOR · 1ª VAGA',
      'SENADOR · 2ª VAGA', 'GOVERNADOR', 'PRESIDENTE',
    ],
  );

  const numberFields = ctx.calls.filter(({ method, args }) => method === 'roundRect'
    && args[0] === 812 && args[2] === 176 && args[3] === 110);
  assert.equal(numberFields.length, 6);

  assert.ok(ctx.calls.some(({ method, args }) => method === 'drawImage' && args[0] === logo));
  assert.ok(ctx.calls.some(({ method, args }) => method === 'fillText'
    && args[0] === 'MEUSANTINHO.COM.BR'));
  assert.equal(ctx.calls.some(({ method, args }) => method === 'fillText'
    && ['Nome Técnico', 'XX', '0123'].includes(args[0])), false);
});

test('keeps the upper decorative circle separate from the 2026 chip', async () => {
  const ctx = recordingContext();
  await renderStory(ctx, { uf: 'BA' }, { logo });

  const upperCircle = ctx.calls.find(({ method, args }) => (
    method === 'arc' && args[0] > 900
  ));
  assert.ok(upperCircle);
  const [, centerY, radius] = upperCircle.args;
  assert.ok(centerY + radius <= 145);
});

test('uses the district label only for DF', async () => {
  const ctx = recordingContext();
  await renderStory(ctx, { uf: 'DF' }, { logo });

  assert.equal(textAt(ctx, 528 + 47), 'DEPUTADO DISTRITAL');
});

test('renders supplied candidate text and preserves a leading-zero number', async () => {
  const ctx = recordingContext();
  await renderStory(ctx, {
    uf: 'BA',
    federalDeputy: candidate('f1', '0123', { name: 'Álvaro Ção', party: 'ABC' }),
  }, { logo });

  const renderedTexts = ctx.calls
    .filter(({ method }) => method === 'fillText')
    .map(({ args }) => args[0]);
  assert.ok(renderedTexts.includes('Álvaro Ção'));
  assert.ok(renderedTexts.includes('ABC'));
  assert.ok(renderedTexts.includes('0123'));
});

test('loads a photo through the supplied resolver and falls back when it fails', async () => {
  const resolved = { width: 200, height: 400 };
  const success = recordingContext();
  await renderStory(success, {
    uf: 'BA',
    president: candidate('p1', '01', { photo: '/photo.png' }),
  }, {
    logo,
    resolvePhoto: async () => resolved,
  });
  assert.ok(success.calls.some(({ method, args }) => method === 'drawImage' && args[0] === resolved));

  const failure = recordingContext();
  await renderStory(failure, {
    uf: 'BA',
    president: candidate('p1', '01', { photo: '/missing.png' }),
  }, {
    logo,
    resolvePhoto: async () => { throw new Error('missing'); },
  });
  assert.ok(failure.calls.some(({ method }) => method === 'ellipse'));
});

test('does not paint a photo when the preview generation goes stale during resolvePhoto', async () => {
  const resolved = { width: 200, height: 400 };
  let current = true;
  const ctx = recordingContext();

  await assert.rejects(
    () => renderStory(ctx, {
      uf: 'BA',
      president: candidate('p1', '01', { photo: '/photo.png' }),
    }, {
      logo,
      isCurrent: () => current,
      resolvePhoto: async () => {
        current = false;
        return resolved;
      },
    }),
    (error) => error instanceof PreviewStaleError,
  );

  assert.equal(
    ctx.calls.some(({ method, args }) => method === 'drawImage' && args[0] === resolved),
    false,
  );
});
