import { describe, expect, it } from 'vitest';
import type { ConteudoRepository } from '$lib/domain/models';
import {
	gerarArtigoMd,
	gerarLlmsFull,
	gerarLlmsTxt,
	gerarRobots,
	gerarRss,
	gerarSitemap
} from './arquivos';

const repo: ConteudoRepository = {
	artigos: () => [
		{
			slug: 'por-que-migrar',
			titulo: 'Por que migrar',
			descricao: 'Segurança & gente.',
			publicado: '2026-11-02',
			atualizado: '2026-11-10',
			serie: { slug: 'legado', ordem: 1 },
			projetos: [],
			corpo: '## Segurança\n\nTexto.'
		},
		{
			slug: 'avulso',
			titulo: 'Avulso <1>',
			descricao: 'D.',
			publicado: '2026-10-01',
			projetos: [],
			corpo: 'Corpo.'
		}
	],
	series: () => [{ slug: 'legado', titulo: 'Migrando o legado', descricao: 'Série.', corpo: '' }],
	projetos: () => [
		{
			slug: 'lp',
			nome: 'Live Player',
			descricao: 'Player.',
			situacao: 'ativo',
			destaque: true,
			links: { site: 'https://getliveplayer.com' },
			corpo: ''
		}
	]
};

describe('arquivos gerados', () => {
	it('robots libera todos e os crawlers de LLM, com sitemap', () => {
		const robots = gerarRobots();
		for (const ua of ['*', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
			expect(robots).toContain(`User-agent: ${ua}\nAllow: /`);
		}
		expect(robots).not.toContain('Disallow');
		expect(robots).toContain('Sitemap: https://polotto.dev/sitemap.xml');
	});

	it('sitemap tem páginas fixas, artigos e séries com lastmod', () => {
		const xml = gerarSitemap(repo);
		expect(xml).toContain('<loc>https://polotto.dev/</loc><lastmod>2026-11-10</lastmod>');
		expect(xml).toContain('<loc>https://polotto.dev/artigos/por-que-migrar</loc><lastmod>2026-11-10</lastmod>');
		expect(xml).toContain('<loc>https://polotto.dev/artigos/avulso</loc><lastmod>2026-10-01</lastmod>');
		expect(xml).toContain('<loc>https://polotto.dev/series/legado</loc>');
		expect(xml).toContain('<loc>https://polotto.dev/sobre</loc>');
		expect(xml).toContain('<loc>https://polotto.dev/ferramentas</loc>');
		expect(xml).toContain('<loc>https://polotto.dev/ferramentas/cpf-cnpj</loc>');
	});

	it('rss escapa XML e ordena do mais recente', () => {
		const xml = gerarRss(repo);
		expect(xml).toContain('<language>pt-br</language>');
		expect(xml).toContain('Segurança &amp; gente.');
		expect(xml).toContain('Avulso &lt;1&gt;');
		expect(xml.indexOf('por-que-migrar')).toBeLessThan(xml.indexOf('avulso'));
	});

	it('llms.txt segue o formato: H1, resumo, seções com links', () => {
		const txt = gerarLlmsTxt(repo);
		expect(txt.startsWith('# polotto.dev\n\n> ')).toBe(true);
		expect(txt).toContain('- [Por que migrar](https://polotto.dev/artigos/por-que-migrar.md): Segurança & gente.');
		expect(txt).toContain('- [Migrando o legado](https://polotto.dev/series/legado): Série.');
		expect(txt).toContain('- [Live Player](https://getliveplayer.com): Player.');
		expect(txt).toContain('- [Artigos](https://polotto.dev/artigos): ');
		expect(txt).toContain('## Ferramentas');
		expect(txt).toContain('- [Ferramentas](https://polotto.dev/ferramentas): ');
		expect(txt).toContain('- [Gerador de QR Code](https://polotto.dev/ferramentas/qrcode): ');
		expect(txt).toContain('- [Projetos](https://polotto.dev/projetos): ');
		expect(txt).toContain('## Optional');
		expect(txt).toContain('https://polotto.dev/llms-full.txt');
	});

	it('markdown do artigo traz contexto e o corpo', () => {
		const md = gerarArtigoMd(repo, repo.artigos()[0]);
		expect(md).toContain('# Por que migrar');
		expect(md).toContain('Parte 1 da série Migrando o legado');
		expect(md).toContain('## Segurança');
	});

	it('llms-full junta todos os artigos', () => {
		const full = gerarLlmsFull(repo);
		expect(full).toContain('# Por que migrar');
		expect(full).toContain('# Avulso <1>');
	});
});
