<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdMigalhas } from '$lib/presenter/seo';
	import { urlAbsoluta } from '$lib/presenter/site';
	import CartaoArtigo from '$lib/presenter/ui/CartaoArtigo.svelte';
	import CorpoArtigo from '$lib/presenter/ui/CorpoArtigo.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	let { data } = $props();
	const caminho = $derived(`/series/${data.serie.slug}`);
</script>

<Seo
	titulo={data.serie.titulo}
	descricao={data.serie.descricao}
	{caminho}
	jsonLd={[
		{
			'@context': 'https://schema.org',
			'@type': 'CreativeWorkSeries',
			name: data.serie.titulo,
			description: data.serie.descricao,
			url: urlAbsoluta(caminho),
			inLanguage: 'pt-BR',
			hasPart: data.artigos.map((a) => ({
				'@type': 'BlogPosting',
				headline: a.artigo.titulo,
				url: urlAbsoluta(`/artigos/${a.artigo.slug}`)
			}))
		},
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: data.serie.titulo, caminho }
		])
	]}
/>

<header>
	<p class="rotulo">
		{t('series.label')} · {t('series.count', { count: data.artigos.length })}
	</p>
	<h1>{data.serie.titulo}</h1>
	<p class="descricao">{data.serie.descricao}</p>
</header>

<CorpoArtigo html={data.html} />

<ol class="lista">
	{#each data.artigos as item (item.artigo.slug)}
		<li>
			<CartaoArtigo artigo={item.artigo} minutos={item.minutos} />
		</li>
	{/each}
</ol>

<style>
	header {
		max-width: var(--measure);
		margin-bottom: var(--space-6);
	}

	.rotulo {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-accent);
		margin: 0 0 var(--space-3);
	}

	.descricao {
		font-size: var(--text-lg);
		color: var(--color-muted);
		margin: 0;
	}

	.lista {
		list-style: none;
		padding: 0;
		margin: var(--space-6) 0 0;
		display: grid;
		gap: var(--space-5);
		max-width: var(--content-width);
	}
</style>
