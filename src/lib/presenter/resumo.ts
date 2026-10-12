import { listarSeries, minutosDeLeitura } from '$lib/domain/casos-de-uso';
import type { Artigo, ConteudoRepository } from '$lib/domain/models';

/** O que o cartão de artigo precisa, sem o corpo (não vai para o navegador). */
export interface ResumoArtigo {
	artigo: Omit<Artigo, 'corpo'> & { corpo: '' };
	minutos: number;
	nomeSerie?: string;
}

export function resumir(repo: ConteudoRepository, artigos: Artigo[]): ResumoArtigo[] {
	const nomes = new Map(listarSeries(repo).map((s) => [s.slug, s.titulo]));
	return artigos.map((a) => ({
		artigo: { ...a, corpo: '' },
		minutos: minutosDeLeitura(a),
		nomeSerie: a.serie ? nomes.get(a.serie.slug) : undefined
	}));
}
