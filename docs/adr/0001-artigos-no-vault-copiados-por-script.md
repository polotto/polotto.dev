# 0001 Artigos vivem no vault e chegam ao repo por script

O vault é um repo git local sem remoto, então o CI não enxerga os artigos.
Decidimos que o vault é a fonte de verdade e um script local sincroniza para
o repo só os artigos prontos, convertendo wikilinks e imagens. O markdown no
repo é cópia gerada: editar sempre no vault.

Rejeitado: build local lendo o vault com só o HTML no repo (prende o deploy à
máquina) e a pasta do blog como submódulo (obriga o vault a ter remoto).
