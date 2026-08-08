import type { APIRoute } from 'astro';

import { assertAllowedPhotoUrl, getPhotoTarget } from '../../../lib/tse-server';

export const prerender = false;

const UPSTREAM_REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

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
      redirect: 'manual',
    });

    if (UPSTREAM_REDIRECT_STATUSES.has(upstream.status)) {
      return Response.json(
        {
          error:
            'O TSE redirecionou a URL da foto; redirecionamentos não são permitidos.',
          code: 'photo_redirect',
        },
        { status: 502 },
      );
    }

    if (upstream.status !== 200) {
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
