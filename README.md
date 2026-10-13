# polotto.dev

Código do blog [polotto.dev](https://polotto.dev): artigos longos em pt-BR
sobre arquitetura, migração de legado e mobile, séries e uma página de
projetos.

SvelteKit estático com tema retrô 16-bit. Tudo é pré-renderizado e
publicado no GitHub Pages a cada push em `main`.

## Como o conteúdo chega ao site

Os artigos são escritos no Obsidian, fora deste repo. O `npm run sync` lê a
pasta `blog/` do vault, copia só as notas com `status: publicado` e grava o
markdown em `content/` e as imagens em `static/media/`. Wikilinks viram
links do site. O `content/` é gerado: nunca editar ali.

Campos de cada nota em
[`docs/work/sveltekit-rebuild/contrato-frontmatter.md`](docs/work/sveltekit-rebuild/contrato-frontmatter.md).

## Requisitos

- Node 22 (versão em `.node-version`).

## Comandos

```sh
npm install
POLOTTO_VAULT=/caminho/do/vault npm run sync  # vault para content/
npm run sync:exemplo  # conteúdo de exemplo para desenvolver
npm run dev -- --host
npm test
npm run check
npm run build         # saída em build/
```

O CI recusa conteúdo de exemplo: antes de commitar, rodar o `sync` com o
vault real.

## Busca

Além do sitemap, do RSS e do JSON-LD para o Google, o site gera arquivos
para buscadores de LLM:

- `/llms.txt`: índice do site no formato [llmstxt.org](https://llmstxt.org).
- `/llms-full.txt`: todos os artigos em um arquivo.
- `/artigos/<slug>.md`: o markdown de cada artigo.

## Estrutura

- `src/lib/domain/`: modelos e casos de uso, sem framework.
- `src/lib/infrastructure/`: leitura de `content/`.
- `src/lib/presenter/`: componentes, i18n, SEO e arquivos gerados.
- `src/routes/`: páginas e rotas de arquivo (`robots.txt`, `sitemap.xml`,
  `rss.xml`, `llms.txt`).
- `scripts/`: sync do vault e checagem do conteúdo.

## Publicação

- `.github/workflows/ci.yml`: testes, check e build em todo PR.
- `.github/workflows/deploy.yml`: build e deploy no GitHub Pages a cada
  push em `main`, com uma tag `prod-*` por publicação.

## Documentos

- `BRIEF.md`: decisões do projeto.
- `GLOSSARY.md`: termos (artigo, série, projeto, tema, modo).
- `docs/adr/`: decisões difíceis de reverter.
