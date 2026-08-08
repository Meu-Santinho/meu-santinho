# Meu Santinho — Integração TSE via Astro + Cloudflare Workers

**Data:** 8 de agosto de 2026  
**Status:** aprovado para planejamento  
**Escopo:** página web mínima para buscar e selecionar os seis candidatos oficiais (Eleições Gerais 2026) e gerar o story PNG, com proxy do DivulgaCandContas em Cloudflare Workers

## 1. Objetivo

Permitir que o eleitor escolha UF, busque candidatos oficiais por nome (e opcionalmente por número), preencha as seis posições do primeiro turno e exporte o story 1080 × 1920 px já implementado em `story/source/`.

A obtenção de dados eleitorais e a seleção na interface estavam fora do escopo da especificação do story (`2026-08-03-meu-santinho-story-design.md`). Esta especificação cobre exatamente esse próximo bloco.

## 2. Decisões de produto

| Decisão | Escolha |
|---|---|
| Resultado principal | Busca + seleção → montagem de `storyData` → prévia e PNG |
| Superfície | Página web mínima no repositório |
| Busca | Por nome; opcionalmente por número eleitoral |
| Fonte de dados | Consulta ao vivo na API DivulgaCandContas do TSE |
| Fotografias | URL oficial do TSE, carregada via proxy (não direto do browser) |
| Hospedagem / proxy | Astro com adapter Cloudflare + rotas Worker |

## 3. Arquitetura

```
Browser (Astro)
  ├─ UI: UF → busca por cargo (nome / número) → 6 slots
  ├─ preview: renderStory(ctx, storyData, { logo, resolvePhoto })
  └─ fetch /api/tse/*

Worker (rotas server do Astro no Cloudflare)
  ├─ GET /api/tse/search?uf=&cargo=&q=
  ├─ GET /api/tse/candidate/:id
  └─ GET /api/tse/photo?url=…

TSE DivulgaCandContas (origem)
```

### Fronteiras

1. **Adaptador TSE** — único módulo que conhece códigos de eleição, cargo e unidade eleitoral do TSE; mapeia respostas para o contrato do story.
2. **`story/source/`** — permanece o contrato de renderização; a página apenas monta `storyData` válido. Não importa Node nem `@napi-rs/canvas`.
3. **Proxy Worker** — o browser nunca chama `divulgacandcontas.tse.jus.br` diretamente; busca e fotos passam pelo Worker (CORS e SSRF controlados).

O render do story continua 100% no cliente (Canvas 2D). O Worker não gera PNG.

## 4. Contrato do adaptador

### Entrada de busca

- `uf` — UF brasileira válida (mesmo conjunto de `story/source/validation.mjs`);
- `cargo` — uma das chaves do story: `federalDeputy`, `stateOrDistrictDeputy`, `senatorFirstSeat`, `senatorSecondSeat`, `governor`, `president`;
- `q` — texto de busca (nome ou número).

### Saída de candidato (story)

```js
{
  id,      // string estável do TSE (código da candidatura)
  photo,   // URL do nosso proxy, não do host TSE
  name,    // nome de urna preferencialmente
  number,  // string com zeros à esquerda
  party    // sigla partidária
}
```

Comprimentos de `number` por cargo seguem a tabela já definida no story (4 / 5 / 3 / 3 / 2 / 2).

### Rotas do Worker

| Rota | Papel |
|---|---|
| `GET /api/tse/search` | Lista curta filtrada por UF + cargo + `q` |
| `GET /api/tse/candidate/:id` | Detalhe quando a lista não trouxer foto/partido completos |
| `GET /api/tse/photo` | Proxy com allowlist de hosts TSE; stream da imagem |

Erros do TSE viram JSON `{ error, code }` com status HTTP adequado (`400`, `404`, `502`, `504`), sem repassar HTML do tribunal.

## 5. Comportamento de busca

- Primária: nome, comparação case-insensitive nos campos de nome expostos pela API 2026 (nome de urna e/ou nome completo).
- Se `q` for composto só por dígitos e tiver o comprimento exato do cargo, trata como número eleitoral.
- Resultados limitados (máximo 20) por consulta.
- Debounce de ~300 ms no cliente; um request por digitação estabilizada; sem prefetch agressivo.
- Sem espelho/cache local persistente neste escopo. Cache HTTP curto no Worker para a mesma query é permitido como detalhe de implementação, não como catálogo offline.

## 6. Estado da página

Estado único no cliente:

```js
{
  uf,
  federalDeputy,
  stateOrDistrictDeputy,
  senatorFirstSeat,
  senatorSecondSeat,
  governor,
  president
}
```

Cada posição é `null` ou um candidato normalizado.

Ao trocar a UF:

- limpar slots estaduais/distritais, senado e governador;
- o presidente pode permanecer (cargo nacional).

Regras já existentes do story continuam válidas: rótulo distrital para `DF`; senadores com `id` distintos; validação antes de exportar.

## 7. Interface

Uma única rota Astro, layout vertical, tokens da identidade (fundo `#F2F7EF`, verde/azul/amarelo da marca). Sem dashboard.

**Topo:** wordmark horizontal + selo `2026` + seletor de UF (obrigatório antes de buscar).

**Corpo:** seis blocos na ordem da urna. Em cada um:

- rótulo do cargo (`deputado distrital` se `DF`);
- campo de busca (placeholder: “nome ou número”);
- lista compacta de resultados; clique preenche o slot;
- slot preenchido: foto (via proxy), nome, partido, número e ação limpar.

**Base (sticky):**

- prévia do story (canvas 1080 × 1920 escalado por CSS, ex. 270 × 480);
- botões `Atualizar prévia` e `Baixar PNG`;
- erros de validação em texto curto.

**Estados vazios:**

- slot sem candidato = card neutro como no renderizador;
- busca sem UF = campo desabilitado;
- busca sem resultados = “Nenhum candidato encontrado”.

## 8. Preview e exportação

- Usar `renderStory` e a validação já existentes.
- Carregar Nunito e `brand/dist/svg/logo-horizontal.svg` como na documentação do story.
- `resolvePhoto` faz fetch das URLs já proxied (`/api/tse/photo?...`).
- Exportação via `canvas.toBlob('image/png')`.
- Falha de foto → silhueta neutra (comportamento atual do story).

## 9. Segurança e resiliência do proxy

- Allowlist estrita de hosts para `/api/tse/photo` (apenas origens oficiais do TSE). URLs arbitrárias são rejeitadas (anti-SSRF).
- Timeout nas chamadas ao TSE; falhas viram `502`/`504` com mensagem estável para a UI.
- Mensagem de UI para indisponibilidade: “Não foi possível consultar o TSE. Tente de novo.”
- Busca sem UF ou com `q` vazio não deve chamar a API (validação no cliente e `400` no Worker).

## 10. Constantes eleitorais 2026

Centralizar e documentar:

- identificador da eleição no DivulgaCandContas;
- códigos de cargo por slot do story;
- mapa UF → unidade eleitoral exigida pela API.

Se o ambiente de desenvolvimento não expuser ainda os dados 2026, usar fixtures + modo mock até a API responder. A descoberta desses IDs faz parte da implementação, não fica como TBD na especificação de produto: o adaptador deve falhar de forma explícita se as constantes estiverem ausentes ou inválidas.

Fonte de referência não oficial da API: documentação comunitária do DivulgaCandContas (OpenAPI). Preferir sempre validar contra respostas reais do TSE em 2026.

## 11. Testes

- Adaptador: fixtures JSON do TSE → candidato do story (dígitos, UF, DF → distrital).
- Rotas: allowlist de foto; search com query inválida.
- Manter `story:verify` e a toolchain de brand intactos.
- Playwright/e2e fica fora do MVP; pode ser adicionado depois.

## 12. Deploy e desenvolvimento local

- Astro com `@astrojs/cloudflare` e `wrangler`.
- `npm run dev` (ou script equivalente do app) sobe a página com as rotas de proxy.
- Scripts Node existentes (`brand:*`, `story:*`) continuam no repositório e não são substituídos pelo Astro.

## 13. Critérios de sucesso

1. Escolher UF na página.
2. Encontrar candidatos por nome e por número para os cargos aplicáveis.
3. Preencher os seis slots com dados oficiais mapeados ao contrato do story.
4. Ver prévia coerente com o renderizador atual.
5. Baixar PNG 1080 × 1920 válido.
6. Senador duplicado e demais validações do story bloqueiam a exportação com erro claro.
7. Browser nunca depende de CORS liberado pelo TSE.

## 14. Fora de escopo

- Espelho/cache local persistente do catálogo nacional;
- login, favoritos, histórico ou persistência entre sessões;
- compartilhamento automático no Instagram;
- template de segundo turno;
- personalização de cores por partido;
- textos de campanha ou recomendação política;
- app mobile nativo;
- substituição do renderizador Node de demonstração (`scripts/story/`).

## 15. Entregáveis

1. App Astro integrado ao monorepo (estrutura a detalhar no plano de implementação).
2. Rotas Worker de search, candidate e photo.
3. Adaptador TSE → contrato do story, com constantes 2026 documentadas.
4. Página única de seleção + prévia + download.
5. Testes do adaptador e das salvaguardas do proxy.
6. Documentação curta de desenvolvimento e deploy (`README` do app ou seção no README raiz).
