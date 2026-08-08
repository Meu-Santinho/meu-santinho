import type { APIRoute } from 'astro';

import {
  createTseClient,
  ELECTION,
  filterCandidates,
  getElectoralUnit,
  isValidSlotKey,
  isValidUf,
} from '../../../lib/tse-server';

export const prerender = false;

function candidateListCacheKey(url: URL, uf: string, cargo: string) {
  const key = new URL('/api/tse/candidate-list', url);
  key.searchParams.set('election', String(ELECTION.id));
  key.searchParams.set('uf', uf.trim().toUpperCase());
  key.searchParams.set('cargo', cargo);
  return new Request(key);
}

async function getCandidateList(url: URL, uf: string, cargo: string) {
  const workerCache = typeof caches === 'undefined' ? undefined : caches.default;
  const cacheKey = workerCache ? candidateListCacheKey(url, uf, cargo) : undefined;
  const cached = cacheKey ? await workerCache.match(cacheKey) : undefined;

  if (cached) {
    const payload = await cached.json();
    return Array.isArray(payload?.candidates) ? payload.candidates : [];
  }

  const candidates = await createTseClient().listCandidates({ uf, slotKey: cargo });
  if (cacheKey) {
    const response = Response.json(
      { candidates },
      { headers: { 'cache-control': 'public, max-age=300' } },
    );
    await workerCache.put(cacheKey, response);
  }
  return candidates;
}

export const GET: APIRoute = async ({ url }) => {
  const uf = url.searchParams.get('uf') ?? '';
  const cargo = url.searchParams.get('cargo') ?? '';
  const q = url.searchParams.get('q') ?? '';
  const hasValidParameters = isValidUf(uf) && isValidSlotKey(cargo) && q.trim();

  if (!hasValidParameters) {
    return Response.json(
      { error: 'Parâmetros inválidos.', code: 'bad_request' },
      { status: 400 },
    );
  }

  try {
    const candidates = await getCandidateList(url, uf, cargo);
    const results = filterCandidates(candidates, {
      q,
      slotKey: cargo,
      electoralUnit: getElectoralUnit(cargo, uf),
      photoProxyBase: '/api/tse/photo',
      limit: 20,
    });

    return Response.json(
      { results },
      { headers: { 'cache-control': 'public, max-age=60' } },
    );
  } catch {
    return Response.json(
      {
        error: 'Não foi possível consultar o TSE. Tente de novo.',
        code: 'tse_upstream',
      },
      { status: 502 },
    );
  }
};
