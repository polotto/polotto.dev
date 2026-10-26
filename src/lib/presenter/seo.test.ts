import { describe, expect, it } from 'vitest';
import type { Artigo, Serie } from '$lib/domain/models';
import { jsonLdArtigo, jsonLdMigalhas, serializarJsonLd } from './seo';

const artigo: Artigo = {
	slug: 'por-que-migrar',
	titulo: 'Por que migrar',
	descricao: 'D.',
	publicado: '2026-11-02',
	serie: { slug: 'migrando-o-legado', ordem: 1 },
	projetos: [],
	corpo: ''
};
const serie: Serie = { slug: 'migrando-o-legado', titulo: 'Migrando o legado', descricao: '', corpo: '' };

describe('JSON-LD', () => {
	it('artigo de série leva isPartOf e posição', () => {
		const ld = jsonLdArtigo(artigo, serie);
		expect(ld).toMatchObject({
			'@type': 'BlogPosting',
			headline: 'Por que migrar',
			url: 'https://polotto.dev/artigos/por-que-migrar',
			datePublished: '2026-11-02',
			dateModified: '2026-11-02',
			inLanguage: 'pt-BR',
			isPartOf: { '@type': 'CreativeWorkSeries', url: 'https://polotto.dev/series/migrando-o-legado' },
			position: 1
		});
	});

	it('artigo em inglês leva inLanguage en', () => {
		expect(jsonLdArtigo({ ...artigo, idioma: 'en' })).toMatchObject({ inLanguage: 'en' });
	});

	it('artigo avulso não leva isPartOf', () => {
		expect(jsonLdArtigo({ ...artigo, serie: undefined })).not.toHaveProperty('isPartOf');
	});

	it('migalhas numeradas a partir de 1', () => {
		const ld = jsonLdMigalhas([
			{ nome: 'Início', caminho: '/' },
			{ nome: 'Artigos', caminho: '/artigos' }
		]);
		expect(ld.itemListElement).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Início', item: 'https://polotto.dev/' },
			{ '@type': 'ListItem', position: 2, name: 'Artigos', item: 'https://polotto.dev/artigos' }
		]);
	});

	it('não deixa fechar a tag script', () => {
		expect(serializarJsonLd({ a: '</script>' })).not.toContain('</script>');
	});
});
