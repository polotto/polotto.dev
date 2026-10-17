import { artigosDoProjeto, listarProjetos } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/app/conteudo.server';

export const load = () => ({
	projetos: listarProjetos(repositorio).map((p) => ({
		projeto: { ...p, corpo: '' },
		artigos: artigosDoProjeto(repositorio, p.slug).map((a) => ({ slug: a.slug, titulo: a.titulo }))
	}))
});
