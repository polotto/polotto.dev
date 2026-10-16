# Contrato do frontmatter

Fonte: vault em `<vault>/blog/`. O `npm run sync` lê só o que está aqui e
grava em `content/`. Nome do arquivo no vault é livre; o `slug` define a URL.

| Vault | Vira | Exemplo |
| --- | --- | --- |
| `blog/*.md` (só o primeiro nível) | artigo | `exemplos/artigo-serie.md` |
| `blog/series/*.md` | série | `exemplos/serie.md` |
| `blog/projetos/*.md` | projeto | `exemplos/projeto.md` |

`blog/ideias/` e qualquer outra subpasta ficam fora.

## Artigo

| Campo | Obrigatório | Valor |
| --- | --- | --- |
| `titulo` | sim | texto |
| `descricao` | sim | uma ou duas frases; vira meta description e resumo |
| `slug` | sim | kebab-case, único entre artigos |
| `status` | sim | `rascunho` ou `publicado`. Só `publicado` é sincronizado |
| `publicado` | com `publicado` | data `AAAA-MM-DD`. Data futura agenda o artigo |
| `atualizado` | não | data `AAAA-MM-DD`, posterior a `publicado` |
| `serie` | não | slug de uma série |
| `ordem` | com `serie` | inteiro a partir de 1, único dentro da série |
| `projetos` | não | lista de slugs de projeto |

Agendar: `status: publicado` com `publicado` no futuro, depois `npm run sync`
e merge. O artigo fica fora do site (páginas, RSS, sitemap, `llms.txt`) até
o dia, no fuso de São Paulo. O deploy diário das 06:00 publica nesse dia.

## Série

| Campo | Obrigatório | Valor |
| --- | --- | --- |
| `titulo` | sim | texto |
| `descricao` | sim | uma ou duas frases |
| `slug` | sim | kebab-case |
| `status` | sim | `rascunho` ou `publicado` |

O corpo é a apresentação da série. A série só aparece no site se tiver pelo
menos um artigo publicado.

## Projeto

| Campo | Obrigatório | Valor |
| --- | --- | --- |
| `nome` | sim | texto |
| `descricao` | sim | uma frase |
| `slug` | sim | kebab-case |
| `status` | sim | `rascunho` ou `publicado` |
| `situacao` | sim | `ativo`, `pausado` ou `encerrado` |
| `destaque` | não | `true` para aparecer na home |
| `links` | não | mapa com `site`, `loja`, `repo` (URLs) |

`status` é sempre a publicação no site. A fase do projeto é `situacao`, para
um campo não ter dois sentidos.

## Corpo

Markdown do Obsidian. O sync converte:

- `[[slug-de-artigo]]` e `[[slug|texto]]` em link para `/artigos/<slug>`;
  wikilink para algo não publicado vira texto puro.
- `![[imagem.png]]` e `![alt](imagem.png)` em `/media/<slug>/<arquivo>`, copiando a
  imagem da mesma pasta da nota (anexos do vault ficam em `./`).
