---
titulo: Parcial, completa ou com proxy
descricao: Os três jeitos de migrar e como escolher sem apostar o negócio inteiro.
slug: tipos-de-migracao
status: publicado
publicado: 2026-12-07
serie: migrando-o-legado
ordem: 2
---

Texto de exemplo da parte 2. Volte para [[por-que-migrar]].

## Exemplo de diagrama

```mermaid
flowchart LR
    cliente[Cliente] --> proxy[Proxy<br/>roteamento]
    proxy -->|o que já migrou| novo[Sistema novo]
    proxy -->|o resto| legado[Legado]
```
