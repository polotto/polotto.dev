<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { serializarJsonLd } from '$lib/presenter/seo';
	import { urlAbsoluta } from '$lib/presenter/site';

	let {
		titulo,
		descricao,
		caminho,
		tipo = 'website',
		jsonLd = [],
		publicado,
		atualizado,
		idioma,
		traducao,
		semIndice = false
	}: {
		titulo?: string;
		descricao: string;
		caminho: string;
		tipo?: 'website' | 'article';
		jsonLd?: Record<string, unknown>[];
		publicado?: string;
		atualizado?: string;
		/** Código do idioma do texto (`en`), quando não é pt-BR. */
		idioma?: string;
		/** Caminho da mesma página na outra língua. */
		traducao?: string;
		semIndice?: boolean;
	} = $props();

	const tituloCompleto = $derived(titulo ? `${titulo} · ${t('site.name')}` : t('site.name'));
	const url = $derived(urlAbsoluta(caminho));
	const imagem = urlAbsoluta('/og.png');
</script>

<svelte:head>
	<title>{tituloCompleto}</title>
	<meta name="description" content={descricao} />
	<link rel="canonical" href={url} />
	{#if traducao}
		<link rel="alternate" hreflang={idioma ?? 'pt-BR'} href={url} />
		<link rel="alternate" hreflang={idioma === 'en' ? 'pt-BR' : 'en'} href={urlAbsoluta(traducao)} />
	{/if}
	{#if semIndice}<meta name="robots" content="noindex" />{/if}
	<meta property="og:site_name" content={t('site.name')} />
	<meta property="og:locale" content={idioma === 'en' ? 'en_US' : 'pt_BR'} />
	<meta property="og:type" content={tipo} />
	<meta property="og:title" content={titulo ?? t('site.name')} />
	<meta property="og:description" content={descricao} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={imagem} />
	<meta name="twitter:card" content="summary_large_image" />
	{#if publicado}<meta property="article:published_time" content={publicado} />{/if}
	{#if atualizado}<meta property="article:modified_time" content={atualizado} />{/if}
	{#if jsonLd.length}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<script type="application/ld+json">${serializarJsonLd(jsonLd)}</` + `script>`}
	{/if}
</svelte:head>
