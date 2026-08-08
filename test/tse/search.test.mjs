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
