<script lang="ts">
	import '$lib/presenter/ui/global.css';
	import { dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Cabecalho from '$lib/presenter/ui/Cabecalho.svelte';
	import Rodape from '$lib/presenter/ui/Rodape.svelte';
	import { GOATCOUNTER_CODIGO } from '$lib/presenter/site';

	let { children } = $props();

	// O count.js conta a primeira página ao carregar. As seguintes são navegação
	// do SvelteKit, sem recarregar a página, e precisam ser contadas aqui.
	afterNavigate(({ type }) => {
		if (type === 'enter') return;
		window.goatcounter?.count({ path: location.pathname + location.search });
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="alternate" type="application/rss+xml" title="polotto.dev" href="/rss.xml" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=Pixelify+Sans:wght@500;700&display=swap"
	/>
	{#if GOATCOUNTER_CODIGO && !dev}
		<script
			data-goatcounter={`https://${GOATCOUNTER_CODIGO}.goatcounter.com/count`}
			async
			src="https://gc.zgo.at/count.js"
		></script>
	{/if}
</svelte:head>

<Cabecalho atual={page.url.pathname} />
<main id="conteudo">
	{@render children()}
</main>
<Rodape />

<style>
	main {
		max-width: var(--page-width);
		margin: 0 auto;
		padding: var(--space-7) var(--space-4) 0;
	}
</style>
