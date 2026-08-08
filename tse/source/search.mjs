import { getDigits } from './constants.mjs';
import { mapTseCandidate } from './map-candidate.mjs';

export function normalizeQuery(q, digits) {
  const trimmed = String(q ?? '').trim();
  if (!trimmed) return { kind: 'empty', value: '' };
  if (digits && /^\d+$/.test(trimmed) && trimmed.length === digits) {
    return { kind: 'number', value: trimmed };
  }
  return { kind: 'name', value: trimmed.toLocaleLowerCase('pt-BR') };
}

function matches(raw, query, digits) {
  if (query.kind === 'empty') return false;
  if (query.kind === 'number') {
    return String(raw.numero ?? '').padStart(digits, '0') === query.value.padStart(digits, '0');
  }
  const urna = String(raw.nomeUrna ?? '').toLocaleLowerCase('pt-BR');
  const completo = String(raw.nomeCompleto ?? '').toLocaleLowerCase('pt-BR');
  return urna.includes(query.value) || completo.includes(query.value);
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
    if (!matches(raw, query, digits)) continue;
    out.push(mapTseCandidate(raw, { slotKey, electoralUnit, photoProxyBase }));
    if (out.length >= limit) break;
  }
  return out;
}
