import { error } from '@sveltejs/kit';
import { buscarArtigo, listarArtigos, minutosDeLeitura, posicaoNaSerie } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/app/conteudo.server';
import { renderizarMarkdown } from '$lib/presenter/markdown';

export const entries = () => listarArtigos(repositorio).map((a) => ({ slug: a.slug }));

export const load = async ({ params }) => {
	const artigo = buscarArtigo(repositorio, params.slug);
	if (!artigo) error(404);

	const posicao = posicaoNaSerie(repositorio, artigo);
	const leve = (a?: { slug: string; titulo: string }) => a && { slug: a.slug, titulo: a.titulo };
	const projetos = repositorio
		.projetos()
		.filter((p) => artigo.projetos.includes(p.slug))
		.map((p) => ({ ...p, corpo: '' }));

	return {
		artigo: { ...artigo, corpo: '' },
		html: await renderizarMarkdown(artigo.corpo),
		minutos: minutosDeLeitura(artigo),
		serie: posicao && {
			slug: posicao.serie.slug,
			titulo: posicao.serie.titulo,
			descricao: posicao.serie.descricao,
			corpo: '',
			anterior: leve(posicao.anterior),
			proximo: leve(posicao.proximo)
		},
		projetos
	};
};
