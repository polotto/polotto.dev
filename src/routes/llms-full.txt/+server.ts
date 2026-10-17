import { repositorio } from '$lib/app/conteudo';
import { gerarLlmsFull } from '$lib/presenter/arquivos';

export const prerender = true;

export const GET = () =>
	new Response(gerarLlmsFull(repositorio), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
