# Handoff: sveltekit-rebuild

Atualizado em: 14/10/2026

## Objetivo
Recriar o polotto.dev do zero em SvelteKit estático no GitHub Pages,
com artigos vindos do vault do Obsidian. Decisões em `BRIEF.md`.

## Estado atual
- no ar desde 13/10/2026: PR #1 (site novo), #2 (diagramas Mermaid) e #3
  (projetos e ícone de toque) mergeados em `main`; deploy pelo `deploy.yml`
- PR #5: inscrição por e-mail (Buttondown), GoatCounter ligado, artigo
  agendado e estreia da série
- PR #6: cartão do Stack Overflow no Sobre, artigo do dia por e-mail pela
  API do Buttondown, hero da home, mascote com 10 ações sorteadas (6 ciclos
  e para), links externos em nova aba e cards de `/projetos` alinhados
- `content/` vem do vault real: 6 projetos, série Migrando o legado com a
  parte 1 publicada em 15/10/2026 e a parte 2 agendada para 22/10/2026
- concluídas: trilhas 0, A, B, C, D, E.1 a E.4, E.7 a E.12 e F.2 a F.5
- em aberto: E.5 (falta o Rich Results Test); E.6 (conferir o primeiro
  e-mail em 22/10); F.1 (livros)

## Decisões tomadas
- Ver `BRIEF.md`, `GLOSSARY.md` e `docs/adr/`.
- Markdown renderizado com `marked` (não mdsvex): o `llms.txt`, o
  `llms-full.txt` e o `/artigos/<slug>.md` precisam do markdown cru.
- Fase do projeto é `situacao`; `status` é só publicação.

## Próximos passos
1. Em 22/10/2026: conferir o run agendado do `deploy.yml`, a parte 2 no ar
   e o e-mail enviado (job `email`, painel do Buttondown).
3. Imagem Open Graph por artigo (fora do lançamento, ver `BRIEF.md`).

## Bloqueios e dúvidas em aberto
- Nenhum.

## Como verificar
- `verify`
- protótipo: `npm run dev -- --host`, abrir `/prototipo?modo=claro&tela=artigo`
- sync: `npm run sync` (hoje 2 artigos, 1 série e 6 projetos)

## Arquivos principais
- `BRIEF.md`: todas as decisões.
- `docs/work/sveltekit-rebuild/contrato-frontmatter.md`: campos do vault.
- `src/lib/domain/`: modelos e casos de uso.
- `src/lib/presenter/ui/tokens.css`: tokens, tema e intensidades.
