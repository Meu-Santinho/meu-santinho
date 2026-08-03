import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import './build-svg.mjs';

const svgDirectory = 'brand/dist/svg';
const outputDirectory = 'brand/dist/png';

const jobs = [
  ['logo-primary.svg', 'logo-primary-1200.png', 1200],
  ['logo-horizontal.svg', 'logo-horizontal-1600.png', 1600],
  ['logo-edition-2026.svg', 'logo-edition-2026-1600.png', 1600],
  ['symbol.svg', 'symbol-1024.png', 1024],
  ['favicon.svg', 'favicon-32.png', 32]
];

async function renderSvg(inputFile, outputFile, width) {
  const svg = await readFile(`${svgDirectory}/${inputFile}`);
  await sharp(svg, { density: 288 })
    .resize({ width, fit: 'inside', withoutEnlargement: false })
    .ensureAlpha()
    .png()
    .toFile(`${outputDirectory}/${outputFile}`);
}

async function renderAvatar() {
  const size = 1080;
  const symbolWidth = Math.round(size * 0.62);
  const symbol = await sharp(await readFile(`${svgDirectory}/symbol.svg`), { density: 288 })
    .resize({ width: symbolWidth })
    .ensureAlpha()
    .png()
    .toBuffer();
  const metadata = await sharp(symbol).metadata();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{
      input: symbol,
      left: Math.round((size - metadata.width) / 2),
      top: Math.round((size - metadata.height) / 2)
    }])
    .png()
    .toFile(`${outputDirectory}/avatar-1080.png`);
}

export async function renderPngAssets() {
  await mkdir(outputDirectory, { recursive: true });
  for (const [inputFile, outputFile, width] of jobs) {
    await renderSvg(inputFile, outputFile, width);
  }
  await renderAvatar();
}

await renderPngAssets();
