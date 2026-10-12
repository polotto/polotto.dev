<script lang="ts">
	import { formatDate, t } from '$lib/presenter/i18n/i18n';
	import { jsonLdArtigo, jsonLdMigalhas } from '$lib/presenter/seo';
	import CartaoProjeto from '$lib/presenter/ui/CartaoProjeto.svelte';
	import CorpoArtigo from '$lib/presenter/ui/CorpoArtigo.svelte';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	let { data } = $props();
	const artigo = $derived(data.artigo);
	const serie = $derived(data.serie);
</script>

<Seo
	titulo={artigo.titulo}
	descricao={artigo.descricao}
	caminho={`/artigos/${artigo.slug}`}
	tipo="article"
	publicado={artigo.publicado}
	atualizado={artigo.atualizado}
	jsonLd={[
		jsonLdArtigo(artigo, serie),
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: t('articles.title'), caminho: '/artigos' },
			{ nome: artigo.titulo, caminho: `/artigos/${artigo.slug}` }
		])
	]}
/>

<article>
	<header>
		{#if serie && artigo.serie}
			<p class="serie">
				<a href={`/series/${serie.slug}`}>
					{t('article.partOf', { order: artigo.serie.ordem, series: serie.titulo })}
				</a>
			</p>
		{/if}
		<h1>{artigo.titulo}</h1>
		<p class="descricao">{artigo.descricao}</p>
		<p class="meta">
			<time datetime={artigo.publicado}>
				{t('article.published', { date: formatDate(artigo.publicado) })}
			</time>
			{#if artigo.atualizado}
				<span aria-hidden="true">·</span>
				<time datetime={artigo.atualizado}>
					{t('article.updated', { date: formatDate(artigo.atualizado) })}
				</time>
			{/if}
			<span aria-hidden="true">·</span>
			<span>{t('article.readingTime', { count: data.minutos })}</span>
		</p>
	</header>

	<CorpoArtigo html={data.html} />

	{#if serie}
		<nav class="navegacao-serie" aria-label={t('series.label')}>
			{#if serie.anterior}
				<a href={`/artigos/${serie.anterior.slug}`} class="anterior">
					<small>{t('article.previous')}</small>
					<span><Icon name="seta-esquerda" size={12} /> {serie.anterior.titulo}</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if serie.proximo}
				<a href={`/artigos/${serie.proximo.slug}`} class="proximo">
					<small>{t('article.next')}</small>
					<span>{serie.proximo.titulo} <Icon name="seta-direita" size={12} /></span>
				</a>
			{/if}
		</nav>
		<p class="indice">
			<a href={`/series/${serie.slug}`}>{t('article.seriesIndex')}</a>
		</p>
	{/if}

	{#if data.projetos.length}
		<section class="projetos">
			<h2>{t('article.projects')}</h2>
			<div class="grade">
				{#each data.projetos as projeto (projeto.slug)}
					<CartaoProjeto {projeto} />
				{/each}
			</div>
		</section>
	{/if}
</article>

<style>
	header {
		max-width: var(--measure);
		margin-bottom: var(--space-7);
		padding-bottom: var(--space-5);
		border-bottom: var(--frame-width) dashed var(--color-border);
	}

	.serie {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		margin: 0 0 var(--space-3);
	}

	.serie a {
		color: var(--color-accent);
	}

	.descricao {
		font-size: var(--text-lg);
		color: var(--color-muted);
		margin: 0 0 var(--space-4);
	}

	.meta {
		font-size: var(--text-sm);
		color: var(--color-muted);
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
		margin: 0;
	}

	.navegacao-serie {
		max-width: var(--measure);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		margin-top: var(--space-7);
	}

	.navegacao-serie a {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4);
		border: var(--frame-width) solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
		text-decoration: none;
	}

	.navegacao-serie a:hover {
		border-color: var(--color-accent);
	}

	.proximo {
		grid-column: 2;
		text-align: right;
	}

	.navegacao-serie small {
		color: var(--color-muted);
		font-size: var(--text-xs);
		text-transform: uppercase;
	}

	.navegacao-serie span {
		font-family: var(--font-display);
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.proximo span {
		justify-content: flex-end;
	}

	.indice {
		max-width: var(--measure);
		font-size: var(--text-sm);
	}

	.projetos {
		margin-top: var(--space-8);
	}

	.grade {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}

	@media (max-width: 560px) {
		.navegacao-serie {
			grid-template-columns: 1fr;
		}

		.proximo {
			grid-column: 1;
		}
	}
</style>
