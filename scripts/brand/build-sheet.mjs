import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { COLORS } from '../../brand/source/tokens.mjs';
import { outlineText } from '../../brand/source/wordmark.mjs';
import './build-svg.mjs';

const sheetWidth = 1920;
const sheetHeight = 1080;
const svgDirectory = 'brand/dist/svg';

const innerSvg = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

function fitSvg(svg, x, y, maxWidth, maxHeight) {
  const match = svg.match(/viewBox="([^"]+)"/);
  if (!match) throw new Error('SVG asset is missing a viewBox');
  const [minX, minY, width, height] = match[1].split(/\s+/).map(Number);
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const left = x + (maxWidth - width * scale) / 2 - minX * scale;
  const top = y + (maxHeight - height * scale) / 2 - minY * scale;
  return `<g transform="translate(${left} ${top}) scale(${scale})">${innerSvg(svg)}</g>`;
}

async function label(text, x, y, fontSize = 18, fill = COLORS.deep, tracking = 0.4) {
  const outlined = await outlineText({ text, fontSize, tracking, fill });
  return `<g transform="translate(${x} ${y})">${outlined.markup}</g>`;
}

async function logoPanel({ name, x, y, width, height, asset, background = COLORS.white }) {
  return [
    `<g data-label="${name}">`,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="${background}" stroke="${COLORS.deep}" stroke-opacity=".12"/>`,
    await label(name, x + 24, y + 24, 16, background === COLORS.deep ? COLORS.white : COLORS.deep, 0.5),
    fitSvg(asset, x + 34, y + 65, width - 68, height - 94),
    '</g>'
  ].join('');
}

async function colorChip({ name, hex, x }) {
  const darkText = hex === COLORS.yellow || hex === COLORS.mist || hex === COLORS.white;
  const ink = darkText ? COLORS.deep : COLORS.white;
  return [
    `<g data-color="${hex}">`,
    `<rect x="${x}" y="850" width="280" height="150" rx="22" fill="${hex}" stroke="${COLORS.deep}" stroke-opacity=".13"/>`,
    await label(name, x + 18, 874, 14, ink, 0.35),
    await label(hex, x + 18, 956, 15, ink, 0.7),
    '</g>'
  ].join('');
}

export async function buildBrandSheet() {
  const assetNames = [
    'logo-primary.svg', 'logo-horizontal.svg', 'logo-edition-2026.svg',
    'logo-monochrome.svg', 'symbol.svg', 'favicon.svg'
  ];
  const assets = Object.fromEntries(await Promise.all(assetNames.map(async (name) => [
    name,
    await readFile(`${svgDirectory}/${name}`, 'utf8')
  ])));

  const content = [];
  content.push(`<rect width="${sheetWidth}" height="${sheetHeight}" fill="${COLORS.mist}"/>`);
  content.push(await label('meu santinho', 72, 55, 56, COLORS.blue, -0.6));
  content.push(await label('identidade visual · eleições 2026', 74, 126, 17, COLORS.deep, 0.8));

  content.push(await logoPanel({
    name: 'Principal', x: 72, y: 178, width: 650, height: 288,
    asset: assets['logo-primary.svg']
  }));
  content.push(await logoPanel({
    name: 'Horizontal', x: 746, y: 178, width: 750, height: 288,
    asset: assets['logo-horizontal.svg']
  }));
  content.push(await logoPanel({
    name: 'Símbolo', x: 1520, y: 178, width: 328, height: 288,
    asset: assets['symbol.svg']
  }));
  content.push(await logoPanel({
    name: 'Eleições 2026', x: 72, y: 490, width: 650, height: 288,
    asset: assets['logo-edition-2026.svg']
  }));
  content.push(await logoPanel({
    name: 'Monocromática', x: 746, y: 490, width: 510, height: 288,
    asset: assets['logo-monochrome.svg']
  }));

  content.push('<g data-label="Tamanho mínimo">');
  content.push(`<rect x="1280" y="490" width="266" height="288" rx="24" fill="${COLORS.white}" stroke="${COLORS.deep}" stroke-opacity=".12"/>`);
  content.push(await label('24 px', 1304, 514, 16, COLORS.deep, 0.6));
  content.push(fitSvg(assets['favicon.svg'], 1310, 588, 24, 24));
  content.push(fitSvg(assets['favicon.svg'], 1370, 570, 118, 132));
  content.push(await label('real', 1304, 628, 11, COLORS.deep, 0.4));
  content.push(await label('ampliado', 1387, 716, 11, COLORS.deep, 0.4));
  content.push('</g>');

  content.push('<g data-label="Área de proteção">');
  content.push(`<rect x="1570" y="490" width="278" height="288" rx="24" fill="${COLORS.white}" stroke="${COLORS.deep}" stroke-opacity=".12"/>`);
  content.push(await label('Área de proteção', 1594, 514, 16, COLORS.deep, 0.4));
  content.push(`<rect x="1617" y="570" width="184" height="170" rx="18" fill="none" stroke="${COLORS.green}" stroke-width="2" stroke-dasharray="8 7"/>`);
  content.push(fitSvg(assets['symbol.svg'], 1663, 592, 92, 126));
  content.push(await label('1 círculo', 1667, 744, 11, COLORS.green, 0.35));
  content.push('</g>');

  const chips = [
    ['Verde profundo', COLORS.deep], ['Azul brasileiro', COLORS.blue],
    ['Verde vivo', COLORS.green], ['Amarelo açafrão', COLORS.yellow],
    ['Névoa clara', COLORS.mist], ['Branco', COLORS.white]
  ];
  for (const [index, [name, hex]] of chips.entries()) {
    content.push(await colorChip({ name, hex, x: 72 + index * 296 }));
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetWidth} ${sheetHeight}" role="img" aria-label="Folha da identidade Meu Santinho">${content.join('')}</svg>`;
  await writeFile('brand/dist/brand-sheet.svg', `${svg}\n`, 'utf8');
  await sharp(Buffer.from(svg))
    .resize(sheetWidth, sheetHeight)
    .png()
    .toFile('brand/dist/brand-sheet.png');
}

await buildBrandSheet();
