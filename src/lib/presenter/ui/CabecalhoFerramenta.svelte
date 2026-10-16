<script lang="ts">
	import { caminhoFerramenta } from '$lib/presenter/ferramentas';
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdFerramenta, jsonLdMigalhas } from '$lib/presenter/seo';
	import Icon from './Icon.svelte';
	import Seo from './Seo.svelte';

	let { slug }: { slug: string } = $props();

	const titulo = $derived(t(`tools.${slug}.title`));
</script>

<Seo
	{titulo}
	descricao={t(`tools.${slug}.description`)}
	caminho={caminhoFerramenta(slug)}
	jsonLd={[
		jsonLdFerramenta(slug),
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: t('tools.title'), caminho: '/ferramentas' },
			{ nome: titulo, caminho: caminhoFerramenta(slug) }
		])
	]}
/>

<p class="voltar">
	<a href="/ferramentas"><Icon name="seta-esquerda" size={12} /> {t('tools.title')}</a>
</p>
<h1>{titulo}</h1>
<p class="descricao">{t(`tools.${slug}.description`)}</p>
<p class="privacidade">{t('tools.privacy')}</p>

<style>
	.voltar {
		margin: 0 0 var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-sm);
	}

	.voltar a {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
		color: var(--color-muted);
		text-decoration: none;
	}

	.voltar a:hover {
		color: var(--color-link);
	}

	.descricao {
		font-size: var(--text-lg);
		color: var(--color-muted);
		max-width: var(--measure);
		margin: 0 0 var(--space-2);
	}

	.privacidade {
		font-size: var(--text-sm);
		color: var(--color-ok);
		margin: 0 0 var(--space-6);
	}
</style>
