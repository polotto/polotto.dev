# Handoff: ferramentas

Atualizado em: 19/10/2026

## Objetivo
Seção `/ferramentas` no blog com ferramentas úteis que rodam no navegador:
QR Code, CPF e CNPJ, JSON, paleta de cores, mascote e gerador de acordes
(sorteio, reharmonização, melodia e piano virtual).

## Estado atual
- branch `ferramentas`, um commit por task
- 6 ferramentas prontas, no menu, no sitemap e no `llms.txt`
- conferência do F.1 feita em 19/10/2026 (ver TASKS.md)

## Decisões tomadas
- Ver `BRIEF.md`, seção Ferramentas.

## Próximos passos
1. Abrir a PR (`feat:`), merge só com o Angelo.
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
- Cifras lidas no Cifra Club (a leitura direta dá 403);
  referências por música e pontos incertos em `ACORDES-REFERENCIAS.md`.
- Falta: baixo cromático, empréstimo de bIII e bII, exportar MIDI.
