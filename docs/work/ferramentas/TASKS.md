# Tasks: ferramentas

Seção `/ferramentas` com ferramentas que rodam no navegador. Decisões em
`BRIEF.md` (seção Ferramentas).

## Trilha 0: base (bloqueia as outras)
- [x] 0.1 decisões no `BRIEF.md`, termo no `GLOSSARY.md`, `TASKS.md` e
  `HANDOFF.md`
- [x] 0.2 catálogo das ferramentas (`src/lib/presenter/ferramentas.ts`),
  índice `/ferramentas`, item no menu, layout com estilos comuns e
  cabeçalho de ferramenta com aviso de privacidade
  - pronto quando: `/ferramentas` lista os cards e o menu marca a seção
- [x] 0.3 sitemap, `llms.txt` e JSON-LD (`WebApplication` e migalhas)
  - pronto quando: `npx vitest run src/lib/presenter/arquivos.test.ts` passa

## Trilha A: QR Code (depende de 0.2)
- [x] A.1 texto para QR Code em UTF-8, nível de correção, tamanho,
  download em PNG e SVG (`qrcode-generator`)

- [x] A.2 botões Colar e Limpar no campo e Copiar imagem do QR Code

## Trilha B: CPF e CNPJ (depende de 0.2)
- [x] B.1 gerar, validar e formatar CPF e CNPJ, inclusive o CNPJ
  alfanumérico (julho de 2026), com testes no domínio

## Trilha C: JSON (depende de 0.2)
- [x] C.1 validar, formatar (2, 4 espaços ou tab), minificar e ordenar
  chaves; erro com linha e coluna, com testes no domínio

## Trilha D: paleta (depende de 0.2)
- [x] D.1 cor base e harmonia (complementar, análoga, tríade, tétrade,
  complementar dividida, monocromática); copiar hex e exportar CSS
  variables; contraste do texto sobre cada cor; testes no domínio

- [x] D.2 onde usar cada cor (fundo, superfície, borda, texto, texto
  secundário, primária, texto sobre a primária, destaque) no modo claro e
  escuro, com contraste AA garantido, prévia de tela e CSS dos papéis

- [x] D.3 fontes na prévia (20 do Google Fonts) com texto Mussum Ipsum,
  regras de combinação, sorteio só de par que combina, copiar a fonte e
  CSS das fontes

## Trilha E: mascote (depende de 0.2)
- [x] E.1 mascote a partir de um texto (mesmo texto, mesmo mascote), nos
  estilos identicon e personagem 16-bit; botão aleatório; download em PNG
  e SVG; testes no domínio

## Trilha G: acordes (depende de 0.2)
- [x] G.1 domínio: acordes, tonalidade, cifra brasileira (7M, m7(b5)) e sorteio
  de progressão em modo maior e menor, com semente; testes
- [x] G.2 domínio: reharmonização com 11 técnicas (extensões, ii-V,
  dominantes secundários, trítono, empréstimo modal, diminuto de passagem,
  baixo descendente, pedal, backdoor, dominante alterado, dominante
  suspenso); testes
- [x] G.3 domínio: voicings com condução de vozes e linha melódica sobre a
  harmonia (notas do acorde nos tempos fortes, escala do acorde nos fracos);
  testes
- [x] G.4 piano virtual (teclado clicável) e sintetizador no navegador
- [x] G.5 página `/ferramentas/acordes`, catálogo, i18n, ícone, tokens,
  `BRIEF.md` e referências das músicas
- [x] G.6 `verify` e conferência visual da página de acordes (modo claro,
  escuro, 390 px sem rolagem horizontal, tocar e parar, Pedal e Baixo
  descendente). Detalhes no F.1.

## Trilha F: fechamento
- [x] F.1 `verify` verde e conferência visual nos dois modos e no celular
  - feito (19/10/2026): `verify`; telas de QR Code, CPF e CNPJ, JSON, paleta,
    mascote e acordes no modo claro e no escuro; sem estouro horizontal em
    390 px (medido num iframe de 390 px); PNG gerado de verdade a partir do
    SVG do QR Code (8 KB) e do mascote (5 KB) e SVG gerado; JSON preserva
    `1.0`, `12345678901234567890` e `1e2` na página; acordes com Pedal, Baixo
    descendente e 8 cliques em Surpreenda-me, sem erro no console
  - download real (20/10/2026): clique em Baixar PNG no mascote gerou
    `mascote-polotto.png`, PNG válido de 420x570 (conferido com `file`). O
    Chrome bloqueou os demais downloads automáticos da sessão (SVG do mascote
    e PNG e SVG do QR Code); o SVG usa a mesma função `baixar` do PNG e o PNG
    do QR Code foi gerado a partir do SVG no navegador (8 KB)

## Fora do escopo
- Histórico, favoritos ou qualquer dado salvo no servidor.
- Ferramenta que precise de back-end.
