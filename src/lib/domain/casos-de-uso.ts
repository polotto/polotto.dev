import type { Artigo, ConteudoRepository, Projeto, Serie } from './models';

const PALAVRAS_POR_MINUTO = 200;

/** Mais recente primeiro. Empate na data: ordem da série, depois título. */
export function listarArtigos(repo: ConteudoRepository): Artigo[] {
	return [...repo.artigos()].sort(
		(a, b) =>
			b.publicado.localeCompare(a.publicado) ||
			(a.serie?.ordem ?? 0) - (b.serie?.ordem ?? 0) ||
			a.titulo.localeCompare(b.titulo)
	);
}

export function buscarArtigo(repo: ConteudoRepository, slug: string): Artigo | undefined {
	return repo.artigos().find((a) => a.slug === slug);
}

export function minutosDeLeitura(artigo: Artigo): number {
	const palavras = artigo.corpo.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO));
}

export interface SerieComArtigos extends Serie {
	artigos: Artigo[];
}

/** Séries com pelo menos um artigo publicado, artigos pela ordem. */
export function listarSeries(repo: ConteudoRepository): SerieComArtigos[] {
	const artigos = repo.artigos();
	return repo
		.series()
		.map((serie) => ({
			...serie,
			artigos: artigos
				.filter((a) => a.serie?.slug === serie.slug)
				.sort((a, b) => (a.serie?.ordem ?? 0) - (b.serie?.ordem ?? 0))
		}))
		.filter((serie) => serie.artigos.length > 0);
}

export function buscarSerie(
	repo: ConteudoRepository,
	slug: string
): SerieComArtigos | undefined {
	return listarSeries(repo).find((s) => s.slug === slug);
}

export interface PosicaoNaSerie {
	serie: SerieComArtigos;
	anterior?: Artigo;
	proximo?: Artigo;
}

export function posicaoNaSerie(
	repo: ConteudoRepository,
	artigo: Artigo
): PosicaoNaSerie | undefined {
	if (!artigo.serie) return undefined;
	const serie = buscarSerie(repo, artigo.serie.slug);
	if (!serie) return undefined;
	const i = serie.artigos.findIndex((a) => a.slug === artigo.slug);
	return { serie, anterior: serie.artigos[i - 1], proximo: serie.artigos[i + 1] };
}

/** Ativos primeiro, depois pausados, depois encerrados; dentro, por nome. */
export function listarProjetos(repo: ConteudoRepository): Projeto[] {
	const peso = { ativo: 0, pausado: 1, encerrado: 2 } as const;
	return [...repo.projetos()].sort(
		(a, b) => peso[a.situacao] - peso[b.situacao] || a.nome.localeCompare(b.nome)
	);
}

export function projetosEmDestaque(repo: ConteudoRepository): Projeto[] {
	return listarProjetos(repo).filter((p) => p.destaque);
}

export function artigosDoProjeto(repo: ConteudoRepository, slugProjeto: string): Artigo[] {
	return listarArtigos(repo).filter((a) => a.projetos.includes(slugProjeto));
}
