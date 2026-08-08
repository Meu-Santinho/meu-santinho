# Meu Santinho 2026 — Web

App Astro com adaptador Cloudflare Workers. A UI monta um `storyData` a partir das escolhas do usuário e renderiza o santinho no navegador com o módulo `story/source` (Canvas 2D, 1080×1920). O adaptador TSE vive em `../tse/source`; o Vite resolve `@tse` e `@story` via alias em `astro.config.mjs`, sem duplicar código no bundle.

## Desenvolvimento

Execute a partir da **raiz do monorepo**:

```sh
npm run web:dev
```

Outros comandos úteis na raiz:

```sh
npm run web:build    # build de produção
npm run web:deploy   # deploy via Wrangler (wrangler.jsonc)
npm run tse:verify   # testes TSE + verificação story (npm run tse:test && npm run story:verify)
```

**Variáveis de ambiente:** nenhuma é obrigatória no MVP. O proxy consulta a API pública DivulgaCandContas do TSE diretamente.

## Eleição e TSE

- **ID da eleição:** `20322002026` (ano 2026), definido em `tse/source/constants.mjs`.
- **Base:** `https://divulgacandcontas.tse.jus.br/divulga/rest/v1`.

Use a API do TSE com moderação: evite polling agressivo, respeite cache (`search` responde com `max-age=60`) e não automatize volume alto de requisições contra o serviço público.

## Endpoints do proxy (`prerender = false`)

| Rota | Uso |
|------|-----|
| `GET /api/tse/search?uf=&cargo=&q=` | Lista até 20 candidatos filtrados por nome ou número; `cargo` é a chave do slot (`president`, `governor`, …). |
| `GET /api/tse/candidate/:id?uf=&cargo=` | Detalhe de um candidato mapeado para o contrato do story. |
| `GET /api/tse/photo?url=` | Proxy de foto com allowlist de host (anti-SSRF); URLs retornadas pela busca já apontam para este path. |

O proxy **não** funciona em páginas estáticas pré-renderizadas; as rotas acima exigem SSR no Worker.

## Como a UI usa `story` e `source`

1. **`web/src/lib/story-browser.js`** — estado `storyData` (`uf` + seis slots), busca com debounce de 300 ms, aborto de requisições ao trocar UF ou slot, e helpers de prévia/download.
2. **`story/source/render.mjs`** — desenha o layout no canvas; fotos via `resolvePhoto` (URLs do proxy `/api/tse/photo`).
3. **`story/source/tokens.mjs`** — ordem dos cargos, rótulos e metadados (ex.: deputado distrital em DF).
4. **`story/source/validation.mjs`** — normalização dos dados antes do desenho; `StoryValidationError` é exportado por `story/source/render.mjs`.

Contrato completo e exemplos: `../story/README.md`. Testes do adaptador TSE: `npm run tse:test` na raiz; pipeline story: `npm run story:verify`.
