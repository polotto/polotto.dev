# camadas: rotas e páginas param de importar a infra concreta

Contexto: `tools arch-check` (sistema interno, 16/10/2026) achou 12 imports
de `src/routes/` para `src/lib/infrastructure/`. Decisão do Angelo em
17/10/2026: o código muda, a regra fica.

## Trilha 0: contrato
- [x] T0.1 interfaces no domain: `GeradorQrCode` (com `NivelCorrecao`) e `PerfilRepository`
  - pronto quando: `npm run check` passa

## Trilha A: infra e composição (depende de T0.1)
- [x] A.1 infra implementa as interfaces e para de criar instância no módulo
- [x] A.2 `src/lib/app/`: `conteudo.server.ts` (só servidor) e `ferramentas.ts` (navegador) montam as dependências
  - pronto quando: `npm test` passa

## Trilha B: rotas (depende de A.2)
- [x] B.1 as 12 rotas importam de `$lib/app/`, nunca de `$lib/infrastructure/`
  - pronto quando: `tools arch-check .` sai 0 e `npm run build` passa

## Integração
- [x] I.1 `.agents/architecture.rules`, passo `arch:` no `verify.steps` e camada `app` no `AGENTS.md`
  - pronto quando: `verify` passa

## Fora do escopo
- Achados da review do PR #7 (JSON perde precisão, cor de erro, fonte carregada na abertura): trabalho separado
