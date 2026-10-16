<script lang="ts">
	import { caminhoFerramenta, FERRAMENTAS } from '$lib/presenter/ferramentas';
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdMigalhas } from '$lib/presenter/seo';
	import { urlAbsoluta } from '$lib/presenter/site';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';
</script>

<Seo
	titulo={t('tools.title')}
	descricao={t('tools.description')}
	caminho="/ferramentas"
	jsonLd={[
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: t('tools.title'),
			itemListElement: FERRAMENTAS.map((f, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: t(`tools.${f.slug}.title`),
				url: urlAbsoluta(caminhoFerramenta(f.slug))
			}))
		},
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: t('tools.title'), caminho: '/ferramentas' }
		])
	]}
/>

<h1>{t('tools.title')}</h1>
<p class="descricao">{t('tools.description')}</p>

<ul class="lista">
	{#each FERRAMENTAS as f (f.slug)}
		<li>
			<a class="cartao" href={caminhoFerramenta(f.slug)}>
				<span class="icone"><Icon name={f.icone} size={32} /></span>
				<span class="titulo">{t(`tools.${f.slug}.title`)}</span>
				<span class="texto">{t(`tools.${f.slug}.description`)}</span>
			</a>
		</li>
	{/each}
</ul>

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

	.cartao {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: var(--frame-width) solid var(--color-border);
		color: var(--color-text);
		text-decoration: none;
		transition: transform var(--duration), box-shadow var(--duration);
	}

	.cartao:hover,
	.cartao:focus-visible {
		transform: translate(calc(-1 * var(--shadow-offset) / 2), calc(-1 * var(--shadow-offset) / 2));
		box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--color-shadow);
	}

	.icone {
		color: var(--color-accent);
	}

	.titulo {
		font-family: var(--font-display);
		font-size: var(--text-md);
		line-height: var(--leading-tight);
	}

	.texto {
		font-size: var(--text-sm);
		color: var(--color-muted);
	}
</style>
