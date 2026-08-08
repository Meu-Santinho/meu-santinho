import type { APIRoute } from 'astro';

import {
  createTseClient,
  getElectoralUnit,
  isValidSlotKey,
  isValidUf,
  mapTseCandidate,
} from '../../../../lib/tse-server';

export const prerender = false;

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error
    && (error as Error & { status?: unknown }).status === 404;
}

export const GET: APIRoute = async ({ params, url }) => {
  const id = params.id ?? '';
  const uf = url.searchParams.get('uf') ?? '';
  const cargo = url.searchParams.get('cargo') ?? '';
  const hasValidParameters = isValidUf(uf)
    && isValidSlotKey(cargo)
    && /^\d+$/.test(id);

  if (!hasValidParameters) {
    return Response.json(
      { error: 'Parâmetros inválidos.', code: 'bad_request' },
      { status: 400 },
    );
  }

  try {
    const candidate = await createTseClient().getCandidate({ uf, slotKey: cargo, id });
    const mapped = mapTseCandidate(candidate, {
      slotKey: cargo,
      electoralUnit: getElectoralUnit(cargo, uf),
      photoProxyBase: '/api/tse/photo',
    });

    return Response.json({ candidate: mapped });
  } catch (error) {
    if (isNotFoundError(error)) {
      return Response.json(
        { error: 'Candidato não encontrado.', code: 'not_found' },
        { status: 404 },
      );
    }

    return Response.json(
      {
        error: 'Não foi possível consultar o TSE. Tente de novo.',
        code: 'tse_upstream',
      },
      { status: 502 },
    );
  }
};
