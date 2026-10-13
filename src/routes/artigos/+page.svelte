<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdMigalhas } from '$lib/presenter/seo';
	import CartaoArtigo from '$lib/presenter/ui/CartaoArtigo.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	let { data } = $props();
</script>

<Seo
	titulo={t('articles.title')}
	descricao={t('articles.description')}
	caminho="/artigos"
	jsonLd={[
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: t('articles.title'), caminho: '/artigos' }
		])
	]}
/>

<h1>{t('articles.title')}</h1>
{#if data.artigos.length}
	<div class="lista">
		{#each data.artigos as item (item.artigo.slug)}
			<CartaoArtigo artigo={item.artigo} minutos={item.minutos} nomeSerie={item.nomeSerie} />
		{/each}
	</div>
{:else}
	<p class="vazio">{t('articles.empty')}</p>
{/if}

<style>
	.lista {
		display: grid;
		gap: var(--space-5);
		max-width: var(--content-width);
		margin-top: var(--space-6);
	}

	.vazio {
		color: var(--color-muted);
	}
</style>
