import { error } from '@sveltejs/kit';
import { buscarSerie, listarSeries } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/infrastructure/repositorio';
import { renderizarMarkdown } from '$lib/presenter/markdown';
import { resumir } from '$lib/presenter/resumo';

export const entries = () => listarSeries(repositorio).map((s) => ({ slug: s.slug }));

export const load = async ({ params }) => {
	const serie = buscarSerie(repositorio, params.slug);
	if (!serie) error(404);
	return {
		serie: { slug: serie.slug, titulo: serie.titulo, descricao: serie.descricao },
		html: await renderizarMarkdown(serie.corpo),
		artigos: resumir(repositorio, serie.artigos)
	};
};
