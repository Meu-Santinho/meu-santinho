import { COLORS, SYMBOL } from './tokens.mjs';

const palettes = Object.freeze({
  color: Object.freeze({
    outline: COLORS.deep, paper: COLORS.white,
    shadow: COLORS.yellow, confirm: COLORS.green, check: COLORS.white
  }),
  negative: Object.freeze({
    outline: COLORS.white, paper: COLORS.deep,
    shadow: COLORS.yellow, confirm: COLORS.green, check: COLORS.white
  }),
  mono: Object.freeze({
    outline: COLORS.deep, paper: COLORS.white,
    shadow: COLORS.deep, confirm: COLORS.deep, check: COLORS.white
  })
});

export function buildSymbol({ mode = 'color', simplified = false } = {}) {
  const colors = palettes[mode];
  if (!colors) throw new TypeError(`Unsupported symbol mode: ${mode}`);

  const lines = simplified ? '' : [
    `<g data-part="list-lines" stroke="${colors.outline}" stroke-width="7" stroke-linecap="round">`,
    '<path d="M38 43h38"/>',
    '<path d="M38 62h38"/>',
    '</g>'
  ].join('');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SYMBOL.viewBox}" role="img" aria-label="Símbolo Meu Santinho">`,
    '<g transform="rotate(-5 58 65)">',
    `<rect data-part="shadow" x="28" y="21" width="76" height="102" rx="15" fill="${colors.shadow}"/>`,
    `<rect data-part="card" x="20" y="12" width="76" height="102" rx="15" fill="${colors.paper}" stroke="${colors.outline}" stroke-width="4"/>`,
    lines,
    '</g>',
    '<g data-part="confirmation">',
    `<circle cx="87" cy="105" r="23" fill="${colors.confirm}" stroke="${colors.outline}" stroke-width="4"/>`,
    `<path d="M76 105l8 8 15-18" fill="none" stroke="${colors.check}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    '</g>',
    '</svg>'
  ].join('');
}
