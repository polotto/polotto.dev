import {
	listarArtigos,
	listarProjetos,
	listarSeries
} from '$lib/domain/casos-de-uso';
import type { Artigo, ConteudoRepository } from '$lib/domain/models';
import { t } from './i18n/i18n';
import { AUTOR, SITE_URL, urlAbsoluta } from './site';

// Arquivos gerados no build para buscadores, leitores de feed e LLMs.

const CRAWLERS_LLM = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

function escaparXml(texto: string): string {
	return texto
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const dataDoArtigo = (a: Artigo) => a.atualizado ?? a.publicado;

export function gerarRobots(): string {
	const grupos = ['*', ...CRAWLERS_LLM].map((ua) => `User-agent: ${ua}\nAllow: /`);
	return `${grupos.join('\n\n')}\n\nSitemap: ${urlAbsoluta('/sitemap.xml')}\n`;
}

export function gerarSitemap(repo: ConteudoRepository): string {
	const artigos = listarArtigos(repo);
	const maisRecente = artigos.map(dataDoArtigo).sort().at(-1);
	const urls: { caminho: string; lastmod?: string }[] = [
		{ caminho: '/', lastmod: maisRecente },
		{ caminho: '/artigos', lastmod: maisRecente },
		{ caminho: '/projetos' },
		{ caminho: '/sobre' },
		...artigos.map((a) => ({ caminho: `/artigos/${a.slug}`, lastmod: dataDoArtigo(a) })),
		...listarSeries(repo).map((s) => ({
			caminho: `/series/${s.slug}`,
			lastmod: s.artigos.map(dataDoArtigo).sort().at(-1)
		}))
	];
	const itens = urls
		.map(
			(u) =>
				`  <url><loc>${escaparXml(urlAbsoluta(u.caminho))}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`
		)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itens}\n</urlset>\n`;
}

export function gerarRss(repo: ConteudoRepository): string {
	const artigos = listarArtigos(repo);
	const rfc822 = (iso: string) => new Date(`${iso}T12:00:00Z`).toUTCString();
	const itens = artigos
		.map((a) => {
			const url = escaparXml(urlAbsoluta(`/artigos/${a.slug}`));
			return [
				'    <item>',
				`      <title>${escaparXml(a.titulo)}</title>`,
				`      <link>${url}</link>`,
				`      <guid isPermaLink="true">${url}</guid>`,
				`      <pubDate>${rfc822(a.publicado)}</pubDate>`,
				`      <description>${escaparXml(a.descricao)}</description>`,
				'    </item>'
			].join('\n');
		})
		.join('\n');
	const ultima = artigos[0] ? `\n    <lastBuildDate>${rfc822(artigos[0].publicado)}</lastBuildDate>` : '';
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escaparXml(t('site.name'))}</title>
    <link>${SITE_URL}/</link>
    <description>${escaparXml(t('site.description'))}</description>
    <language>pt-br</language>
    <atom:link href="${urlAbsoluta('/rss.xml')}" rel="self" type="application/rss+xml" />${ultima}
${itens}
  </channel>
</rss>
`;
}

/** Artigo em markdown limpo, com cabeçalho de contexto para quem lê sem o site. */
export function gerarArtigoMd(repo: ConteudoRepository, artigo: Artigo): string {
	const serie = artigo.serie && listarSeries(repo).find((s) => s.slug === artigo.serie?.slug);
	const linhas = [
		`# ${artigo.titulo}`,
		'',
		`> ${artigo.descricao}`,
		'',
		`- ${t('article.published', { date: artigo.publicado })}`,
		...(artigo.atualizado ? [`- ${t('article.updated', { date: artigo.atualizado })}`] : []),
		...(serie && artigo.serie
			? [`- ${t('article.partOf', { order: artigo.serie.ordem, series: serie.titulo })}`]
			: []),
		`- ${AUTOR.nome}, ${urlAbsoluta(`/artigos/${artigo.slug}`)}`,
		'',
		artigo.corpo.trim(),
		''
	];
	return linhas.join('\n');
}

export function gerarLlmsTxt(repo: ConteudoRepository): string {
	const series = listarSeries(repo);
	const artigos = listarArtigos(repo);
	const projetos = listarProjetos(repo);
	const secao = (titulo: string, itens: string[]) =>
		itens.length ? [`## ${titulo}`, '', ...itens, ''] : [];
	return [
		`# ${t('site.name')}`,
		'',
		`> ${t('site.description')}`,
		'',
		t('about.bio'),
		'',
		...secao(
			t('llms.series'),
			series.map((s) => `- [${s.titulo}](${urlAbsoluta(`/series/${s.slug}`)}): ${s.descricao}`)
		),
		...secao(
			t('articles.title'),
			artigos.map((a) => `- [${a.titulo}](${urlAbsoluta(`/artigos/${a.slug}.md`)}): ${a.descricao}`)
		),
		...secao(
			t('projects.title'),
			projetos.map((p) => {
				const link = p.links.site ?? p.links.loja ?? p.links.repo ?? urlAbsoluta('/projetos');
				return `- [${p.nome}](${link}): ${p.descricao}`;
			})
		),
		'## Optional', // i18n-ignore: nome de seção definido pelo padrão llmstxt.org
		'',
		`- [${t('llms.full')}](${urlAbsoluta('/llms-full.txt')})`,
		`- [${t('about.title')}](${urlAbsoluta('/sobre')})`,
		''
	].join('\n');
}

export function gerarLlmsFull(repo: ConteudoRepository): string {
	const artigos = listarArtigos(repo);
	const cabecalho = [`# ${t('site.name')}`, '', `> ${t('site.description')}`, ''].join('\n');
	return [cabecalho, ...artigos.map((a) => gerarArtigoMd(repo, a))].join('\n---\n\n');
}
