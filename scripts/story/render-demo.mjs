import { mkdir, writeFile } from 'node:fs/promises';

import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';

import { renderStory } from '../../story/source/render.mjs';

const empty = process.argv.includes('--empty');
const outputPath = empty
  ? 'story/dist/story-empty.png'
  : 'story/dist/story-demo.png';

const fontRegistered = GlobalFonts.registerFromPath(
  'brand/source/fonts/Nunito[wght].ttf',
  'Nunito',
);
if (!fontRegistered) throw new Error('Não foi possível registrar a fonte Nunito.');

const canvas = createCanvas(1080, 1920);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

const logo = await loadImage('brand/dist/svg/logo-horizontal.svg');

const integrationData = {
  uf: 'BA',
  federalDeputy: {
    id: 'test-federal',
    photo: null,
    name: 'Nome de Integração',
    number: '0123',
    party: 'TESTE',
  },
  stateOrDistrictDeputy: {
    id: 'test-state',
    photo: null,
    name: 'Nome Composto Muito Longo para Verificação',
    number: '04567',
    party: 'TESTE',
  },
  senatorFirstSeat: {
    id: 'test-senate-1',
    photo: null,
    name: 'Álvaro Ção',
    number: '001',
    party: 'TESTE',
  },
  senatorSecondSeat: {
    id: 'test-senate-2',
    photo: null,
    name: 'Bia Técnica',
    number: '002',
    party: 'TESTE',
  },
  governor: {
    id: 'test-governor',
    photo: null,
    name: 'Nome Técnico',
    number: '01',
    party: 'TESTE',
  },
  president: {
    id: 'test-president',
    photo: null,
    name: 'Outro Nome',
    number: '02',
    party: 'TESTE',
  },
};

await renderStory(ctx, empty ? { uf: 'BA' } : integrationData, {
  logo,
  resolvePhoto: loadImage,
});

await mkdir('story/dist', { recursive: true });
await writeFile(outputPath, await canvas.encode('png'));
console.log(`Story exportado em ${outputPath}`);
