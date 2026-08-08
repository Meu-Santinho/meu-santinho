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
