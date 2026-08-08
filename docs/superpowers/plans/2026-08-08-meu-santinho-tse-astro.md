# Meu Santinho TSE + Astro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página Astro mínima, com proxy Cloudflare Workers para o DivulgaCandContas, onde o eleitor busca e seleciona os seis candidatos oficiais de 2026 e exporta o story PNG.

**Architecture:** Adaptador TSE puro em `tse/source/` (testável com `node:test`). App Astro em `web/` com rotas server `/api/tse/*` que chamam o adaptador e fazem proxy de fotos com allowlist. A UI cliente monta `storyData` e chama `renderStory` de `story/source/` sem alterar o renderizador.

**Tech Stack:** Node.js 22+, npm, JavaScript ESM, Astro + `@astrojs/cloudflare`, Wrangler, `node:test`, Canvas 2D no browser.

## Global Constraints

- Browser nunca chama `divulgacandcontas.tse.jus.br` diretamente.
- `story/source/` permanece sem dependências de Node/`@napi-rs/canvas`.
- Contrato do candidato: `{ id, photo, name, number, party }` com `number` string e zeros à esquerda.
- Eleição 2026: `sq_ELEICAO = 20322002026`, ano `2026`.
- Códigos de cargo TSE: presidente `1`, governador `3`, senador `5`, dep. federal `6`, dep. estadual `7`, dep. distrital `8`.
- Unidade eleitoral: `BR` para presidente; sigla da UF para os demais.
- Busca primária por nome; se `q` for só dígitos com comprimento do cargo, buscar por número.
- Máximo 20 resultados por busca; debounce ~300 ms no cliente.
- Proxy de foto com allowlist (anti-SSRF); hosts permitidos incluem `divulgacandcontas.tse.jus.br`.
- Paleta da UI: mist `#F2F7EF`, deep `#143C35`, blue `#0759A5`, green `#168F61`, yellow `#F6C700`, white `#FFFFFF`.
- Trocar UF limpa slots estaduais/senado/governador; presidente pode permanecer.
- Sem espelho local persistente, login, favoritos ou segundo turno.
- Mensagem de falha TSE: `Não foi possível consultar o TSE. Tente de novo.`
- Toolchain `brand:*` e `story:*` permanece intacta.

---

## File Map

- `tse/source/constants.mjs` — eleição, cargos, UFs, dígitos, hosts de foto.
- `tse/source/map-candidate.mjs` — TSE JSON → candidato do story + URL de foto oficial.
- `tse/source/search.mjs` — filtro por nome/número e limite 20.
- `tse/source/photo.mjs` — parse/validação de URL de foto (allowlist).
- `tse/source/client.mjs` — fetch ao DivulgaCandContas (listar/buscar) com timeout.
- `tse/fixtures/list-presidente-br.json` — fixture enxuta para testes.
- `test/tse/*.test.mjs` — testes do adaptador.
- `web/` — app Astro + Cloudflare.
- `web/src/pages/index.astro` — UI única.
- `web/src/pages/api/tse/search.ts` — busca.
- `web/src/pages/api/tse/candidate/[id].ts` — detalhe.
- `web/src/pages/api/tse/photo.ts` — proxy de imagem.
- `web/src/lib/story-browser.js` — glue cliente: estado, debounce, preview, download.
- `web/public/brand/` — cópia ou symlink dos assets necessários (logo + fonte) documentada no README.
- `web/README.md` — dev e deploy.
- `package.json` (raiz) — scripts `tse:test` e `web:*` delegando ao app.

---

### Task 1: Constantes e mapeamento TSE → story

**Files:**
- Create: `tse/source/constants.mjs`
- Create: `tse/source/map-candidate.mjs`
- Create: `tse/fixtures/list-presidente-br.json`
- Create: `test/tse/map-candidate.test.mjs`
- Modify: `package.json` (script `tse:test`)

**Interfaces:**
- Consumes: shape TSE de listagem (`id`, `nomeUrna`, `nomeCompleto`, `numero`, `partido.sigla`, `fotoUrl` opcional).
- Produces:
  - `ELECTION = { year: 2026, id: 20322002026 }`
  - `SLOT_TO_CARGO` / `getCargoCode(slotKey, uf)` / `getElectoralUnit(slotKey, uf)` / `getDigits(slotKey)`
  - `PHOTO_ALLOWED_HOSTS`
  - `buildOfficialPhotoUrl({ electionId, candidateId, electoralUnit })`
  - `mapTseCandidate(raw, { slotKey, electoralUnit, photoProxyBase })` → story candidate

- [ ] **Step 1: Write the failing test**

Create `test/tse/map-candidate.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ELECTION,
  getCargoCode,
  getElectoralUnit,
  getDigits,
} from '../../tse/source/constants.mjs';
import {
  buildOfficialPhotoUrl,
  mapTseCandidate,
} from '../../tse/source/map-candidate.mjs';

test('constantes 2026 e cargos', () => {
  assert.equal(ELECTION.year, 2026);
  assert.equal(ELECTION.id, 20322002026);
  assert.equal(getCargoCode('president', 'BA'), 1);
  assert.equal(getCargoCode('governor', 'BA'), 3);
  assert.equal(getCargoCode('senatorFirstSeat', 'BA'), 5);
  assert.equal(getCargoCode('federalDeputy', 'BA'), 6);
  assert.equal(getCargoCode('stateOrDistrictDeputy', 'BA'), 7);
  assert.equal(getCargoCode('stateOrDistrictDeputy', 'DF'), 8);
  assert.equal(getElectoralUnit('president', 'BA'), 'BR');
  assert.equal(getElectoralUnit('governor', 'BA'), 'BA');
  assert.equal(getDigits('federalDeputy'), 4);
  assert.equal(getDigits('stateOrDistrictDeputy'), 5);
  assert.equal(getDigits('senatorFirstSeat'), 3);
  assert.equal(getDigits('governor'), 2);
  assert.equal(getDigits('president'), 2);
});

test('mapTseCandidate normaliza e aponta foto para o proxy', () => {
  const raw = {
    id: 280002541457,
    nomeUrna: 'HERTZ DIAS',
    numero: 16,
    partido: { sigla: 'PSTU' },
  };
  const mapped = mapTseCandidate(raw, {
    slotKey: 'president',
    electoralUnit: 'BR',
    photoProxyBase: '/api/tse/photo',
  });
  assert.equal(mapped.id, '280002541457');
  assert.equal(mapped.name, 'HERTZ DIAS');
  assert.equal(mapped.number, '16');
  assert.equal(mapped.party, 'PSTU');
  assert.equal(
    mapped.photo,
    '/api/tse/photo?url=' + encodeURIComponent(
      'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/280002541457/BR',
    ),
  );
  assert.equal(
    buildOfficialPhotoUrl({
      electionId: ELECTION.id,
      candidateId: 280002541457,
      electoralUnit: 'BR',
    }),
    'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/280002541457/BR',
  );
});

test('mapTseCandidate preserva zeros à esquerda no número', () => {
  const mapped = mapTseCandidate(
    { id: 1, nomeUrna: 'TESTE', numero: 12, partido: { sigla: 'ABC' } },
    { slotKey: 'federalDeputy', electoralUnit: 'BA', photoProxyBase: '/api/tse/photo' },
  );
  assert.equal(mapped.number, '0012');
});
```

Create a tiny fixture `tse/fixtures/list-presidente-br.json` with two candidates shaped like the TSE list (id, nomeUrna, nomeCompleto, numero, partido).

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/tse/map-candidate.test.mjs`  
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Write minimal implementation**

`tse/source/constants.mjs`:

```js
export const ELECTION = Object.freeze({ year: 2026, id: 20322002026 });

export const TSE_BASE_URL = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1';

export const PHOTO_ALLOWED_HOSTS = Object.freeze([
  'divulgacandcontas.tse.jus.br',
]);

export const VALID_UFS = Object.freeze([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

const SLOT_META = Object.freeze({
  federalDeputy: Object.freeze({ cargo: 6, digits: 4, unit: 'uf' }),
  stateOrDistrictDeputy: Object.freeze({ cargo: 7, digits: 5, unit: 'uf', dfCargo: 8 }),
  senatorFirstSeat: Object.freeze({ cargo: 5, digits: 3, unit: 'uf' }),
  senatorSecondSeat: Object.freeze({ cargo: 5, digits: 3, unit: 'uf' }),
  governor: Object.freeze({ cargo: 3, digits: 2, unit: 'uf' }),
  president: Object.freeze({ cargo: 1, digits: 2, unit: 'BR' }),
});

export function getDigits(slotKey) {
  const meta = SLOT_META[slotKey];
  if (!meta) throw new Error(`Slot desconhecido: ${slotKey}`);
  return meta.digits;
}

export function getCargoCode(slotKey, uf) {
  const meta = SLOT_META[slotKey];
  if (!meta) throw new Error(`Slot desconhecido: ${slotKey}`);
  if (slotKey === 'stateOrDistrictDeputy' && String(uf).toUpperCase() === 'DF') {
    return meta.dfCargo;
  }
  return meta.cargo;
}

export function getElectoralUnit(slotKey, uf) {
  const meta = SLOT_META[slotKey];
  if (!meta) throw new Error(`Slot desconhecido: ${slotKey}`);
  return meta.unit === 'BR' ? 'BR' : String(uf).trim().toUpperCase();
}

export function isValidUf(uf) {
  return VALID_UFS.includes(String(uf).trim().toUpperCase());
}

export function isValidSlotKey(slotKey) {
  return Object.hasOwn(SLOT_META, slotKey);
}
```

`tse/source/map-candidate.mjs`:

```js
import { ELECTION, getDigits } from './constants.mjs';

export function buildOfficialPhotoUrl({ electionId, candidateId, electoralUnit }) {
  return `https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/${electionId}/${candidateId}/${electoralUnit}`;
}

export function mapTseCandidate(raw, { slotKey, electoralUnit, photoProxyBase }) {
  const digits = getDigits(slotKey);
  const number = String(raw.numero ?? '').padStart(digits, '0');
  const official = buildOfficialPhotoUrl({
    electionId: ELECTION.id,
    candidateId: raw.id,
    electoralUnit,
  });
  return {
    id: String(raw.id),
    name: String(raw.nomeUrna ?? '').trim(),
    number,
    party: String(raw.partido?.sigla ?? '').trim(),
    photo: `${photoProxyBase}?url=${encodeURIComponent(official)}`,
  };
}
```

Add to root `package.json` scripts: `"tse:test": "node --test test/tse/*.test.mjs"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run tse:test`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tse package.json test/tse/map-candidate.test.mjs
git commit -m "feat: mapear candidatos do TSE para o contrato do story"
```

---

### Task 2: Filtro de busca e validação de URL de foto

**Files:**
- Create: `tse/source/search.mjs`
- Create: `tse/source/photo.mjs`
- Create: `test/tse/search.test.mjs`
- Create: `test/tse/photo.test.mjs`

**Interfaces:**
- Consumes: `mapTseCandidate`, `getDigits`, `PHOTO_ALLOWED_HOSTS`
- Produces:
  - `normalizeQuery(q)` → `{ kind: 'name'|'number'|'empty', value }`
  - `filterCandidates(list, { q, slotKey, electoralUnit, photoProxyBase, limit=20 })`
  - `assertAllowedPhotoUrl(urlString)` → `URL` ou throw com code `forbidden_host` / `invalid_url`

- [ ] **Step 1: Write the failing tests**

`test/tse/search.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterCandidates, normalizeQuery } from '../../tse/source/search.mjs';

const list = JSON.parse(readFileSync(new URL('../../tse/fixtures/list-presidente-br.json', import.meta.url)));

test('normalizeQuery distingue nome e número', () => {
  assert.deepEqual(normalizeQuery('  Hertz '), { kind: 'name', value: 'hertz' });
  assert.deepEqual(normalizeQuery('16', 2), { kind: 'number', value: '16' });
  assert.deepEqual(normalizeQuery('016', 2), { kind: 'name', value: '016' }); // comprimento ≠ digits
  assert.deepEqual(normalizeQuery('  '), { kind: 'empty', value: '' });
});

test('filterCandidates por nome e limita a 20', () => {
  const many = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    nomeUrna: `CANDIDATO ${i}`,
    nomeCompleto: `NOME ${i}`,
    numero: i,
    partido: { sigla: 'X' },
  }));
  const hits = filterCandidates(many, {
    q: 'candidato',
    slotKey: 'president',
    electoralUnit: 'BR',
    photoProxyBase: '/api/tse/photo',
    limit: 20,
  });
  assert.equal(hits.length, 20);
});

test('filterCandidates por número exato do cargo', () => {
  const hits = filterCandidates(list, {
    q: '16',
    slotKey: 'president',
    electoralUnit: 'BR',
    photoProxyBase: '/api/tse/photo',
  });
  assert.equal(hits.length, 1);
  assert.equal(hits[0].name, 'HERTZ DIAS');
  assert.equal(hits[0].number, '16');
});
```

Populate `list-presidente-br.json` with at least HERTZ DIAS (16) and one other president-shaped object.

`test/tse/photo.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertAllowedPhotoUrl } from '../../tse/source/photo.mjs';

test('aceita host oficial do TSE', () => {
  const url = assertAllowedPhotoUrl(
    'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/1/BR',
  );
  assert.equal(url.hostname, 'divulgacandcontas.tse.jus.br');
});

test('rejeita host arbitrário', () => {
  assert.throws(
    () => assertAllowedPhotoUrl('https://evil.example/x'),
    (err) => err.code === 'forbidden_host',
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test test/tse/search.test.mjs test/tse/photo.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement search.mjs and photo.mjs**

`tse/source/search.mjs`:

```js
import { getDigits } from './constants.mjs';
import { mapTseCandidate } from './map-candidate.mjs';

export function normalizeQuery(q, digits) {
  const trimmed = String(q ?? '').trim();
  if (!trimmed) return { kind: 'empty', value: '' };
  if (digits && /^\d+$/.test(trimmed) && trimmed.length === digits) {
    return { kind: 'number', value: trimmed };
  }
  return { kind: 'name', value: trimmed.toLocaleLowerCase('pt-BR') };
}

function matches(raw, query, digits) {
  if (query.kind === 'empty') return false;
  if (query.kind === 'number') {
    return String(raw.numero ?? '').padStart(digits, '0') === query.value.padStart(digits, '0');
  }
  const urna = String(raw.nomeUrna ?? '').toLocaleLowerCase('pt-BR');
  const completo = String(raw.nomeCompleto ?? '').toLocaleLowerCase('pt-BR');
  return urna.includes(query.value) || completo.includes(query.value);
}

export function filterCandidates(list, {
  q,
  slotKey,
  electoralUnit,
  photoProxyBase,
  limit = 20,
}) {
  const digits = getDigits(slotKey);
  const query = normalizeQuery(q, digits);
  if (query.kind === 'empty') return [];
  const out = [];
  for (const raw of list) {
    if (!matches(raw, query, digits)) continue;
    out.push(mapTseCandidate(raw, { slotKey, electoralUnit, photoProxyBase }));
    if (out.length >= limit) break;
  }
  return out;
}
```

`tse/source/photo.mjs`:

```js
import { PHOTO_ALLOWED_HOSTS } from './constants.mjs';

export function assertAllowedPhotoUrl(urlString) {
  let url;
  try {
    url = new URL(String(urlString ?? ''));
  } catch {
    const err = new Error('URL de foto inválida.');
    err.code = 'invalid_url';
    throw err;
  }
  if (url.protocol !== 'https:') {
    const err = new Error('URL de foto deve usar HTTPS.');
    err.code = 'invalid_url';
    throw err;
  }
  if (!PHOTO_ALLOWED_HOSTS.includes(url.hostname)) {
    const err = new Error('Host de foto não permitido.');
    err.code = 'forbidden_host';
    throw err;
  }
  return url;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run tse:test`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tse/source/search.mjs tse/source/photo.mjs tse/fixtures test/tse
git commit -m "feat: filtrar busca TSE e validar URL de foto"
```

---

### Task 3: Cliente HTTP do DivulgaCandContas

**Files:**
- Create: `tse/source/client.mjs`
- Create: `test/tse/client.test.mjs`

**Interfaces:**
- Consumes: `ELECTION`, `TSE_BASE_URL`, `getCargoCode`, `getElectoralUnit`
- Produces:
  - `createTseClient({ fetchImpl, timeoutMs=15000 })`
  - `client.listCandidates({ uf, slotKey })` → array bruto TSE
  - `client.getCandidate({ uf, slotKey, id })` → objeto detalhe TSE

- [ ] **Step 1: Write the failing test with mock fetch**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTseClient } from '../../tse/source/client.mjs';
import { ELECTION } from '../../tse/source/constants.mjs';

test('listCandidates monta URL correta e devolve candidatos', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify({
      candidatos: [{ id: 1, nomeUrna: 'A', numero: 12, partido: { sigla: 'X' } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const client = createTseClient({ fetchImpl, timeoutMs: 1000 });
  const list = await client.listCandidates({ uf: 'BA', slotKey: 'governor' });
  assert.equal(list.length, 1);
  assert.match(calls[0], new RegExp(`/candidatura/listar/${ELECTION.year}/BA/${ELECTION.id}/3/candidatos`));
});

test('listCandidates propaga falha HTTP como tse_upstream', async () => {
  const fetchImpl = async () => new Response('nope', { status: 502 });
  const client = createTseClient({ fetchImpl });
  await assert.rejects(
    () => client.listCandidates({ uf: 'BA', slotKey: 'governor' }),
    (err) => err.code === 'tse_upstream',
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/tse/client.test.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement client.mjs**

```js
import {
  ELECTION,
  TSE_BASE_URL,
  getCargoCode,
  getElectoralUnit,
} from './constants.mjs';

function upstreamError(message, cause) {
  const err = new Error(message);
  err.code = 'tse_upstream';
  err.cause = cause;
  return err;
}

export function createTseClient({ fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  async function getJson(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${TSE_BASE_URL}${path}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'meusantinho/0.1' },
        signal: controller.signal,
      });
      if (!response.ok) throw upstreamError(`TSE respondeu ${response.status}`);
      return await response.json();
    } catch (cause) {
      if (cause?.code === 'tse_upstream') throw cause;
      throw upstreamError('Falha ao consultar o TSE.', cause);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async listCandidates({ uf, slotKey }) {
      const unit = getElectoralUnit(slotKey, uf);
      const cargo = getCargoCode(slotKey, uf);
      const data = await getJson(
        `/candidatura/listar/${ELECTION.year}/${unit}/${ELECTION.id}/${cargo}/candidatos`,
      );
      return Array.isArray(data?.candidatos) ? data.candidatos : [];
    },
    async getCandidate({ uf, slotKey, id }) {
      const unit = getElectoralUnit(slotKey, uf);
      return getJson(
        `/candidatura/buscar/${ELECTION.year}/${unit}/${ELECTION.id}/candidato/${id}`,
      );
    },
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm run tse:test`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tse/source/client.mjs test/tse/client.test.mjs
git commit -m "feat: cliente HTTP do DivulgaCandContas"
```

---

### Task 4: Scaffold Astro + Cloudflare em `web/`

**Files:**
- Create: `web/package.json`, `web/astro.config.mjs`, `web/wrangler.jsonc`, `web/tsconfig.json`, `web/src/env.d.ts`, `web/src/pages/index.astro` (placeholder), `web/README.md`
- Modify: root `package.json` (scripts `web:dev`, `web:build`)

**Interfaces:**
- Consumes: nada do TSE ainda
- Produces: app Astro com adapter Cloudflare, `output: 'server'`, dev local funcional

- [ ] **Step 1: Scaffold the app**

From repo root:

```bash
npm create astro@latest web -- --template minimal --typescript strict --install --no-git --yes
cd web && npx astro add cloudflare --yes
```

If interactive prompts appear, prefer non-interactive flags; otherwise create files manually with:

`web/package.json` name `meusantinho-web`, scripts `dev`, `build`, `preview`.

`web/astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  vite: {
    server: {
      fs: { allow: ['..'] },
    },
  },
});
```

`web/wrangler.jsonc`:

```jsonc
{
  "name": "meusantinho-web",
  "compatibility_date": "2026-08-01",
  "main": "@astrojs/cloudflare/entrypoints/server",
}
```

(Adjust `main` if `astro add cloudflare` generates a different wrangler entry — keep whatever the adapter writes.)

- [ ] **Step 2: Placeholder page and root scripts**

`web/src/pages/index.astro` mínimo com título `Meu Santinho 2026`.

Root `package.json`:

```json
"web:dev": "npm --prefix web run dev",
"web:build": "npm --prefix web run build",
"web:deploy": "npm --prefix web run deploy"
```

`web/README.md`: como rodar `npm run web:dev`, build e deploy via Wrangler; nota de que o proxy TSE só funciona nas rotas server.

- [ ] **Step 3: Verify scaffold**

Run: `npm run web:build`  
Expected: build Astro/Cloudflare conclui sem erro.

- [ ] **Step 4: Commit**

```bash
git add web package.json package-lock.json
git commit -m "build: adicionar app Astro com adapter Cloudflare"
```

---

### Task 5: Rotas API `/api/tse/*`

**Files:**
- Create: `web/src/pages/api/tse/search.ts`
- Create: `web/src/pages/api/tse/candidate/[id].ts`
- Create: `web/src/pages/api/tse/photo.ts`
- Create: `web/src/lib/tse-server.ts` (wrapper que importa ESM de `../../../../tse/source/*` ou copia thin re-exports)
- Create: `test/tse/photo-route-logic.test.mjs` (reusa `assertAllowedPhotoUrl`; se a rota não for testável em node puro, testar só a lógica já coberta + um teste de parse de query em helper)

**Interfaces:**
- Consumes: `createTseClient`, `filterCandidates`, `mapTseCandidate`, `assertAllowedPhotoUrl`, `isValidUf`, `isValidSlotKey`, `getElectoralUnit`
- Produces: JSON/imagem conforme spec

- [ ] **Step 1: Implement `web/src/lib/tse-server.ts`**

Re-exportar funções do adaptador. Como o adaptador é `.mjs` ESM puro, importar por caminho relativo:

```ts
export {
  createTseClient,
} from '../../../../tse/source/client.mjs';
export {
  filterCandidates,
} from '../../../../tse/source/search.mjs';
export {
  mapTseCandidate,
} from '../../../../tse/source/map-candidate.mjs';
export {
  assertAllowedPhotoUrl,
} from '../../../../tse/source/photo.mjs';
export {
  isValidUf,
  isValidSlotKey,
  getElectoralUnit,
  getDigits,
} from '../../../../tse/source/constants.mjs';
```

Se o bundler Cloudflare rejeitar imports fora de `web/`, mover/copiar `tse/source` para `web/src/lib/tse/` **mantendo** os testes da raiz apontando para a mesma pasta canônica. Preferência: alias Vite:

```js
// astro.config.mjs vite.resolve.alias
resolve: { alias: { '@tse': new URL('../tse/source', import.meta.url).pathname } }
```

Escolher uma estratégia e documentá-la no `web/README.md`. Os testes `test/tse` devem continuar importando `tse/source`.

- [ ] **Step 2: Implement search route**

`web/src/pages/api/tse/search.ts`:

```ts
import type { APIRoute } from 'astro';
import {
  createTseClient,
  filterCandidates,
  isValidUf,
  isValidSlotKey,
  getElectoralUnit,
} from '../../../lib/tse-server';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const uf = url.searchParams.get('uf') ?? '';
  const cargo = url.searchParams.get('cargo') ?? '';
  const q = url.searchParams.get('q') ?? '';
  if (!isValidUf(uf) || !isValidSlotKey(cargo) || !q.trim()) {
    return new Response(JSON.stringify({ error: 'Parâmetros inválidos.', code: 'bad_request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  try {
    const client = createTseClient();
    const list = await client.listCandidates({ uf, slotKey: cargo });
    const results = filterCandidates(list, {
      q,
      slotKey: cargo,
      electoralUnit: getElectoralUnit(cargo, uf),
      photoProxyBase: '/api/tse/photo',
      limit: 20,
    });
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60',
      },
    });
  } catch {
    return new Response(JSON.stringify({
      error: 'Não foi possível consultar o TSE. Tente de novo.',
      code: 'tse_upstream',
    }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
};
```

- [ ] **Step 3: Implement candidate + photo routes**

`candidate/[id].ts`: valida `uf`+`cargo`+`id`, chama `getCandidate`, mapeia com `mapTseCandidate`, 404 se TSE 404, 502 genérico nas demais falhas.

`photo.ts`:

```ts
import type { APIRoute } from 'astro';
import { assertAllowedPhotoUrl } from '../../../lib/tse-server';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const target = url.searchParams.get('url');
  try {
    const allowed = assertAllowedPhotoUrl(target);
    const upstream = await fetch(allowed.toString(), {
      headers: { 'User-Agent': 'meusantinho/0.1' },
    });
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'Foto indisponível.', code: 'photo_upstream' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'image/jpeg',
        'cache-control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    const status = err?.code === 'forbidden_host' || err?.code === 'invalid_url' ? 400 : 502;
    return new Response(JSON.stringify({ error: 'URL de foto rejeitada.', code: err?.code ?? 'bad_request' }), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }
};
```

- [ ] **Step 4: Smoke-test locally**

Run `npm run web:dev` and:

```bash
curl -s "http://localhost:4321/api/tse/search?uf=BA&cargo=president&q=hertz" | head -c 400
```

Expected: JSON com `results` contendo candidato mapeado (presidente é nacional; `uf=BA` ainda é válida e a UE interna é `BR`).

Also:

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321/api/tse/photo?url=https%3A%2F%2Fevil.example%2Fx"
```

Expected: `400`.

- [ ] **Step 5: Commit**

```bash
git add web tse test
git commit -m "feat: proxy Worker de busca e fotos do TSE"
```

---

### Task 6: UI de seleção + prévia + download PNG

**Files:**
- Modify: `web/src/pages/index.astro`
- Create: `web/src/styles/app.css`
- Create: `web/src/lib/story-browser.js`
- Create: `web/public/fonts/Nunito[wght].ttf` (copiar de `brand/source/fonts/`)
- Create: `web/public/brand/logo-horizontal.svg` (copiar de `brand/dist/svg/logo-horizontal.svg`)
- Ensure Vite/Astro can import `../../../story/source/render.mjs` from client script (alias `@story`)

**Interfaces:**
- Consumes: `/api/tse/search`, `renderStory`, `StoryValidationError`, `getSlotDefinitions` via story tokens
- Produces: página utilizável end-to-end

- [ ] **Step 1: Client state module**

`web/src/lib/story-browser.js` (ESM no browser):

- estado `{ uf, federalDeputy, ... }`
- `setUf`, `clearSlot`, `selectCandidate`
- `search(slotKey, q)` → fetch `/api/tse/search?...` com AbortController
- `debounce(fn, 300)`
- `renderPreview(canvas, state, { logo })` chamando `renderStory`
- `downloadPng(canvas)`

Import do story:

```js
import { renderStory, StoryValidationError } from '@story/render.mjs';
import { getSlotDefinitions } from '@story/tokens.mjs';
```

Configurar alias `@story` → `../story/source` em `astro.config.mjs`.

- [ ] **Step 2: Build the page UI**

`index.astro` + CSS:

- fundo `#F2F7EF`
- header com logo + selo 2026 + `<select>` de UF
- seis seções de cargo com input, lista de resultados, card selecionado + limpar
- sticky footer: canvas 270×480 (`width/height` internos 1080×1920), botões Atualizar prévia / Baixar PNG, área de erros
- textos: placeholder `nome ou número`; vazio `Nenhum candidato encontrado.`; falha TSE exatamente `Não foi possível consultar o TSE. Tente de novo.`
- `@font-face` Nunito apontando para `/fonts/Nunito[wght].ttf`

Sem framework React obrigatório — vanilla JS no `<script type="module">` é preferível para manter o bundle leve.

- [ ] **Step 3: Wire preview**

Ao clicar Atualizar prévia / após seleção: validar via `renderStory`; em `StoryValidationError`, exibir `error.issues`.  
`resolvePhoto`: `fetch(src)` → `createImageBitmap` ou `Image()`.

- [ ] **Step 4: Manual verification checklist**

1. Selecionar `BA`
2. Buscar presidente por `hertz` e por `16`
3. Preencher ao menos 2 slots e gerar prévia
4. Forçar senadores iguais → erro de validação
5. Baixar PNG e confirmar 1080×1920 no sistema de arquivos (`file` / inspecionar)

- [ ] **Step 5: Commit**

```bash
git add web story docs
git commit -m "feat: página de seleção TSE com prévia do story"
```

---

### Task 7: Documentação e scripts de verificação

**Files:**
- Modify: `web/README.md`
- Modify: root `package.json` (`"tse:verify": "npm run tse:test && npm run story:verify"`)
- Modify: `docs/superpowers/specs/2026-08-08-meu-santinho-tse-astro-design.md` apenas se algum ID/constante precisar de nota factual (senão não tocar)

- [ ] **Step 1: Documentar**

No `web/README.md` incluir:

- `npm run web:dev`
- variáveis nenhuma obrigatória no MVP
- endpoints `/api/tse/search|candidate|photo`
- constantes eleição `20322002026`
- aviso de rate limit / uso respeitoso do TSE
- como a UI usa `story/source`

- [ ] **Step 2: Verify suites**

```bash
npm run tse:test
npm run story:verify
npm run web:build
```

Expected: todos PASS / build OK.

- [ ] **Step 3: Commit**

```bash
git add web/README.md package.json
git commit -m "docs: explicar app web e verificação TSE"
```

---

## Self-review (plano × spec)

| Spec | Task |
|---|---|
| Busca + seleção → storyData → PNG | 6 |
| Página mínima | 4, 6 |
| Nome + número | 2, 5, 6 |
| Ao vivo DivulgaCandContas | 3, 5 |
| Foto via proxy | 1, 2, 5 |
| Astro + CF Workers | 4, 5 |
| Debounce / max 20 | 2, 6 |
| Anti-SSRF foto | 2, 5 |
| Troca de UF limpa slots | 6 |
| Testes adaptador | 1–3 |
| story/brand intactos | 7 |
| Fora de escopo respeitado | — |
