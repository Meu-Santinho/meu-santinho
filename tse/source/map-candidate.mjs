import { ELECTION, getDigits } from './constants.mjs';

export function buildOfficialPhotoUrl({ electionId, candidateId, electoralUnit }) {
  return `https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/${electionId}/${candidateId}/${electoralUnit}`;
}

export function mapTseCandidate(raw, { slotKey, electoralUnit, photoProxyBase }) {
  const digits = getDigits(slotKey);
  const number = String(raw.numero ?? '').padStart(digits, '0');
  const official = buildOfficialPhotoUrl({
    electionId: ELECTION.id,
    candidateId: raw.id,
    electoralUnit,
  });
  return {
    id: String(raw.id),
    name: String(raw.nomeUrna ?? '').trim(),
    number,
    party: String(raw.partido?.sigla ?? '').trim(),
    photo: `${photoProxyBase}?url=${encodeURIComponent(official)}`,
  };
}
