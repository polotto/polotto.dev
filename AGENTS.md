# polotto.dev

Blog pessoal do Angelo em pt-BR: artigos longos e autorais, séries e uma
página de projetos. SvelteKit estático publicado no GitHub Pages.
Decisões em `BRIEF.md`, termos em `GLOSSARY.md`, ADRs em `docs/adr/`.

## Comandos
- dev: `npm run dev -- --host` (devolver a URL com o IP da rede local)
- build: `npm run build` (saída em `build/`)
- testes: `npm test` (um arquivo só: `npx vitest run scripts/sync.test.mjs`)
- check: `npm run check`
- sincronizar do vault: `npm run sync` (pasta do vault em `POLOTTO_VAULT`)
- conteúdo de exemplo para desenvolver: `npm run sync:exemplo` (vault em
  `scripts/fixtures/vault/`)
- tudo de uma vez: `verify` (passos em `.agents/verify.steps`)

## Arquitetura
- `content/`: markdown **gerado** pelo `npm run sync`. Nunca editar aqui;
  editar no vault (`<vault>/blog/`). Ver `docs/adr/0001-*`.
- `scripts/sync.mjs`: vault para `content/`. Só copia `status: publicado`,
  converte wikilinks e imagens.
- `src/lib/domain/`: modelos (`Artigo`, `Serie`, `Projeto`), interface
  `ConteudoRepository` e casos de uso. Não importa SvelteKit nem nada de
  infra.
- `src/lib/infrastructure/`: implementação do repositório lendo `content/`.
- `src/lib/app/`: raiz de composição, a única camada que monta infra
  concreta. `conteudo.server.ts` só no servidor (lê `content/`; o SvelteKit
  barra import do navegador), `ferramentas.ts`
  vai para o navegador. Rotas e componentes importam daqui, nunca de
  `infrastructure/`. Regra em `.agents/architecture.rules`
  (`tools arch-check .`).
- `src/lib/domain/ferramentas/`: regras das ferramentas (CPF, JSON, paleta,
  mascote), puras e testadas. A página em `src/routes/ferramentas/<slug>`
  só liga a regra à tela.
- `src/lib/presenter/`: componentes (`ui/`), i18n e helpers de SEO.
- `src/routes/`: páginas e arquivos gerados (`llms.txt`, `llms-full.txt`,
  `sitemap.xml`, `robots.txt`, `rss.xml`, `/artigos/<slug>.md`). Tudo
  pré-renderizado. Geração em `src/lib/presenter/arquivos.ts`.

## Regras do código
- Termos do `GLOSSARY.md` no código e na UI: artigo, série, projeto,
  ferramenta, modo.
  Nunca "post".
- Nenhuma string de UI no código: chave em `src/lib/presenter/i18n/pt-BR.json`.
  Só pt-BR por enquanto (exceção registrada no `BRIEF.md`).
- Tokens de design em `src/lib/presenter/ui/tokens.css`, nomeados para a
  futura linguagem de design comum. Componente não usa cor ou tamanho
  literal.
- Ícone em SVG, nunca emoji.
- Toda página nova entra no sitemap, no `llms.txt` e tem JSON-LD.

## Fluxo de trabalho
- Trabalho atual: `docs/work/camadas/TASKS.md` e `HANDOFF.md`
  (anteriores: `docs/work/ferramentas/`, `docs/work/sveltekit-rebuild/`).
- Rodar `verify` antes de dizer que terminou.
- Commit por task e PR por `tools ship` no fim (repo pessoal). Merge só comigo. Merge em `main` publica em produção.

## Armadilhas
- **Antes de commitar, rodar `npm run sync`** (vault real). `content/` com
  o vault de exemplo publica artigo de mentira.
- Load de página em `+page.server.ts`, nunca `+page.ts`: o conteúdo e o
  Shiki não podem ir para o navegador.
- `docs/` não é mais saída de build (era no Hugo). Ali só ADR e trabalho.
- Publicação: `.github/workflows/deploy.yml` a cada push em `main`. A tag
  `prod-*` mais recente é o que está no ar. Push não é deploy: conferir o run.
