---
titulo: Por que migrar
descricao: Segurança, atualizações e recrutamento. Os três motivos que tiram um sistema legado do porto.
slug: por-que-migrar
status: publicado
publicado: 2026-11-02
atualizado: 2026-11-10
serie: migrando-o-legado
ordem: 1
projetos: [live-player]
---

Todo sistema legado chega num dia em que ficar parado custa mais que mudar. O difícil é perceber esse dia antes que ele vire uma emergência.

Neste primeiro artigo da série, olho para os três motivos que mais pesam na decisão: segurança, atualizações e gente.

## Segurança

Um sistema antigo raramente passa limpo por uma esteira moderna de segurança. Quatro tipos de análise costumam acender a luz vermelha:

- **SAST**, que lê o código parado;
- **SCA**, que olha as dependências e as versões com falha conhecida;
- **IaC**, que confere a infraestrutura descrita em código;
- **DAST**, que ataca o sistema rodando.

> Dependência sem atualização há cinco anos não é estável. É abandonada.

## Atualizações

Quando o framework para no tempo, cada correção vira arqueologia. Um exemplo comum é o build que só roda numa máquina específica:

```bash
# só funciona com a JDK 8 e o Maven 3.3
export JAVA_HOME=/opt/jdk1.8.0_202
mvn -o clean package -DskipTests
```

## Recrutamento

A última pergunta é sobre pessoas. Quem vai manter isso daqui a cinco anos?

No próximo artigo: [[Tipos de migracao|os tipos de migração]].
