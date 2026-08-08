import type { APIRoute } from 'astro';

import {
  createTseClient,
  filterCandidates,
  getElectoralUnit,
  isValidSlotKey,
  isValidUf,
} from '../../../lib/tse-server';

export const prerender = false;

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
    const client = createTseClient();
    const candidates = await client.listCandidates({ uf, slotKey: cargo });
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
