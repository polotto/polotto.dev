---
titulo: "Salamandra: configurar mouse Redragon sem o software do fabricante"
descricao: Por que escrevi um configurador aberto para o meu M901-1, como
  funciona o protocolo, o que já roda em outros três modelos e como ajudar a
  testar.
slug: salamandra-configurador-aberto-de-mouses
publicado: 2026-10-25
atualizado: 2026-10-26
traducao: salamandra-open-mouse-configurator
projetos:
  - salamandra
---

English version: [Salamandra: configuring a Redragon mouse without the vendor software](/artigos/salamandra-open-mouse-configurator).

Eu tenho um Redragon M901-1 Perdition 2. O mouse guarda LED, DPI, botões e macros na própria memória. Para mudar qualquer coisa, só existe o software do fabricante, e ele é só para Windows.

No macOS e no Linux, o mouse fica preso nos valores de fábrica. Então eu escrevi o Salamandra.

## O que é

Um configurador aberto, para Windows, Linux e macOS. Ajusta LED, DPI, polling rate, perfis, botões e macros direto no mouse. Não precisa do software do fabricante e a configuração fica gravada no mouse: LED, DPI, botões e macros funcionam sem o app. Só os atalhos embutidos (copiar, colar, Alt+Tab) precisam dele rodando em segundo plano.

O código está em [github.com/polotto/salamandra](https://github.com/polotto/salamandra), com licença MIT. É escrito em Rust, com app em Tauri e Svelte.

![Níveis de DPI no app](/media/salamandra-configurador-aberto-de-mouses/app-dpi-dark-pt.png)

![Iluminação no app](/media/salamandra-configurador-aberto-de-mouses/app-lighting-dark-pt.png)

Os prints do app usam dados de exemplo em um mouse simulado.

## Como descobri o protocolo

Esse mouse usa um chip Holtek. A configuração viaja por feature reports HID: um comando, um endereço de memória, um tamanho e os dados. Gravar é `F3`, ler é `F2`, e o resto só troca de perfil e confirma a gravação.

Para mapear os endereços, eu li como o software oficial monta cada pacote. Fiz isso para interoperabilidade, com decompilação do executável, e só levei para o repositório fatos: endereço, tamanho, byte e de qual função veio. Nenhum arquivo do fabricante entra no repo.

Os valores que ficaram só no papel viraram teste. Cada modelo tem testes que montam o pacote e comparam byte a byte com o esperado.

## A estrutura do pacote

Tudo passa por feature reports HID, na interface de configuração do mouse (usage page `0xFFA0`). Não é o mouse normal que move o cursor: é uma terceira interface HID, só para configuração. Por isso o macOS não pede permissão de Input Monitoring.

Cada pacote tem o mesmo cabeçalho de 8 bytes:

![Estrutura de um pacote de configuração](/media/salamandra-configurador-aberto-de-mouses/protocolo-pacote-pt.svg)

* byte 0, `rid`: o tamanho do report. `02` tem 16 bytes, `03` tem 64 e `04` tem 256. Escolho o menor que cabe nos dados
* byte 1, comando: `F3` grava, `F2` lê, `F1` aplica uma área e `F5` abre ou fecha a sessão
* bytes 2 e 3: o endereço de memória, em little-endian. O LED do perfil 1 fica em `0x0449`, então vai `49 04`
* byte 4: quantos bytes de dados vêm depois
* bytes 5 a 7: zero
* a partir do byte 8: os dados. No exemplo, `FF 00 00` é vermelho, `01` é o modo fixo e os dois últimos são velocidade e um campo auxiliar

O pacote do exemplo, `02 F3 49 04 06 00 00 00 FF 00 00 01 00 00 00 00`, é o que o Salamandra monta para pintar o perfil 1 de vermelho. Tem um teste que confere esses 16 bytes.

## Uma gravação, passo a passo

O mouse não aplica o que você grava na hora. O software abre uma sessão, grava, manda aplicar cada área e fecha a sessão:

![Sequência de uma gravação e de uma leitura](/media/salamandra-configurador-aberto-de-mouses/protocolo-sessao-pt.svg)

1. `F5 00` abre a sessão;
2. vários `F3`, um por endereço;
3. `F1 02 <área>` para cada área: `04` botões, `01` perfil, `02` DPI e `08` polling;
4. `F5 01` fecha a sessão.

A leitura é diferente. O `F2` pede os bytes, e a resposta vem em um GetFeature no mesmo report: `rid 08 addr_lo 60 len 00 FA FA` e depois os dados.

Uma armadilha que só apareceu no mouse físico: ao gravar o perfil ativo, os botões do perfil novo valem na hora, mas o LED só troca na próxima sessão. Trocar de perfil e restaurar um backup fazem uma sessão a mais por causa disso.

## Onde cada coisa fica na memória

O mouse tem 5 perfis, cada um com uma base de endereço. DPI e botões ficam relativos a ela. Polling e LED têm tabelas próprias, indexadas pelo perfil. As macros ficam no fim:

![Mapa de memória do M901-1](/media/salamandra-configurador-aberto-de-mouses/protocolo-memoria-pt.svg)

Alguns detalhes que guardei como dados nos modelos:

* DPI: o byte guarda o índice (`DPI / 100`) menos 1 até `0x79`, e menos `0x3D` com uma flag ligada acima disso. É assim que cabem 100 a 24000 DPI
* polling: `08` é 125 Hz, `04` é 250, `02` é 500 e `01` é 1000
* botão: 4 bytes por botão. `81`, `82` e `83` são esquerdo, direito e meio. Uma tecla vira `90 00 <uso HID> 00`
* macro: até 63 eventos de 3 bytes, gravados num report de 256 bytes. Aperta tecla é `84 <uso> 00`, solta é `04 <uso> 00`, e o atraso é `06` mais 16 bits em unidades de 10 ms

## O mouse também fala

O caminho de volta existe: quando você aperta o botão de DPI ou de perfil, o mouse manda um report de entrada. `08 01 <perfil>` avisa que o perfil mudou, `08 02 <nível>` que o nível de DPI mudou e `08 06 <código>` que o polling mudou. O Salamandra escuta esses reports e repassa para a tela do app.

Os botões de atalho embutido (copiar, colar, Alt+Tab) funcionam de outro jeito: o mouse só manda um código (`01 FF <id>`) e é o software no PC que executa o atalho. Por isso o app fica rodando em segundo plano, mesmo com a janela fechada, para executar esses atalhos.

## Linha de comando e MCP

A mesma biblioteca vira uma CLI, sem Tauri e sem janela:

```
salamandra show
salamandra dpi 1 1 1600
salamandra backup
```

![Saída do salamandra show](/media/salamandra-configurador-aberto-de-mouses/cli-show.png)

Ela também vira um servidor MCP. Qualquer cliente MCP consegue ler a configuração e gravar LED, DPI e botões. As ferramentas que alteram o mouse avisam quando o modelo nunca foi testado.

![Ferramentas do servidor MCP](/media/salamandra-configurador-aberto-de-mouses/mcp-tools.png)

## O que roda hoje

| Mouse | Situação |
| --- | --- |
| Redragon M901-1 Perdition 2 | testado no meu mouse |
| Redragon M908 Impact | não testado |
| Redragon M719 Invader | não testado |
| Redragon M711 Cobra | não testado |

Os três últimos foram mapeados a partir do software oficial e de documentação pública, e nunca foram conferidos no mouse físico. O app mostra um aviso fixo e a CLI avisa antes de cada gravação. O Salamandra grava mesmo assim, então faça backup antes.

Tem uma armadilha que descobri no caminho: o mesmo ID USB pode cobrir modelos com sensores diferentes, e só a versão do dispositivo separa um do outro. O `show` agora imprime essa versão.

## Como ajudar

Preciso de gente com mouse físico:

* testar Impact, Invader ou Cobra e contar o que aconteceu (tem um template de issue para isso)
* me passar o ID USB de outros modelos Redragon
* ter um Griffin M607, que ainda está bloqueado por falta de mouse

Instaladores para os três sistemas estão na [página de releases](https://github.com/polotto/salamandra/releases). A versão é de teste (pré-release).
