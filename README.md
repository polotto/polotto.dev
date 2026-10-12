# polotto.dev

Código do blog [polotto.dev](https://polotto.dev): artigos longos em pt-BR
sobre arquitetura, migração de legado e mobile, séries e uma página de
projetos.

SvelteKit estático, publicado no GitHub Pages a cada push em `main`.

## Comandos

```sh
npm install
npm run sync          # vault do Obsidian para content/ (POLOTTO_VAULT)
npm run sync:exemplo  # conteúdo de exemplo para desenvolver
npm run dev -- --host
npm test
npm run check
npm run build         # saída em build/
```

## Onde está cada coisa

- `BRIEF.md`: decisões do projeto.
- `GLOSSARY.md`: termos (artigo, série, projeto, tema, modo).
- `docs/adr/`: decisões difíceis de reverter.
- `docs/work/sveltekit-rebuild/contrato-frontmatter.md`: campos que cada
  nota do vault precisa ter.
