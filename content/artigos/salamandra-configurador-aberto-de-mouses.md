---
titulo: "Salamandra: configurar mouse Redragon sem o software do fabricante"
descricao: Por que escrevi um configurador aberto para o meu M901-1, como
  funciona o protocolo, o que já roda em outros três modelos e como ajudar a
  testar.
slug: salamandra-configurador-aberto-de-mouses
publicado: 2026-10-25
projetos:
  - salamandra
---

English version: [Salamandra: configuring a Redragon mouse without the vendor software](/artigos/salamandra-open-mouse-configurator).

Eu tenho um Redragon M901-1 Perdition 2. O mouse guarda LED, DPI, botões e macros na própria memória. Para mudar qualquer coisa, só existe o software do fabricante, e ele é só para Windows.

No macOS e no Linux, o mouse fica preso nos valores de fábrica. Então eu escrevi o Salamandra.

## O que é

Um configurador aberto, para Windows, Linux e macOS. Ajusta LED, DPI, polling rate, perfis, botões e macros direto no mouse. Não precisa do software do fabricante e não fica rodando em segundo plano para o mouse funcionar.

O código está em [github.com/polotto/salamandra](https://github.com/polotto/salamandra), com licença MIT. É escrito em Rust, com app em Tauri e Svelte.

![Níveis de DPI no app](/media/salamandra-configurador-aberto-de-mouses/app-dpi-dark-pt.png)

![Iluminação no app](/media/salamandra-configurador-aberto-de-mouses/app-lighting-dark-pt.png)

Os prints do app usam dados de exemplo em um mouse simulado.

## Como descobri o protocolo

Esse mouse usa um chip Holtek. A configuração viaja por feature reports HID: um comando, um endereço de memória, um tamanho e os dados. Gravar é `F3`, ler é `F2`, e o resto só troca de perfil e confirma a gravação.

Para mapear os endereços, eu li como o software oficial monta cada pacote. Fiz isso para interoperabilidade, com decompilação do executável, e só levei para o repositório fatos: endereço, tamanho, byte e de qual função veio. Nenhum arquivo do fabricante entra no repo.

Os valores que ficaram só no papel viraram teste. Cada modelo tem testes que montam o pacote e comparam byte a byte com o esperado.

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

Os três últimos foram mapeados a partir do software oficial e de documentação pública, e nunca foram conferidos no mouse físico. O app mostra um aviso fixo e a CLI avisa antes de cada gravação. Ele grava mesmo assim, então faça backup antes.

Tem uma armadilha que descobri no caminho: o mesmo ID USB pode cobrir modelos com sensores diferentes, e só a versão do dispositivo separa um do outro. O `show` agora imprime essa versão.

## Como ajudar

Preciso de gente com mouse físico:

* testar Impact, Invader ou Cobra e contar o que aconteceu (tem um template de issue para isso)
* me passar o ID USB de outros modelos Redragon
* ter um Griffin M607, que ainda está bloqueado por falta de mouse

Instaladores para os três sistemas estão na [página de releases](https://github.com/polotto/salamandra/releases). A versão é de teste (pré-release).
