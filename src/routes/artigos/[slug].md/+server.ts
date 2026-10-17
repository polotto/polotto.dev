import { error } from '@sveltejs/kit';
import { buscarArtigo, listarArtigos } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/app/conteudo.server';
import { gerarArtigoMd } from '$lib/presenter/arquivos';

export const prerender = true;

export const entries = () => listarArtigos(repositorio).map((a) => ({ slug: a.slug }));

export const GET = ({ params }) => {
	const artigo = buscarArtigo(repositorio, params.slug);
	if (!artigo) error(404);
	return new Response(gerarArtigoMd(repositorio, artigo), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
};
