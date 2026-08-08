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
