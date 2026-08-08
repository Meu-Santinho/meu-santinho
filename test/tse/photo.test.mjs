import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAllowedPhotoUrl,
  isAllowedPhotoContentType,
} from '../../tse/source/photo.mjs';

test('aceita host oficial do TSE', () => {
  const url = assertAllowedPhotoUrl(
    'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/1/BR',
  );
  assert.equal(url.hostname, 'divulgacandcontas.tse.jus.br');
});

test('rejeita caminho fora do arquivo de imagens do TSE', () => {
  assert.throws(
    () => assertAllowedPhotoUrl('https://divulgacandcontas.tse.jus.br/outra-rota'),
    (err) => err.code === 'forbidden_path',
  );
});

test('aceita somente content types de imagem', () => {
  assert.equal(isAllowedPhotoContentType('image/jpeg'), true);
  assert.equal(isAllowedPhotoContentType('image/png; charset=binary'), true);
  assert.equal(isAllowedPhotoContentType('text/html'), false);
  assert.equal(isAllowedPhotoContentType(null), false);
});

test('rejeita host arbitrário', () => {
  assert.throws(
    () => assertAllowedPhotoUrl('https://evil.example/x'),
    (err) => err.code === 'forbidden_host',
  );
});
