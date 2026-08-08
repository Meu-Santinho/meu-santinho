import test from 'node:test';
import assert from 'node:assert/strict';
import { createTseClient } from '../../tse/source/client.mjs';
import { ELECTION } from '../../tse/source/constants.mjs';

test('listCandidates monta URL correta e devolve candidatos', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify({
      candidatos: [{ id: 1, nomeUrna: 'A', numero: 12, partido: { sigla: 'X' } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const client = createTseClient({ fetchImpl, timeoutMs: 1000 });
  const list = await client.listCandidates({ uf: 'BA', slotKey: 'governor' });
  assert.equal(list.length, 1);
  assert.match(calls[0], new RegExp(`/candidatura/listar/${ELECTION.year}/BA/${ELECTION.id}/3/candidatos`));
});

test('listCandidates propaga falha HTTP como tse_upstream', async () => {
  const fetchImpl = async () => new Response('nope', { status: 502 });
  const client = createTseClient({ fetchImpl });
  await assert.rejects(
    () => client.listCandidates({ uf: 'BA', slotKey: 'governor' }),
    (err) => err.code === 'tse_upstream',
  );
});
