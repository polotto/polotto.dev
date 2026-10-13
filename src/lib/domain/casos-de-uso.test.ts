import { describe, expect, it } from 'vitest';
import {
	artigosDoProjeto,
	listarArtigos,
	listarProjetos,
	listarSeries,
	minutosDeLeitura,
	posicaoNaSerie,
	projetosEmDestaque
} from './casos-de-uso';
import type { Artigo, ConteudoRepository, Projeto, Serie } from './models';

const artigo = (p: Partial<Artigo> & Pick<Artigo, 'slug'>): Artigo => ({
	titulo: p.slug,
	descricao: '',
	publicado: '2026-01-01',
	projetos: [],
	corpo: '',
	...p
});

const projeto = (p: Partial<Projeto> & Pick<Projeto, 'slug'>): Projeto => ({
	nome: p.slug,
	descricao: '',
	situacao: 'ativo',
	destaque: false,
	links: {},
	corpo: '',
	...p
});

const serie: Serie = { slug: 'legado', titulo: 'Legado', descricao: '', corpo: '' };
const vazia: Serie = { slug: 'vazia', titulo: 'Vazia', descricao: '', corpo: '' };

const repo: ConteudoRepository = {
	artigos: () => [
		artigo({ slug: 'p2', publicado: '2026-12-01', serie: { slug: 'legado', ordem: 2 } }),
		artigo({ slug: 'avulso', publicado: '2026-11-15', projetos: ['lp'] }),
		artigo({ slug: 'p1', publicado: '2026-11-01', serie: { slug: 'legado', ordem: 1 } })
	],
	series: () => [serie, vazia],
	projetos: () => [
		projeto({ slug: 'z', nome: 'Zeta', situacao: 'encerrado' }),
		projeto({ slug: 'lp', nome: 'Live Player', destaque: true }),
		projeto({ slug: 'a', nome: 'Alfa', situacao: 'pausado' })
	]
};

describe('casos de uso', () => {
	it('lista artigos do mais recente para o mais antigo', () => {
		expect(listarArtigos(repo).map((a) => a.slug)).toEqual(['p2', 'avulso', 'p1']);
	});

	it('série sem artigo publicado não aparece', () => {
		expect(listarSeries(repo).map((s) => s.slug)).toEqual(['legado']);
	});

	it('artigos da série seguem a ordem, não a data', () => {
		expect(listarSeries(repo)[0].artigos.map((a) => a.slug)).toEqual(['p1', 'p2']);
	});

	it('acha anterior e próximo na série', () => {
		const p1 = repo.artigos()[2];
		const pos = posicaoNaSerie(repo, p1);
		expect(pos?.anterior).toBeUndefined();
		expect(pos?.proximo?.slug).toBe('p2');
	});

	it('artigo avulso não tem posição em série', () => {
		expect(posicaoNaSerie(repo, repo.artigos()[1])).toBeUndefined();
	});

	it('ordena projetos por situação e nome', () => {
		expect(listarProjetos(repo).map((p) => p.slug)).toEqual(['lp', 'a', 'z']);
	});

	it('filtra destaque e artigos do projeto', () => {
		expect(projetosEmDestaque(repo).map((p) => p.slug)).toEqual(['lp']);
		expect(artigosDoProjeto(repo, 'lp').map((a) => a.slug)).toEqual(['avulso']);
	});

	it('calcula minutos de leitura com mínimo de 1', () => {
		expect(minutosDeLeitura(artigo({ slug: 'x', corpo: 'curto' }))).toBe(1);
		expect(minutosDeLeitura(artigo({ slug: 'y', corpo: 'palavra '.repeat(1000) }))).toBe(5);
	});
});
