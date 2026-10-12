import { gerarRobots } from '$lib/presenter/arquivos';

export const prerender = true;

export const GET = () =>
	new Response(gerarRobots(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
