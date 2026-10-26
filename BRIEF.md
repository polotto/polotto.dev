# Brief: novo polotto.dev

## Ideia

Recriar o polotto.dev do zero em SvelteKit como blog pessoal em pt-BR, com
artigos longos e autorais e uma página que centraliza os projetos. Os
artigos e os projetos são escritos no vault do Obsidian e sincronizados para
o repo por script. O visual é retrô gaming 16-bit e serve de laboratório
para uma linguagem de design comum a todos os projetos.

## Decisões

Base e publicação
- Mesmo domínio e mesmo repo (`polotto/polotto.dev`), branch
  `sveltekit-rebuild`. Hugo, PaperMod e o submódulo saem inteiros.
- SvelteKit com `adapter-static`. Site todo pré-renderizado. Markdown com
  `marked` em vez de mdsvex, porque `llms.txt` e `/artigos/<slug>.md` precisam
  do markdown cru.
- Hospedagem continua no GitHub Pages (mudou em 12/10/2026; antes seria o
  Cloudflare Pages). O `deploy.yml` publica a cada push em `main` pelo
  GitHub Actions e marca o commit no ar com a tag `prod-*`. DNS sem mudança:
  o domínio já aponta para o GitHub Pages.
- `docs/` deixa de ser saída do build e passa a guardar os ADRs.
- Analytics: GoatCounter. Sai o Google Analytics.

Conteúdo
- Propósito: vitrine profissional com artigos longos e autorais.
- Idioma: só pt-BR.
- Público: dev brasileiro pleno ou sênior e tech lead, de mobile e back-end.
- Termo: Artigo (não post).
- "Migrando o legado" é uma série de artigos, escrita para poder virar
  livro depois.
- Primeiro artigo: parte 1 da série, "Por que migrar" (segurança,
  atualizações, recrutamento). A série só estreia com a parte 2 rascunhada.
- Ritmo: um artigo por mês, sem data fixa.
- Os 4 posts de 2021 (inglês) não entram. Podem voltar traduzidos depois do
  lançamento. Sem redirect das URLs antigas.
- URLs: `/artigos/<slug>`, `/series/<slug>`, `/projetos`.
- Sobre: bio igual ao título do LinkedIn (o perfil não tem a seção Sobre),
  sem o nome da empresa e sem cidade, com os links de LinkedIn, GitHub e
  Stack Overflow. Saem Twitter
  e Buy Me a Coffee.

Vault e sincronização (ADR 0001)
- O vault é a fonte de verdade. O markdown no repo é cópia gerada.
- Artigos em `blog/` no vault, com `status: rascunho | publicado` no
  frontmatter. Só `publicado` é sincronizado.
- Artigo de série: `serie: <slug>` e `ordem: <n>`.
- Projetos em `blog/projetos/<slug>.md`, pelo mesmo script.
- Script em `scripts/sync` no repo, com o caminho do vault por variável de
  ambiente. Converte wikilinks e imagens. Registrado no catálogo pessoal de scripts.

Projetos
- Página `/projetos`. Projeto = algo construído e mostrado; estudo, fork e
  repo de trabalho ficam fora.
- Card: nome, uma frase, status (ativo, pausado, encerrado), links (site,
  loja, repo quando público) e artigos relacionados. Stack e imagem depois.
- No lançamento: Live Player, salamandra, polovoxel, spacefy e
  text-to-audio. O resto entra nota por nota.

Escopo do lançamento
- Entra: home com os artigos recentes e os projetos em destaque, página do
  artigo, página da série, `/projetos`, Sobre, RSS, sitemap, GoatCounter.
- Fora: busca, tags, comentários.

Inscrição por e-mail (decidido em 15/10/2026, saiu do "fora")
- Buttondown. O RSS para e-mail dele é pago (US$ 9/mês); a API não é.
  Então o `deploy.yml`, depois do deploy, cria pela API o e-mail do artigo
  do dia já para envio (`scripts/enviar-email.mjs`). Envio automático, sem
  rascunho. Chave no secret `BUTTONDOWN_API_KEY`. O slug do e-mail é o do
  artigo, para nunca mandar duas vezes.
- Formulário HTML puro, sem script de terceiro, no fim do artigo e na home.
  Link para o RSS ao lado.
- Usuário em `BUTTONDOWN_USUARIO` (`src/lib/presenter/site.ts`). Vazio
  esconde o formulário.

Ferramentas (decidido em 16/10/2026)
- Seção `/ferramentas` no menu, ao lado de Artigos, Projetos e Sobre.
  Ferramentas que eu uso, abertas para quem chegar pela busca.
- Índice em `/ferramentas` e uma página por ferramenta
  (`/ferramentas/<slug>`), cada uma no sitemap, no `llms.txt` e com JSON-LD
  `WebApplication`.
- Tudo roda no navegador: nada do que a pessoa digita sai da página. A
  página diz isso.
- Primeiras: QR Code a partir de texto, gerador e validador de CPF e CNPJ
  (com o CNPJ alfanumérico), formatador e validador de JSON, paleta de
  cores harmônicas e mascote a partir de um texto (estilo identicon do
  GitHub e personagem 16-bit, no tema do blog).
- Gerador de acordes (19/10/2026): sorteia uma sequência, reharmoniza com
  técnicas da MPB e da bossa nova (referências em
  `docs/work/ferramentas/ACORDES-REFERENCIAS.md`), sugere uma linha melódica
  e toca tudo num piano virtual sintetizado no navegador (Web Audio, sem
  amostra). Cifra brasileira (7M, m7(b5)). Código de semente (20/10/2026):
  guarda sementes e opções, vai no endereço (`#s=`) e reproduz a mesma
  música. Exporta MIDI (formato 1, faixas de acordes e melodia).

Artigo agendado (decidido em 15/10/2026)
- `publicado` com data futura agenda o artigo. Ele fica fora do build até o
  dia, no fuso de São Paulo.
- O `deploy.yml` roda todo dia às 06:00 de Brasília e só publica quando algum
  artigo tem `publicado` igual a hoje. Assim não sai tag `prod-*` todo dia.

Busca (Google e assistentes de busca por LLM)
- `/llms.txt` no padrão llmstxt.org: resumo do site e links para as versões
  em markdown de artigos, séries e projetos.
- `/llms-full.txt` com o texto completo de todos os artigos publicados.
- Cada artigo também em markdown limpo, em `/artigos/<slug>.md`.
- `robots.txt` liberando os buscadores e os crawlers de LLM (GPTBot,
  OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended), com o sitemap.
- JSON-LD: `Blog`, `BlogPosting` (com `isPartOf` da série), `Person` e
  `BreadcrumbList`. Open Graph, canonical, `lang="pt-BR"`, datas de
  publicação e atualização visíveis, `lastmod` no sitemap.
- Uma imagem Open Graph padrão no lançamento. Imagem por artigo depois.

Visual
- Tema próprio feito do zero, minimalista, retrô gaming 16-bit (SNES, Mega
  Drive).
- Fonte pixel só em títulos, navegação e detalhes. Corpo em fonte de
  leitura.
- Modo claro e modo escuro, seguindo o sistema.
- Intensidade escolhida no protótipo (12/10/2026): **retrô sutil**. Títulos
  e navegação em Pixelify Sans, corpo em IBM Plex Sans, código em IBM Plex
  Mono. Moldura de 2px, sombra dura de 4px, fundo liso. A forte saiu (Press
  Start 2P quebra maiúscula acentuada).
- Logo: mascote do autor em pixel art ao lado do nome, no estilo
  personagem de mapa de RPG 16-bit (cabeça grande, corpo inteiro). Camisa na
  cor de destaque, calça azul. Descartados: blocos de cor sólida e retrato
  de diálogo. Cabelo longo, barba e bigode,
  sem brinco nem acessório. Cabelo castanho escuro (#4a2b19), barba mais
  clara (#8a5832). Animação em quadros: respira,
  pisca, anda no lugar e pula no hover. Parado com `prefers-reduced-motion`.
- Paleta: quase preto azulado com dourado no modo escuro, papel bege com
  roxo no claro, as quatro cores dos botões do controle como detalhe.
- i18n desde o início: todo texto da interface num catálogo de mensagens,
  sem string fixa. Só o catálogo pt-BR, exceção à regra "mínimo pt-BR e en":
  o conteúdo é só pt-BR e uma interface em inglês ficaria incoerente. O
  catálogo en entra junto com o primeiro artigo traduzido.
  Artigo traduzido (decidido em 25/10/2026): artigo à parte, com `idioma: en`
  e `traducao: <slug da outra versão>` no frontmatter. Leva `lang`, `inLanguage`
  e `hreflang`, e não vai por e-mail. O sync exige que as duas versões
  se apontem e estejam em idiomas diferentes. A tradução entra no RSS e no
  `llms.txt`. A interface segue em pt-BR.
- Componentes em `src/lib/ui`, com tokens nomeados no padrão da futura
  linguagem de design, para extrair depois.

Linguagem de design
- Iniciativa própria, slug `polotto-design`. O blog é o
  primeiro consumidor e não espera por ela.
- Modelo: linguagem comum (escalas, espaçamento, componentes, regras) com um
  tema por projeto. O Live Player mantém o tema Console.

## Em aberto


- Linguagem de design: precisa de entrevista e brief próprios. Inclui como
  o `live-player-design-system` evolui para ela.
- Tradução dos posts de 2021: backlog pós-lançamento.
- Pesquisa de livros sobre migração de legado (pt e en), pedida na nota da
  série: antes de escrever a parte 1.

## Próximo passo

Montar os arquivos de trabalho (`TASKS.md` e `HANDOFF.md`) no repo
(`work-organization.md`) e começar pelo protótipo visual das duas
intensidades.
