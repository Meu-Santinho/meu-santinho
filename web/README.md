# Meu Santinho 2026 — Web

Execute estes comandos a partir da raiz do monorepo:

```sh
npm run web:dev
npm run web:build
npm run web:deploy
```

O deploy usa o Wrangler configurado em `wrangler.jsonc`.

O proxy do TSE exige rotas renderizadas no servidor; ele não funciona em páginas estáticas.
