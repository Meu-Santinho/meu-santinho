import { SLOT_DEFINITIONS } from './tokens.mjs';

const VALID_UFS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

const messages = Object.freeze({
  invalidUf: 'Informe uma UF brasileira válida.',
  invalidCandidate: 'O candidato deve ser um objeto ou permanecer vazio.',
  required: 'Este campo é obrigatório para um candidato preenchido.',
  invalidNumber: 'O número deve ser uma string com a quantidade exata de dígitos do cargo.',
  duplicateSenator: 'Os dois votos para o Senado devem ser destinados a candidatos diferentes.',
});

export function normalizeUf(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function issue(path, code, message) {
  return { path, code, message };
}

function normalizeCandidate(value, slot, issues) {
  if (value === null || value === undefined) return null;

  if (typeof value !== 'object' || Array.isArray(value)) {
    issues.push(issue(slot.key, 'invalid_candidate', messages.invalidCandidate));
    return null;
  }

  const normalized = {
    id: typeof value.id === 'string' ? value.id.trim() : '',
    photo: value.photo ?? null,
    name: typeof value.name === 'string' ? value.name.trim() : '',
    number: value.number,
    party: typeof value.party === 'string' ? value.party.trim() : '',
  };

  for (const field of ['id', 'name', 'party']) {
    if (!normalized[field]) {
      issues.push(issue(`${slot.key}.${field}`, 'required', messages.required));
    }
  }

  const numberPattern = new RegExp(`^\\d{${slot.digits}}$`);
  if (typeof normalized.number !== 'string' || !numberPattern.test(normalized.number)) {
    issues.push(issue(`${slot.key}.number`, 'invalid_number', messages.invalidNumber));
  }

  return normalized;
}

export function validateStoryData(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const issues = [];
  const uf = normalizeUf(source.uf);

  if (!VALID_UFS.has(uf)) {
    issues.push(issue('uf', 'invalid_uf', messages.invalidUf));
  }

  const value = { uf };
  for (const slot of SLOT_DEFINITIONS) {
    value[slot.key] = normalizeCandidate(source[slot.key], slot, issues);
  }

  const firstSenator = value.senatorFirstSeat;
  const secondSenator = value.senatorSecondSeat;
  if (firstSenator?.id && secondSenator?.id && firstSenator.id === secondSenator.id) {
    issues.push(issue(
      'senatorSecondSeat.id',
      'duplicate_senator',
      messages.duplicateSenator,
    ));
  }

  return issues.length > 0 ? { ok: false, issues } : { ok: true, value };
}
