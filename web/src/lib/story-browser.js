import { renderStory, StoryValidationError } from '@story/render.mjs';
import { getSlotDefinitions } from '@story/tokens.mjs';

const TSE_ERROR_MESSAGE = 'Não foi possível consultar o TSE. Tente de novo.';

function emptyState() {
  return Object.fromEntries([
    ['uf', ''],
    ...getSlotDefinitions().map(({ key }) => [key, null]),
  ]);
}

function normalizeUf(value) {
  return String(value ?? '').trim().toUpperCase();
}

function toSearchUrl(slotKey, query, uf) {
  const params = new URLSearchParams({ uf, cargo: slotKey, q: query });
  return `/api/tse/search?${params}`;
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

export function createStoryBrowser({ fetchImpl = fetch } = {}) {
  const state = emptyState();
  const controllers = new Map();

  return {
    state,

    setUf(value) {
      const uf = normalizeUf(value);
      if (state.uf === uf) return state;

      for (const controller of controllers.values()) {
        controller.abort();
      }
      controllers.clear();

      state.uf = uf;
      for (const { key } of getSlotDefinitions()) {
        if (key !== 'president') state[key] = null;
      }
      return state;
    },

    clearSlot(slotKey) {
      if (Object.hasOwn(state, slotKey) && slotKey !== 'uf') state[slotKey] = null;
      return state;
    },

    selectCandidate(slotKey, candidate) {
      if (!Object.hasOwn(state, slotKey) || slotKey === 'uf') {
        throw new TypeError('Cargo de seleção inválido.');
      }
      state[slotKey] = candidate;
      return state;
    },

    async search(slotKey, query) {
      const normalizedQuery = String(query ?? '').trim();
      if (!state.uf || !normalizedQuery) return [];

      controllers.get(slotKey)?.abort();
      const controller = new AbortController();
      controllers.set(slotKey, controller);
      const requestUf = state.uf;

      try {
        const response = await fetchImpl(toSearchUrl(slotKey, normalizedQuery, requestUf), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(TSE_ERROR_MESSAGE);

        const payload = await response.json();
        if (controller.signal.aborted || state.uf !== requestUf) return [];
        return Array.isArray(payload.results) ? payload.results : [];
      } finally {
        if (controllers.get(slotKey) === controller) controllers.delete(slotKey);
      }
    },
  };
}

export class PreviewStaleError extends Error {
  constructor() {
    super('Prévia obsoleta.');
    this.name = 'PreviewStaleError';
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Não foi possível carregar a imagem: ${url}`));
    image.src = url;
  });
}

export async function renderPreview(canvas, state, { logo, isCurrent = () => true } = {}) {
  const context = canvas.getContext('2d');
  if (!context) throw new TypeError('Não foi possível criar o contexto da prévia.');

  if (!isCurrent()) return;

  const loadedLogo = logo instanceof Promise ? await logo : logo;
  if (!isCurrent()) return;

  const photos = new Map();
  const resolvePhoto = async (url) => {
    if (!photos.has(url)) photos.set(url, loadImage(url));
    const image = await photos.get(url);
    if (!isCurrent()) throw new PreviewStaleError();
    return image;
  };

  try {
    await renderStory(context, state, { logo: loadedLogo, resolvePhoto, isCurrent });
  } catch (error) {
    if (error instanceof PreviewStaleError) return;
    throw error;
  }

  if (!isCurrent()) return;
}

export async function loadStoryLogo() {
  return loadImage('/brand/logo-horizontal.svg');
}

export function downloadPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar o PNG.'));
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'meu-santinho-2026.png';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      resolve();
    }, 'image/png');
  });
}

export { StoryValidationError, TSE_ERROR_MESSAGE };
