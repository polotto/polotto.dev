import type { Artigo, Serie } from '$lib/domain/models';
import { t } from './i18n/i18n';
import { AUTOR, SITE_URL, urlAbsoluta } from './site';

// JSON-LD (schema.org) das páginas. Ajuda o Google e as buscas por LLM a
// entender quem escreve, o que é artigo e de qual série ele faz parte.

type JsonLd = Record<string, unknown>;

const pessoa = (): JsonLd => ({
	'@type': 'Person',
	name: AUTOR.nome,
	url: urlAbsoluta('/sobre'),
	sameAs: Object.values(AUTOR.perfis)
});

export function jsonLdSite(): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'Blog',
		name: t('site.name'),
		description: t('site.description'),
		url: SITE_URL,
		inLanguage: 'pt-BR',
		author: pessoa()
	};
}

export function jsonLdArtigo(artigo: Artigo, serie?: Serie): JsonLd {
	const url = urlAbsoluta(`/artigos/${artigo.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: artigo.titulo,
		description: artigo.descricao,
		url,
		mainEntityOfPage: url,
		datePublished: artigo.publicado,
		dateModified: artigo.atualizado ?? artigo.publicado,
		inLanguage: 'pt-BR',
		author: pessoa(),
		...(serie && {
			isPartOf: {
				'@type': 'CreativeWorkSeries',
				name: serie.titulo,
				url: urlAbsoluta(`/series/${serie.slug}`)
			},
			position: artigo.serie?.ordem
		})
	};
}

export function jsonLdMigalhas(itens: { nome: string; caminho: string }[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: itens.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.nome,
			item: urlAbsoluta(item.caminho)
		}))
	};
}

/** Serializa para `<script type="application/ld+json">` sem fechar a tag por engano. */
export function serializarJsonLd(dados: JsonLd | JsonLd[]): string {
	return JSON.stringify(dados).replace(/</g, '\\u003c');
}
