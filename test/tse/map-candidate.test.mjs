import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ELECTION,
  getCargoCode,
  getElectoralUnit,
  getDigits,
} from '../../tse/source/constants.mjs';
import {
  buildOfficialPhotoUrl,
  mapTseCandidate,
} from '../../tse/source/map-candidate.mjs';

test('constantes 2026 e cargos', () => {
  assert.equal(ELECTION.year, 2026);
  assert.equal(ELECTION.id, 20322002026);
  assert.equal(getCargoCode('president', 'BA'), 1);
  assert.equal(getCargoCode('governor', 'BA'), 3);
  assert.equal(getCargoCode('senatorFirstSeat', 'BA'), 5);
  assert.equal(getCargoCode('federalDeputy', 'BA'), 6);
  assert.equal(getCargoCode('stateOrDistrictDeputy', 'BA'), 7);
  assert.equal(getCargoCode('stateOrDistrictDeputy', 'DF'), 8);
  assert.equal(getElectoralUnit('president', 'BA'), 'BR');
  assert.equal(getElectoralUnit('governor', 'BA'), 'BA');
  assert.equal(getDigits('federalDeputy'), 4);
  assert.equal(getDigits('stateOrDistrictDeputy'), 5);
  assert.equal(getDigits('senatorFirstSeat'), 3);
  assert.equal(getDigits('governor'), 2);
  assert.equal(getDigits('president'), 2);
});

test('mapTseCandidate normaliza e aponta foto para o proxy', () => {
  const raw = {
    id: 280002541457,
    nomeUrna: 'HERTZ DIAS',
    numero: 16,
    partido: { sigla: 'PSTU' },
  };
  const mapped = mapTseCandidate(raw, {
    slotKey: 'president',
    electoralUnit: 'BR',
    photoProxyBase: '/api/tse/photo',
  });
  assert.equal(mapped.id, '280002541457');
  assert.equal(mapped.name, 'HERTZ DIAS');
  assert.equal(mapped.number, '16');
  assert.equal(mapped.party, 'PSTU');
  assert.equal(
    mapped.photo,
    '/api/tse/photo?url=' + encodeURIComponent(
      'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/280002541457/BR',
    ),
  );
  assert.equal(
    buildOfficialPhotoUrl({
      electionId: ELECTION.id,
      candidateId: 280002541457,
      electoralUnit: 'BR',
    }),
    'https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/280002541457/BR',
  );
});

test('mapTseCandidate preserva zeros à esquerda no número', () => {
  const mapped = mapTseCandidate(
    { id: 1, nomeUrna: 'TESTE', numero: 12, partido: { sigla: 'ABC' } },
    { slotKey: 'federalDeputy', electoralUnit: 'BA', photoProxyBase: '/api/tse/photo' },
  );
  assert.equal(mapped.number, '0012');
});
