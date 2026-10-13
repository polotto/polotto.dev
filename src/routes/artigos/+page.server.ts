import { listarArtigos } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/infrastructure/repositorio';
import { resumir } from '$lib/presenter/resumo';

export const load = () => ({
	artigos: resumir(repositorio, listarArtigos(repositorio))
});
