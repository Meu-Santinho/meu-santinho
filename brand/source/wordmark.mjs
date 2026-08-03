import * as fontkit from 'fontkit';
import { COLORS } from './tokens.mjs';

const baseFont = fontkit.openSync('brand/source/fonts/Nunito[wght].ttf');
const font = baseFont.getVariation({ wght: 900 });

export const WORDMARK_SETTINGS = Object.freeze({
  copy: 'meu santinho',
  stackedLines: Object.freeze(['meu', 'santinho']),
  fontSize: 72,
  lineHeight: 60,
  letterSpacing: -1.2,
  color: COLORS.blue
});

const colorsForMode = Object.freeze({
  color: COLORS.blue,
  negative: COLORS.white,
  mono: COLORS.deep
});

export async function outlineText({ text, fontSize, tracking = 0, fill = COLORS.blue }) {
  const run = font.layout(text);
  const scale = fontSize / font.unitsPerEm;
  let cursor = 0;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const placements = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const originX = cursor + position.xOffset;
    const originY = position.yOffset;
    const { bbox } = glyph;
    minX = Math.min(minX, originX + bbox.minX);
    minY = Math.min(minY, originY + bbox.minY);
    maxX = Math.max(maxX, originX + bbox.maxX);
    maxY = Math.max(maxY, originY + bbox.maxY);
    cursor += position.xAdvance + tracking / scale;
    return { glyph, originX, originY };
  });

  if (placements.length === 0) return { markup: '', width: 0, height: 0 };

  const markup = placements.map(({ glyph, originX, originY }) => {
    const path = glyph.path.toSVG();
    if (!path) return '';
    const x = (originX - minX) * scale;
    const y = (maxY - originY) * scale;
    return `<path d="${path}" transform="translate(${x} ${y}) scale(${scale} ${-scale})" fill="${fill}"/>`;
  }).join('');

  return {
    markup,
    width: (maxX - minX) * scale,
    height: (maxY - minY) * scale
  };
}

export async function buildWordmark({ layout = 'stacked', mode = 'color' } = {}) {
  const fill = colorsForMode[mode];
  if (!fill) throw new TypeError(`Unsupported wordmark mode: ${mode}`);

  if (layout === 'single-line') {
    return outlineText({
      text: WORDMARK_SETTINGS.copy,
      fontSize: WORDMARK_SETTINGS.fontSize,
      tracking: WORDMARK_SETTINGS.letterSpacing,
      fill
    });
  }

  if (layout !== 'stacked') throw new TypeError(`Unsupported wordmark layout: ${layout}`);

  const lines = await Promise.all(WORDMARK_SETTINGS.stackedLines.map((text) => outlineText({
    text,
    fontSize: WORDMARK_SETTINGS.fontSize,
    tracking: WORDMARK_SETTINGS.letterSpacing,
    fill
  })));
  const markup = lines.map((line, index) => (
    `<g transform="translate(0 ${index * WORDMARK_SETTINGS.lineHeight})">${line.markup}</g>`
  )).join('');

  return {
    markup,
    width: Math.max(...lines.map((line) => line.width)),
    height: WORDMARK_SETTINGS.lineHeight + lines.at(-1).height
  };
}
