// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  vite: {
    resolve: {
      alias: {
        '@tse': fileURLToPath(new URL('../tse/source', import.meta.url)),
        '@story': fileURLToPath(new URL('../story/source', import.meta.url)),
      },
    },
    server: {
      fs: { allow: ['..'] },
    },
  },
});