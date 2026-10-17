# Handoff: camadas

Atualizado em: 17/10/2026

## Objetivo
Rotas e páginas param de importar a infra concreta. A montagem fica em `src/lib/app/`.

## Estado atual
- branch: `feat/camadas` (worktree `../polotto.dev-camadas`, a partir de `origin/main`)
- Concluído. Todas as tasks feitas; `verify` verde com o passo `arch:`

## Decisões tomadas
- `src/lib/app/` é a raiz de composição, a única camada que importa infra concreta
- `app/conteudo.server.ts` separado de `app/ferramentas.ts`: o primeiro lê `content/` e não pode ir para o navegador

## Próximos passos
1. Review (`tools review`) e PR (`tools ship`)

## Bloqueios e dúvidas em aberto
- N/A

## Como verificar
- `verify` e `tools arch-check .`

## Arquivos principais
- `src/lib/app/`: montagem das dependências
- `.agents/architecture.rules`: regra de camadas
