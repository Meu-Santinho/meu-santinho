# Story Meu Santinho 2026

Renderizador determinístico em Canvas 2D para gerar um story eleitoral de 1080 × 1920 px. A composição mantém seis posições iguais na ordem oficial da urna em 2026 e aceita posições ainda não selecionadas sem inventar conteúdo.

## Arquivos

- `source/render.mjs` — função de renderização compatível com Canvas 2D do navegador;
- `source/validation.mjs` — validação e normalização dos dados;
- `source/tokens.mjs` — dimensões, cores e ordem dos cargos;
- `reference/story-layout-imagegen-v1.png` — referência composicional criada no ImageGen;
- `dist/story-empty.png` — template vazio final em 1080 × 1920;
- `dist/story-demo.png` — teste visual preenchido com dados técnicos sintéticos.

A imagem do ImageGen é apenas referência visual. Ela não é usada pelo renderizador. A exportação final usa a logomarca vetorial real, texto Canvas e coordenadas determinísticas.

## Contrato de dados

```js
const storyData = {
  uf: 'BA',
  federalDeputy: null,
  stateOrDistrictDeputy: null,
  senatorFirstSeat: null,
  senatorSecondSeat: null,
  governor: null,
  president: null,
};
```

Uma posição selecionada tem esta forma:

```js
{
  id: 'identidade-estavel-do-candidato',
  photo: 'https://exemplo.com/foto.jpg',
  name: 'Nome do Candidato',
  number: '0123',
  party: 'SIGLA'
}
```

`number` é sempre uma string para preservar zeros à esquerda. A quantidade de dígitos depende do cargo:

| Posição | Dígitos |
|---|---:|
| Deputado federal | 4 |
| Deputado estadual ou distrital | 5 |
| Senador — 1ª vaga | 3 |
| Senador — 2ª vaga | 3 |
| Governador | 2 |
| Presidente | 2 |

Quando `uf` é `DF`, o segundo rótulo muda automaticamente para `DEPUTADO DISTRITAL`. Nas demais UFs, ele permanece `DEPUTADO ESTADUAL`.

Os dois candidatos ao Senado precisam ter `id` diferentes. Uma duplicidade produz `StoryValidationError` antes de qualquer desenho no canvas.

## Integração no navegador

Declare a Nunito local com `@font-face` antes da renderização:

```css
@font-face {
  font-family: "Nunito";
  src: url("/brand/source/fonts/Nunito[wght].ttf") format("truetype");
  font-weight: 200 1000;
  font-style: normal;
  font-display: swap;
}
```

Configure o canvas com sua resolução interna real. O tamanho visual pode ser reduzido por CSS sem alterar o PNG exportado.

```html
<canvas id="story" style="width: 270px; height: 480px"></canvas>
```

```js
import {
  StoryValidationError,
  renderStory,
} from './story/source/render.mjs';

const canvas = document.querySelector('#story');
canvas.width = 1080;
canvas.height = 1920;
const ctx = canvas.getContext('2d');

const loadBrowserImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
  image.src = src;
});

await document.fonts.load('900 42px Nunito');
const logo = await loadBrowserImage('/brand/dist/svg/logo-horizontal.svg');

try {
  await renderStory(ctx, storyData, {
    logo,
    resolvePhoto: loadBrowserImage,
  });
} catch (error) {
  if (error instanceof StoryValidationError) {
    console.table(error.issues);
  } else {
    throw error;
  }
}

const pngBlob = await new Promise((resolve, reject) => {
  canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('Falha ao exportar PNG.')),
    'image/png',
  );
});
```

Fotos remotas precisam permitir CORS para o domínio do aplicativo. Se uma foto selecionada falhar, o card recebe uma silhueta geométrica neutra. Se a posição estiver vazia, a área de foto fica vazia — sem silhueta, texto ou mensagem de placeholder.

O nome ocupa no máximo duas linhas. O renderizador tenta 42 px, reduz progressivamente até 30 px e só então aplica reticências.

## Comandos

```bash
npm run story:empty
npm run story:demo
npm run story:verify
```

- `story:empty` recria `dist/story-empty.png`;
- `story:demo` recria `dist/story-demo.png` com fixtures técnicas;
- `story:verify` executa todos os testes, gera os dois PNGs e repete os testes.

O código em `story/source/` não importa Node.js nem `@napi-rs/canvas`. Essa dependência existe somente no adaptador de demonstração em `scripts/story/render-demo.mjs`.
