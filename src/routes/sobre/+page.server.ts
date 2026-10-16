import { buscarPerfilStackOverflow } from '$lib/infrastructure/stackoverflow';
import { STACKOVERFLOW_ID } from '$lib/presenter/site';

export const load = async ({ fetch }) => ({
	stackoverflow: await buscarPerfilStackOverflow(STACKOVERFLOW_ID, fetch)
});
