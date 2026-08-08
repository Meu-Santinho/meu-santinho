import type { APIRoute } from 'astro';

import { assertAllowedPhotoUrl, getPhotoTarget } from '../../../lib/tse-server';

export const prerender = false;

function isRejectedPhotoUrl(error: unknown): error is Error & { code: string } {
  if (!(error instanceof Error)) return false;

  const code = (error as Error & { code?: unknown }).code;
  return code === 'forbidden_host' || code === 'invalid_url';
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const allowed = assertAllowedPhotoUrl(getPhotoTarget(url));
    const upstream = await fetch(allowed, {
      headers: { 'User-Agent': 'meusantinho/0.1' },
    });

    if (!upstream.ok) {
      return Response.json(
        {
          error: 'Não foi possível consultar o TSE. Tente de novo.',
          code: 'photo_upstream',
        },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      headers: {
        'cache-control': 'public, max-age=86400',
        'content-type': upstream.headers.get('content-type') ?? 'image/jpeg',
      },
    });
  } catch (error) {
    if (isRejectedPhotoUrl(error)) {
      return Response.json(
        { error: 'URL de foto rejeitada.', code: error.code },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: 'Não foi possível consultar o TSE. Tente de novo.',
        code: 'photo_upstream',
      },
      { status: 502 },
    );
  }
};
