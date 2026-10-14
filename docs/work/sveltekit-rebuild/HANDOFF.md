# Handoff: sveltekit-rebuild

Atualizado em: 14/10/2026

## Objetivo
Recriar o polotto.dev do zero em SvelteKit estático no GitHub Pages,
com artigos vindos do vault do Obsidian. Decisões em `BRIEF.md`.

## Estado atual
- no ar desde 13/10/2026: PR #1 (site novo), #2 (diagramas Mermaid) e #3
  (projetos e ícone de toque) mergeados em `main`; deploy pelo `deploy.yml`
- `content/` vem do vault real: 6 projetos publicados, 0 artigos
- concluídas: trilhas 0, A, B, C, D, E.2 a E.4 e F.4, F.5
- em aberto: E.1 (código do GoatCounter); E.5 (falta o Rich Results Test); F.1 a F.3 (série Migrando o legado)
- a série está em rascunho no vault: parte 1 escrita, parte 2 em esboço.
  Estreia quando a parte 2 estiver rascunhada (`BRIEF.md`)

## Decisões tomadas
- Ver `BRIEF.md`, `GLOSSARY.md` e `docs/adr/`.
- Markdown renderizado com `marked` (não mdsvex): o `llms.txt`, o
  `llms-full.txt` e o `/artigos/<slug>.md` precisam do markdown cru.
- Fase do projeto é `situacao`; `status` é só publicação.

## Próximos passos
1. Parte 2 da série: critérios entre completa e parcial, e como achar a
   fronteira. Depois revisar a parte 1 e publicar as duas.
2. E.1: pôr o código do GoatCounter em `src/lib/presenter/site.ts`.
3. Imagem Open Graph por artigo (fora do lançamento, ver `BRIEF.md`).

## Bloqueios e dúvidas em aberto
- Código do GoatCounter (Angelo).
- Nenhum artigo publicado ainda: a home mostra só os projetos até o
  primeiro artigo.

## Como verificar
- `verify`
- protótipo: `npm run dev -- --host`, abrir `/prototipo?modo=claro&tela=artigo`
- sync: `npm run sync` (hoje 6 projetos e 0 artigos publicados)

## Arquivos principais
- `BRIEF.md`: todas as decisões.
- `docs/work/sveltekit-rebuild/contrato-frontmatter.md`: campos do vault.
- `src/lib/domain/`: modelos e casos de uso.
- `src/lib/presenter/ui/tokens.css`: tokens, tema e intensidades.
