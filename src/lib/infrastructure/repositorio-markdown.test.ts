import { describe, expect, it } from 'vitest';
import { criarRepositorio } from './repositorio-markdown';

const arquivos = {
	'/content/artigos/por-que-migrar.md': `---
titulo: Por que migrar
descricao: D.
slug: por-que-migrar
publicado: 2026-11-02
serie: migrando-o-legado
ordem: 1
projetos:
  - live-player
---

Texto.
`,
	'/content/artigos/avulso.md': `---
titulo: Avulso
descricao: D.
slug: avulso
publicado: 2026-10-01
atualizado: 2026-10-05
projetos: []
---

Corpo.
`,
	'/content/series/migrando-o-legado.md': `---
titulo: Migrando o legado
descricao: Série.
slug: migrando-o-legado
---

Apresentação.
`,
	'/content/projetos/live-player.md': `---
nome: Live Player
descricao: Player.
slug: live-player
situacao: ativo
destaque: true
links:
  site: https://getliveplayer.com
---
`
};

describe('repositório markdown', () => {
	const repo = criarRepositorio(arquivos);

	it('lê artigos com série e projetos', () => {
		const artigo = repo.artigos().find((a) => a.slug === 'por-que-migrar');
		expect(artigo).toEqual({
			slug: 'por-que-migrar',
			titulo: 'Por que migrar',
			descricao: 'D.',
			publicado: '2026-11-02',
			atualizado: undefined,
			serie: { slug: 'migrando-o-legado', ordem: 1 },
			projetos: ['live-player'],
			corpo: 'Texto.'
		});
	});

	it('lê artigo avulso com data de atualização', () => {
		const artigo = repo.artigos().find((a) => a.slug === 'avulso');
		expect(artigo?.serie).toBeUndefined();
		expect(artigo?.atualizado).toBe('2026-10-05');
	});

	it('lê séries e projetos', () => {
		expect(repo.series()).toEqual([
			{ slug: 'migrando-o-legado', titulo: 'Migrando o legado', descricao: 'Série.', corpo: 'Apresentação.' }
		]);
		expect(repo.projetos()[0]).toMatchObject({
			slug: 'live-player',
			situacao: 'ativo',
			destaque: true,
			links: { site: 'https://getliveplayer.com' }
		});
	});

	it('deixa de fora o artigo agendado para depois de hoje', () => {
		const slugs = (hoje: string) => criarRepositorio(arquivos, hoje).artigos().map((a) => a.slug);
		expect(slugs('2026-11-01')).toEqual(['avulso']);
		expect(slugs('2026-11-02')).toEqual(['por-que-migrar', 'avulso']);
	});

	it('sem conteúdo devolve listas vazias', () => {
		const vazio = criarRepositorio({});
		expect(vazio.artigos()).toEqual([]);
		expect(vazio.projetos()).toEqual([]);
	});

	it('acusa arquivo sem frontmatter', () => {
		expect(() => criarRepositorio({ '/content/artigos/x.md': 'sem frontmatter' })).toThrow(/npm run sync/);
	});
});
