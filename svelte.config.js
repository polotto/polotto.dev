import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Site todo estático: cada rota vira arquivo no build e o Cloudflare
		// Pages só serve `build/`.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			strict: true
		}),
		prerender: {
			handleHttpError: 'fail',
			// Páginas sem link de nenhuma outra, mas que precisam existir.
			entries: ['*', '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt'],
			// Sem artigo ou série publicada, as rotas de conteúdo não geram página.
			// Isso é válido (site recém-criado); qualquer outra rota não vista falha.
			handleUnseenRoutes: ({ routes, message }) => {
				const conteudo = ['/artigos/[slug]', '/artigos/[slug].md', '/series/[slug]'];
				if (routes.every((r) => conteudo.includes(r))) return;
				throw new Error(message);
			}
		}
	}
};

export default config;
