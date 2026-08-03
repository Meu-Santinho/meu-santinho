import { buildSymbol } from './symbol.mjs';
import { COLORS } from './tokens.mjs';
import { buildWordmark, outlineText } from './wordmark.mjs';

export const LOCKUP_LAYOUTS = Object.freeze({
  primary: Object.freeze({
    symbol: Object.freeze({ x: 0, y: 0, width: 128 }),
    wordmark: Object.freeze({ x: 152, y: 11, layout: 'stacked' }),
    padding: 12
  }),
  horizontal: Object.freeze({
    symbol: Object.freeze({ x: 0, y: 0, width: 104 }),
    wordmark: Object.freeze({ x: 128, y: 31, layout: 'single-line' }),
    padding: 12
  }),
  'edition-2026': Object.freeze({
    symbol: Object.freeze({ x: 0, y: 0, width: 128 }),
    wordmark: Object.freeze({ x: 152, y: 11, layout: 'stacked' }),
    edition: Object.freeze({ x: 152, y: 137, copy: 'eleições 2026' }),
    padding: 12
  })
});

const innerSvg = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const round = (value) => Math.ceil(value * 100) / 100;

export async function buildLockup({ variant = 'primary', mode = 'color' } = {}) {
  const layout = LOCKUP_LAYOUTS[variant];
  if (!layout) throw new TypeError(`Unsupported lockup variant: ${variant}`);

  const padding = layout.padding;
  const scale = layout.symbol.width / 128;
  const symbolHeight = 144 * scale;
  const wordmark = await buildWordmark({ layout: layout.wordmark.layout, mode });
  let width = Math.max(layout.symbol.x + layout.symbol.width, layout.wordmark.x + wordmark.width);
  let height = Math.max(layout.symbol.y + symbolHeight, layout.wordmark.y + wordmark.height);
  let editionMarkup = '';

  if (layout.edition) {
    const edition = await outlineText({
      text: layout.edition.copy,
      fontSize: 18,
      tracking: 1.8,
      fill: COLORS.deep
    });
    const capsuleWidth = edition.width + 24;
    const capsuleHeight = edition.height + 14;
    width = Math.max(width, layout.edition.x + capsuleWidth);
    height = Math.max(height, layout.edition.y + capsuleHeight);
    editionMarkup = [
      `<g data-component="edition" transform="translate(${padding + layout.edition.x} ${padding + layout.edition.y})">`,
      `<rect width="${round(capsuleWidth)}" height="${round(capsuleHeight)}" rx="${round(capsuleHeight / 2)}" fill="${COLORS.yellow}" stroke="${COLORS.deep}" stroke-width="2"/>`,
      `<g transform="translate(12 7)">${edition.markup}</g>`,
      '</g>'
    ].join('');
  }

  const totalWidth = round(width + padding * 2);
  const totalHeight = round(height + padding * 2);
  const symbol = innerSvg(buildSymbol({ mode, simplified: false }));

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-label="Meu Santinho">`,
    `<g data-component="symbol" transform="translate(${padding + layout.symbol.x} ${padding + layout.symbol.y}) scale(${scale})">${symbol}</g>`,
    `<g data-component="wordmark" transform="translate(${padding + layout.wordmark.x} ${padding + layout.wordmark.y})">${wordmark.markup}</g>`,
    editionMarkup,
    '</svg>'
  ].join('');
}
