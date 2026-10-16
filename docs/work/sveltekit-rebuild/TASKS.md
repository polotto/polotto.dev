# sveltekit-rebuild: recriar o polotto.dev em SvelteKit

Contexto: `BRIEF.md`, `GLOSSARY.md`, `docs/adr/`.

## Trilha 0: base e contrato
- [x] T0.1 tirar o Hugo (tema, submódulo, `config.yaml`, `archetypes/`,
  `content/` antigo, saída em `docs/`) e criar o SvelteKit com
  `adapter-static`, i18n pt-BR e `npm test`
  - pronto quando: `npm run build` gera `build/index.html` e `verify` passa
- [x] T0.2 contrato do frontmatter de artigo e projeto, modelos do domain e
  exemplos em `docs/work/sveltekit-rebuild/exemplos/`
  - pronto quando: modelos compilam e os exemplos cobrem artigo avulso,
    artigo de série e projeto

## Trilha A: conteúdo (depende de T0.2)
- [x] A.1 `scripts/sync.mjs`: vault para `content/`, só `publicado`,
  wikilinks, imagens
  - pronto quando: `node --test scripts/sync.test.mjs` passa com vault de
    teste (rascunho fica fora, wikilink vira link, imagem é copiada)
- [x] A.2 repositório markdown na infra e casos de uso (listar artigos,
  artigo por slug, série com ordem, projetos com artigos relacionados)
  - pronto quando: testes dos casos de uso passam com conteúdo de exemplo

## Trilha B: visual (depende de T0.1, paralela à A)
- [x] B.1 tokens base e tema retrô 16-bit em duas intensidades (forte e
  sutil), modo claro e escuro
  - pronto quando: tokens só em `tokens.css`, nenhum literal nos
    componentes
- [x] B.2 protótipo de home e artigo com conteúdo mock, com seletor de
  intensidade, nos dois modos
  - pronto quando: URL na rede local para o Angelo comparar
- [x] B.3 Angelo escolhe a intensidade; fechar fontes e paleta
  - pronto quando: decisão no `BRIEF.md` e a intensidade descartada removida

## Trilha C: páginas (depende de A.2 e B.3)
- [x] C.1 home: artigos recentes e projetos em destaque
- [x] C.2 página do artigo (data de publicação e atualização, série,
  navegação anterior e próximo da série)
- [x] C.3 página da série `/series/<slug>`
- [x] C.4 `/projetos`
- [x] C.5 Sobre (bio do LinkedIn, LinkedIn, GitHub, Stack Overflow)
- [x] C.6 página 404 amigável e `handleHttpError` de volta para `'fail'`
  no `svelte.config.js`
  - pronto quando (todas): build passa, página conferida no Chrome nos dois
    modos e no celular

- [x] C.7 diagramas Mermaid no corpo do artigo
  - bloco ` ```mermaid ` vira `<pre class="mermaid">` no build; o Mermaid
    só carrega no navegador em página com diagrama
  - cores e fontes dos tokens do tema, redesenha ao trocar de modo
  - pronto quando (todas): teste do markdown, build passa, diagrama
    conferido no Chrome nos dois modos e no celular
  - feito: `src/lib/presenter/diagramas.ts`; exemplo no vault de exemplo
    (`Tipos de migracao.md`). No celular, diagrama largo fica pequeno:
    preferir `flowchart TD`

## Trilha D: busca (depende de A.2, paralela à C)
- [x] D.1 head de SEO: title, description, canonical, Open Graph, JSON-LD
  (`Blog`, `BlogPosting` com `isPartOf`, `Person`, `BreadcrumbList`)
- [x] D.2 `sitemap.xml` com `lastmod`, `robots.txt` liberando crawlers de
  LLM, `rss.xml`
- [x] D.3 `llms.txt`, `llms-full.txt` e `/artigos/<slug>.md`
  - pronto quando (todas): arquivos no `build/` validados por teste e o
    JSON-LD sem erro no Rich Results Test
  - feito: testes em `src/lib/presenter/arquivos.test.ts` e `seo.test.ts`.
    Rich Results Test só depois do deploy (precisa de URL pública)
- [x] D.4 imagem Open Graph padrão (`static/og.png`), favicon e ícone de
  toque com o mascote

## Trilha E: publicação (depende de C e D)
- [x] E.1 GoatCounter no layout
  - script só entra com `GOATCOUNTER_CODIGO` em `src/lib/presenter/site.ts`
    e fora do modo dev
  - código `polotto` (conta criada em 15/10/2026)
- [x] E.2 trocar a fonte do Pages para "GitHub Actions" (Angelo, nas
  configurações do repo), na hora do merge
- [x] E.3 `static/CNAME` com polotto.dev (DNS já aponta para o GitHub Pages)
- [x] E.4 `ci.yml` (conteúdo, test, check, build) e `deploy.yml` (Pages e
  tag `prod-*`); `npm run checar-conteudo` barra o vault de exemplo
  - `actionlint` passa nos dois
- [~] E.5 primeiro deploy: conferir o run, polotto.dev servindo o site novo,
  `llms.txt` com 200 e a tag `prod-*`; JSON-LD no Rich Results Test
  - feito: deploy, site, `llms.txt` 200 e tag `prod-*`
  - falta: Rich Results Test
- [~] E.6 inscrição por e-mail com Buttondown (`Inscricao.svelte`)
  - feito: formulário no artigo e na home, textos no i18n
  - feito: usuário `polotto` em `BUTTONDOWN_USUARIO`
  - falta: ligar RSS para e-mail no
    painel do Buttondown (Angelo)
- [x] E.7 artigo agendado: `publicado` futuro fica fora do build até o dia,
  deploy diário às 06:00 só quando há artigo do dia

## Trilha F: conteúdo (Angelo, paralela a tudo)
- [ ] F.1 pesquisar livros sobre migração de legado (pt e en)
- [x] F.2 escrever a parte 1 da série Migrando o legado (publicada em 15/10/2026)
- [x] F.3 parte 2 (agendada para 22/10/2026)
- [x] F.4 notas dos projetos (6: Live Player, Salamandra, Polovoxel, Spacefy,
  Subtitle Watcher e SciDart) em `<vault>/blog/projetos/`
- [x] F.5 bio da página Sobre (título do LinkedIn)

## Fora do escopo
- Busca, tags, comentários.
- Tradução dos posts de 2021 e catálogo en.
- Imagem Open Graph por artigo, stack e imagem nos cards de projeto.
- Linguagem de design comum (iniciativa `polotto-design`).
