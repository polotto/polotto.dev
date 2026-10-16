<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdSite } from '$lib/presenter/seo';
	import CartaoArtigo from '$lib/presenter/ui/CartaoArtigo.svelte';
	import CartaoProjeto from '$lib/presenter/ui/CartaoProjeto.svelte';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Inscricao from '$lib/presenter/ui/Inscricao.svelte';
	import Mascote from '$lib/presenter/ui/Mascote.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	let { data } = $props();
</script>

<Seo descricao={t('site.description')} caminho="/" jsonLd={[jsonLdSite()]} />

<section class="hero">
	<div class="mascote"><Mascote tamanho={8} /></div>
	<h1>{t('home.title')}</h1>
	<p class="tagline">{t('home.tagline')}</p>
</section>

<section class="bloco">
	<h2>{t('home.recent')}</h2>
	{#if data.artigos.length}
		<div class="lista">
			{#each data.artigos as item (item.artigo.slug)}
				<CartaoArtigo artigo={item.artigo} minutos={item.minutos} nomeSerie={item.nomeSerie} />
			{/each}
		</div>
		{#if data.temMais}
			<p class="mais">
				<a href="/artigos">{t('home.allArticles')} <Icon name="seta-direita" size={12} /></a>
			</p>
		{/if}
	{:else}
		<p class="vazio">{t('home.empty')}</p>
	{/if}
</section>

{#if data.projetos.length}
	<section class="bloco">
		<h2>{t('home.projects')}</h2>
		<div class="grade">
			{#each data.projetos as projeto (projeto.slug)}
				<CartaoProjeto {projeto} />
			{/each}
		</div>
		<p class="mais">
			<a href="/projetos">{t('home.allProjects')} <Icon name="seta-direita" size={12} /></a>
		</p>
	</section>
{/if}

<Inscricao />

<style>
	.hero {
		padding: var(--space-4) 0 var(--space-8);
	}

	.mascote {
		margin-bottom: var(--space-5);
	}

	.tagline {
		font-size: var(--text-lg);
		color: var(--color-muted);
		max-width: var(--measure);
		margin: 0;
	}

	.bloco + .bloco {
		margin-top: var(--space-8);
	}

	.lista {
		display: grid;
		gap: var(--space-5);
		max-width: var(--content-width);
	}

	.grade {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
	}

	.mais a {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.vazio {
		color: var(--color-muted);
	}
</style>
