<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdMigalhas } from '$lib/presenter/seo';
	import CartaoProjeto from '$lib/presenter/ui/CartaoProjeto.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	let { data } = $props();
</script>

<Seo
	titulo={t('projects.title')}
	descricao={t('projects.description')}
	caminho="/projetos"
	jsonLd={[
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: t('projects.title'), caminho: '/projetos' }
		])
	]}
/>

<h1>{t('projects.title')}</h1>
<p class="descricao">{t('projects.description')}</p>

{#if data.projetos.length}
	<ul class="lista">
		{#each data.projetos as item (item.projeto.slug)}
			<li>
				<CartaoProjeto projeto={item.projeto} />
				{#if item.artigos.length}
					<div class="relacionados">
						<p>{t('projects.related')}</p>
						<ul>
							{#each item.artigos as artigo (artigo.slug)}
								<li><a href={`/artigos/${artigo.slug}`}>{artigo.titulo}</a></li>
							{/each}
						</ul>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p class="vazio">{t('projects.empty')}</p>
{/if}

<style>
	.descricao {
		font-size: var(--text-lg);
		color: var(--color-muted);
		max-width: var(--measure);
	}

	.lista {
		list-style: none;
		padding: 0;
		margin: var(--space-6) 0 0;
		display: grid;
		gap: var(--space-5);
		grid-template-columns: repeat(auto-fill, minmax(var(--card-min-wide), 1fr));
	}

	.relacionados {
		padding: var(--space-3) var(--space-5);
		border: var(--frame-width) solid var(--color-border);
		border-top: 0;
		font-size: var(--text-sm);
	}

	.relacionados p {
		margin: 0 0 var(--space-2);
		color: var(--color-muted);
	}

	.relacionados ul {
		margin: 0;
		padding-left: var(--space-5);
	}

	.vazio {
		color: var(--color-muted);
	}
</style>
