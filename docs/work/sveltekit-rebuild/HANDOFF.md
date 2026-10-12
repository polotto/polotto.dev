# Handoff: sveltekit-rebuild

Atualizado em: 12/10/2026

## Objetivo
Recriar o polotto.dev do zero em SvelteKit estático no GitHub Pages,
com artigos vindos do vault do Obsidian. Decisões em `BRIEF.md`.

## Estado atual
- branch: `sveltekit-rebuild` (local, sem commit)
- concluídas: trilhas 0, A, B, C (menos C.5) e D
- `content/` hoje tem o vault de **exemplo** (`npm run sync:exemplo`).
  Rodar `npm run sync` antes de qualquer commit
- concluídas também: C.5, E.3, E.4
- em aberto: E.1 (código do GoatCounter), E.2 (fonte do Pages), E.5 (primeiro deploy)

## Decisões tomadas
- Ver `BRIEF.md`, `GLOSSARY.md` e `docs/adr/`.
- Markdown renderizado com `marked` (não mdsvex): o `llms.txt`, o
  `llms-full.txt` e o `/artigos/<slug>.md` precisam do markdown cru.
- Fase do projeto é `situacao`; `status` é só publicação.

## Próximos passos
1. Antes de commitar: `npm run sync` (vault real) e `verify`.
2. Na hora do merge: Angelo troca Pages > Source para "GitHub Actions".
3. E.5: acompanhar o primeiro run do `deploy.yml` e conferir o site no ar.
4. E.1: pôr o código do GoatCounter em `src/lib/presenter/site.ts`.

## Bloqueios e dúvidas em aberto
- Código do GoatCounter (Angelo).
- Nenhum artigo publicado ainda: os 4 posts de 2021 não têm `status`. O
  site no ar fica com a home vazia até o primeiro artigo.

## Como verificar
- `verify`
- protótipo: `npm run dev -- --host`, abrir `/prototipo?modo=claro&tela=artigo`
- sync: `npm run sync` (hoje 0 publicados: os posts de 2021 não têm `status`)

## Arquivos principais
- `BRIEF.md`: todas as decisões.
- `docs/work/sveltekit-rebuild/contrato-frontmatter.md`: campos do vault.
- `src/lib/domain/`: modelos e casos de uso.
- `src/lib/presenter/ui/tokens.css`: tokens, tema e intensidades.
