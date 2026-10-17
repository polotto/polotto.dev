import { perfis } from '$lib/app/conteudo.server';
import { STACKOVERFLOW_ID } from '$lib/presenter/site';

export const load = async ({ fetch }) => ({
	stackoverflow: await perfis(fetch).buscarPerfil(STACKOVERFLOW_ID)
});
