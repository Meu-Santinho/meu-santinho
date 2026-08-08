import {
  ELECTION,
  TSE_BASE_URL,
  getCargoCode,
  getElectoralUnit,
} from './constants.mjs';

function upstreamError(message, cause) {
  const err = new Error(message);
  err.code = 'tse_upstream';
  err.cause = cause;
  return err;
}

export function createTseClient({ fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  async function getJson(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${TSE_BASE_URL}${path}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'meusantinho/0.1' },
        signal: controller.signal,
      });
      if (!response.ok) throw upstreamError(`TSE respondeu ${response.status}`);
      return await response.json();
    } catch (cause) {
      if (cause?.code === 'tse_upstream') throw cause;
      throw upstreamError('Falha ao consultar o TSE.', cause);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async listCandidates({ uf, slotKey }) {
      const unit = getElectoralUnit(slotKey, uf);
      const cargo = getCargoCode(slotKey, uf);
      const data = await getJson(
        `/candidatura/listar/${ELECTION.year}/${unit}/${ELECTION.id}/${cargo}/candidatos`,
      );
      return Array.isArray(data?.candidatos) ? data.candidatos : [];
    },
    async getCandidate({ uf, slotKey, id }) {
      const unit = getElectoralUnit(slotKey, uf);
      return getJson(
        `/candidatura/buscar/${ELECTION.year}/${unit}/${ELECTION.id}/candidato/${id}`,
      );
    },
  };
}
