import { repositorio } from '$lib/app/conteudo';
import { gerarLlmsTxt } from '$lib/presenter/arquivos';

export const prerender = true;

export const GET = () =>
	new Response(gerarLlmsTxt(repositorio), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
