# Handoff: ferramentas

Atualizado em: 19/10/2026

## Objetivo
Seção `/ferramentas` no blog com ferramentas úteis que rodam no navegador:
QR Code, CPF e CNPJ, JSON, paleta de cores, mascote e gerador de acordes
(sorteio, reharmonização, melodia e piano virtual).

## Estado atual
- branch `ferramentas`, um commit por task
- 5 ferramentas prontas, no menu, no sitemap e no `llms.txt`
- falta só a conferência manual do F.1 (modo claro e downloads)

## Decisões tomadas
- Ver `BRIEF.md`, seção Ferramentas.

## Próximos passos
1. Conferir F.1 e abrir a PR (`feat:`).
2. Ideias para depois: gerador de UUID, Base64, JWT decoder, timestamp.

## Bloqueios e dúvidas em aberto
- Nenhum.

## Como verificar
- `verify`
- `npm run dev -- --host` e abrir `/ferramentas`

## Arquivos principais
- `src/lib/domain/ferramentas/`: regras de cada ferramenta, sem UI.
- `src/lib/presenter/ferramentas.ts`: catálogo (slug e ícone).
- `src/routes/ferramentas/`: índice e uma página por ferramenta.

## Acordes (trilha G)
- Slug `acordes`. Domínio em `src/lib/domain/ferramentas/` (`acordes`,
  `reharmonizacao`, `melodia`, `voicing`). Áudio em Web Audio, sem amostra.
- Sem fonte de cifra confiável online (Cifra Club bloqueia leitura): as
  técnicas vêm da teoria; referências por música em `ACORDES-REFERENCIAS.md`.
