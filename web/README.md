# Meu Santinho 2026 — Web

Execute estes comandos a partir da raiz do monorepo:

```sh
npm run web:dev
npm run web:build
npm run web:deploy
```

O deploy usa o Wrangler configurado em `wrangler.jsonc`.

O proxy do TSE exige rotas renderizadas no servidor; ele não funciona em páginas estáticas.

O adaptador canônico do TSE permanece em `../tse/source`, inclusive para os testes
em `test/tse`. O Vite o resolve pelo alias absoluto `@tse`, configurado com
`fileURLToPath` em `astro.config.mjs`; assim, o bundler do Cloudflare inclui os
módulos ESM sem duplicar a implementação dentro do app web.
