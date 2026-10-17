import { repositorio } from '$lib/app/conteudo.server';
import { gerarRss } from '$lib/presenter/arquivos';

export const prerender = true;

export const GET = () =>
	new Response(gerarRss(repositorio), {
		headers: { 'content-type': 'application/rss+xml; charset=utf-8' }
	});
