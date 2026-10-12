<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/presenter/i18n/i18n';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Mascote from '$lib/presenter/ui/Mascote.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	// Nunca mostra o erro técnico: só a mensagem amigável.
	const naoEncontrada = $derived(page.status === 404);
</script>

<Seo
	titulo={naoEncontrada ? t('error.notFound') : t('error.generic')}
	descricao={naoEncontrada ? t('error.notFoundText') : t('error.genericText')}
	caminho={page.url.pathname}
	semIndice
/>

<section class="erro">
	<Mascote tamanho={8} />
	<p class="codigo">{page.status}</p>
	<h1>{naoEncontrada ? t('error.notFound') : t('error.generic')}</h1>
	<p>{naoEncontrada ? t('error.notFoundText') : t('error.genericText')}</p>
	<p><a href="/"><Icon name="seta-esquerda" size={12} /> {t('error.back')}</a></p>
</section>

<style>
	.erro {
		text-align: center;
		padding: var(--space-7) 0;
	}

	.codigo {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		color: var(--color-accent);
		margin: var(--space-5) 0 0;
	}

	a {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}
</style>
