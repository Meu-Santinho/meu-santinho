import assert from 'node:assert/strict';
import test from 'node:test';

import { validateStoryData } from '../../story/source/validation.mjs';

const candidate = (id, number, overrides = {}) => ({
  id,
  photo: null,
  name: 'Nome Técnico',
  number,
  party: 'XX',
  ...overrides,
});

test('normalizes UF and accepts an entirely empty template', () => {
  const result = validateStoryData({ uf: ' ba ' });

  assert.equal(result.ok, true);
  assert.equal(result.value.uf, 'BA');
  assert.equal(result.value.federalDeputy, null);
  assert.equal(result.value.president, null);
});

test('preserves a valid number as a string including its leading zero', () => {
  const result = validateStoryData({
    uf: 'BA',
    governor: candidate('g1', '01'),
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.governor.number, '01');
});

test('rejects number values with the wrong length, type, or non-digits', () => {
  const result = validateStoryData({
    uf: 'BA',
    federalDeputy: candidate('d1', '12A'),
    stateOrDistrictDeputy: candidate('d2', 12345),
    president: candidate('p1', '1'),
  });

  assert.equal(result.ok, false);
  assert.deepEqual(
    result.issues.filter(({ code }) => code === 'invalid_number').map(({ path }) => path),
    [
      'federalDeputy.number',
      'stateOrDistrictDeputy.number',
      'president.number',
    ],
  );
});

test('rejects the same trimmed identity in both Senate seats', () => {
  const result = validateStoryData({
    uf: 'BA',
    senatorFirstSeat: candidate('senador-1', '123'),
    senatorSecondSeat: candidate(' senador-1 ', '456'),
  });

  assert.equal(result.ok, false);
  assert.ok(result.issues.some(({ code }) => code === 'duplicate_senator'));
});

test('accepts distinct identities in the two Senate seats', () => {
  const result = validateStoryData({
    uf: 'BA',
    senatorFirstSeat: candidate('senador-1', '123'),
    senatorSecondSeat: candidate('senador-2', '456'),
  });

  assert.equal(result.ok, true);
});

test('reports invalid UF and every incomplete candidate property in one pass', () => {
  const result = validateStoryData({
    uf: 'ZZ',
    president: { number: '12' },
  });

  assert.equal(result.ok, false);
  assert.deepEqual(
    result.issues.map(({ path }) => path),
    ['uf', 'president.id', 'president.name', 'president.party'],
  );
});

test('does not mutate the supplied data while normalizing strings', () => {
  const input = {
    uf: ' ba ',
    president: candidate(' p1 ', '01', { name: ' Nome ', party: ' XX ' }),
  };

  const result = validateStoryData(input);

  assert.equal(result.ok, true);
  assert.deepEqual(input, {
    uf: ' ba ',
    president: candidate(' p1 ', '01', { name: ' Nome ', party: ' XX ' }),
  });
  assert.deepEqual(result.value.president, {
    id: 'p1', photo: null, name: 'Nome', number: '01', party: 'XX',
  });
});
