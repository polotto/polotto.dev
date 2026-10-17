import { listarArtigos } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/app/conteudo.server';
import { resumir } from '$lib/presenter/resumo';

export const load = () => ({
	artigos: resumir(repositorio, listarArtigos(repositorio))
});
