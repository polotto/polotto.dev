# Referências do gerador de acordes

De onde vêm as técnicas de `src/lib/domain/ferramentas/reharmonizacao.ts`.
Cifras lidas no Cifra Club em 19/10/2026 (a leitura direta é bloqueada com
403). Versões de usuário: a divisão em compassos e alguns
acordes podem divergir do arranjo gravado. A análise funcional é nossa.
Só trechos curtos de progressão, sem letra.

## Músicas pedidas

| Música | Tom (cifra) | O que se ouve na harmonia | Técnica na ferramenta |
| --- | --- | --- | --- |
| Sapato Velho (Roupa Nova) | A | pedal de A, baixo D-C#-B-A, diminutos até F#m, iv menor | pedal, baixo descendente, diminuto |
| Papel Machê (João Bosco) | C | 7M(9), 7(9,13), Fm7(9) emprestado, Db7(#5,#9) resolvendo em C | extensões, empréstimo, trítono, alterado |
| Águas de Março (Tom Jobim) | B (versão reduzida) | `B7/A E/G# Em/G B7M`, baixo cromático A-G#-G, E vira Em | baixo descendente, empréstimo |
| Samurai (Djavan) | E (site diz C#m, incerto) | `E7M G° G#m7 C#7(9)`, diminuto aproximando G#m | diminuto por baixo, extensões |
| Oceano (Djavan) | D | `A7 A#° Bm`, `A7sus4`, ii-V encadeados, B7(b9) | diminuto, suspensão, ii-V |
| Maria, Maria (Milton Nascimento) | Ab | longo pedal de Ab sob tríades, bIII e bII emprestados, baixo Ab-G-F-Eb-Db | pedal, baixo descendente |
| Construção (Chico Buarque) | Em | `Em6/B`, `Bb°`, baixo B-Bb-A-G-F#, iiø-V com F# no baixo | baixo descendente, diminuto |
| Cálice (Chico Buarque e Gilberto Gil) | E | `B7sus4(9) B7(9)`, `A7 A#°`, E(add9) | suspensão, diminuto |
| O Que É, O Que É (Gonzaguinha) | A | D vira Dm7 (empréstimo), A7 prepara D, F#7 prepara Bm | empréstimo, dominantes secundários |
| Lindo Lago do Amor (Gonzaguinha) | D (alterna Bm) | ii-V-I em D e iiø-V-i em Bm, F#7(b13) | ii-V, alterado |
| Ponto de Interrogação (Gonzaguinha) | F ou Am (incerto) | dominantes encadeados, `F7M Fm7 C7M`, `C#°` aproximando Dm7 | dominantes secundários, ii-V, diminuto |

Extras sugeridos: Wave, Insensatez (Jobim) e As Rosas Não Falam (Cartola).
Insensatez tem baixo cromático B-A#-A-G#-G e fecha em iiø-V alterado. Wave
tem cadeia de dominantes e Bb7 no lugar de E7 (trítono). Cartola serve para
ouvir dominante secundário sem enfeite.

## O que está incerto
- Tom de Samurai e de Ponto de Interrogação.
- Divisão exata em compassos de todas as cifras.
- A ferramenta ainda não tem baixo cromático descendente (só grau conjunto
  em semitom ou tom) nem modulação.

## Ideias para depois
- Baixo cromático (Águas de Março, Insensatez, Construção).
- Empréstimo de bIII e bII (Maria, Maria).
