import { getDigits } from './constants.mjs';
import { mapTseCandidate } from './map-candidate.mjs';

const COMBINING_MARKS = /\p{M}/gu;
const INVALID_CANDIDACY_STATUSES = [
  'indeferido',
  'cancelado',
  'renuncia',
  'falecido',
  'cassado',
];

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLocaleLowerCase('pt-BR');
}

export function normalizeQuery(q, digits) {
  const trimmed = String(q ?? '').trim();
  if (!trimmed) return { kind: 'empty', value: '' };
  if (digits && /^\d+$/.test(trimmed) && trimmed.length === digits) {
    return { kind: 'number', value: trimmed };
  }
  return { kind: 'name', value: normalizeText(trimmed) };
}

function matches(raw, query, digits) {
  if (query.kind === 'empty') return false;
  if (query.kind === 'number') {
    return String(raw.numero ?? '').padStart(digits, '0') === query.value.padStart(digits, '0');
  }
  const urna = normalizeText(raw.nomeUrna);
  const completo = normalizeText(raw.nomeCompleto);
  return urna.includes(query.value) || completo.includes(query.value);
}

function hasInvalidCandidacyStatus(raw) {
  const status = normalizeText(raw.situacaoCandidatura ?? raw.situacao);
  return INVALID_CANDIDACY_STATUSES.some((invalidStatus) => status.includes(invalidStatus));
}

export function filterCandidates(list, {
  q,
  slotKey,
  electoralUnit,
  photoProxyBase,
  limit = 20,
}) {
  const digits = getDigits(slotKey);
  const query = normalizeQuery(q, digits);
  if (query.kind === 'empty') return [];
  const out = [];
  for (const raw of list) {
    if (hasInvalidCandidacyStatus(raw)) continue;
    if (!matches(raw, query, digits)) continue;
    out.push(mapTseCandidate(raw, { slotKey, electoralUnit, photoProxyBase }));
    if (out.length >= limit) break;
  }
  return out;
}
