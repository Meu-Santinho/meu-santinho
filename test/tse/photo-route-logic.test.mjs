import test from 'node:test';
import assert from 'node:assert/strict';
import { getPhotoTarget } from '../../tse/source/photo-query.mjs';

test('getPhotoTarget extrai a URL codificada da consulta', () => {
  const requestUrl = new URL(
    'https://meusantinho.test/api/tse/photo?url=https%3A%2F%2Fdivulgacandcontas.tse.jus.br%2Ffoto.jpg',
  );

  assert.equal(
    getPhotoTarget(requestUrl),
    'https://divulgacandcontas.tse.jus.br/foto.jpg',
  );
});

test('getPhotoTarget devolve nulo quando a URL não foi informada', () => {
  const requestUrl = new URL('https://meusantinho.test/api/tse/photo');

  assert.equal(getPhotoTarget(requestUrl), null);
});
