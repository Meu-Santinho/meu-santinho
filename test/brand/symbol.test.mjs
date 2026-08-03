import assert from 'node:assert/strict';
import test from 'node:test';
import { COLORS, SYMBOL } from '../../brand/source/tokens.mjs';
import { buildSymbol } from '../../brand/source/symbol.mjs';

test('brand tokens preserve the approved palette and geometry', () => {
  assert.deepEqual(COLORS, {
    deep: '#143C35', blue: '#0759A5', green: '#168F61',
    yellow: '#F6C700', mist: '#F2F7EF', white: '#FFFFFF'
  });
  assert.equal(SYMBOL.rotation, -5);
  assert.equal(SYMBOL.strokeWidth, 4);
});

test('full symbol is native SVG without forbidden elements', () => {
  const svg = buildSymbol({ mode: 'color', simplified: false });
  assert.match(svg, /viewBox="0 0 128 144"/);
  assert.match(svg, /data-part="list-lines"/);
  assert.doesNotMatch(svg, /<(text|image|linearGradient|radialGradient|filter)\b/);
});

test('favicon symbol removes only the list lines', () => {
  const svg = buildSymbol({ mode: 'color', simplified: true });
  assert.doesNotMatch(svg, /data-part="list-lines"/);
  assert.match(svg, /data-part="card"/);
  assert.match(svg, /data-part="confirmation"/);
});
