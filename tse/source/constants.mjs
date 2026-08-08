export const ELECTION = Object.freeze({ year: 2026, id: 20322002026 });

export const TSE_BASE_URL = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1';

export const PHOTO_ALLOWED_HOSTS = Object.freeze([
  'divulgacandcontas.tse.jus.br',
]);

export const VALID_UFS = Object.freeze([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

const SLOT_META = Object.freeze({
  federalDeputy: Object.freeze({ cargo: 6, digits: 4, unit: 'uf' }),
  stateOrDistrictDeputy: Object.freeze({ cargo: 7, digits: 5, unit: 'uf', dfCargo: 8 }),
  senatorFirstSeat: Object.freeze({ cargo: 5, digits: 3, unit: 'uf' }),
  senatorSecondSeat: Object.freeze({ cargo: 5, digits: 3, unit: 'uf' }),
  governor: Object.freeze({ cargo: 3, digits: 2, unit: 'uf' }),
  president: Object.freeze({ cargo: 1, digits: 2, unit: 'BR' }),
});

export function getDigits(slotKey) {
  const meta = SLOT_META[slotKey];
  if (!meta) throw new Error(`Slot desconhecido: ${slotKey}`);
  return meta.digits;
}

export function getCargoCode(slotKey, uf) {
  const meta = SLOT_META[slotKey];
  if (!meta) throw new Error(`Slot desconhecido: ${slotKey}`);
  if (slotKey === 'stateOrDistrictDeputy' && String(uf).toUpperCase() === 'DF') {
    return meta.dfCargo;
  }
  return meta.cargo;
}

export function getElectoralUnit(slotKey, uf) {
  const meta = SLOT_META[slotKey];
  if (!meta) throw new Error(`Slot desconhecido: ${slotKey}`);
  return meta.unit === 'BR' ? 'BR' : String(uf).trim().toUpperCase();
}

export function isValidUf(uf) {
  return VALID_UFS.includes(String(uf).trim().toUpperCase());
}

export function isValidSlotKey(slotKey) {
  return Object.hasOwn(SLOT_META, slotKey);
}
