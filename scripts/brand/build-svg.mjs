import { mkdir, writeFile } from 'node:fs/promises';
import { optimize } from 'svgo';
import { buildLockup } from '../../brand/source/lockups.mjs';
import { buildSymbol } from '../../brand/source/symbol.mjs';

const outputDirectory = 'brand/dist/svg';

const jobs = [
  ['logo-primary.svg', () => buildLockup({ variant: 'primary', mode: 'color' })],
  ['logo-horizontal.svg', () => buildLockup({ variant: 'horizontal', mode: 'color' })],
  ['logo-edition-2026.svg', () => buildLockup({ variant: 'edition-2026', mode: 'color' })],
  ['logo-negative.svg', () => buildLockup({ variant: 'primary', mode: 'negative' })],
  ['logo-monochrome.svg', () => buildLockup({ variant: 'primary', mode: 'mono' })],
  ['symbol.svg', () => buildSymbol({ mode: 'color', simplified: false })],
  ['favicon.svg', () => buildSymbol({ mode: 'color', simplified: true })]
];

const svgoConfig = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false
        }
      }
    },
    'removeDimensions'
  ]
};

export async function buildSvgAssets() {
  await mkdir(outputDirectory, { recursive: true });
  for (const [fileName, build] of jobs) {
    const source = await build();
    const result = optimize(source, { ...svgoConfig, path: fileName });
    await writeFile(`${outputDirectory}/${fileName}`, `${result.data}\n`, 'utf8');
  }
}

await buildSvgAssets();
