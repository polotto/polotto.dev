import { repositorio } from '$lib/infrastructure/repositorio';
import { gerarSitemap } from '$lib/presenter/arquivos';

export const prerender = true;

export const GET = () =>
	new Response(gerarSitemap(repositorio), {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
