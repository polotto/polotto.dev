<script lang="ts">
	import type { Artigo } from '$lib/domain/models';
	import { formatDate, t } from '$lib/presenter/i18n/i18n';

	let {
		artigo,
		minutos,
		nomeSerie
	}: { artigo: Artigo; minutos: number; nomeSerie?: string } = $props();
</script>

<article class="cartao">
	<p class="meta">
		<time datetime={artigo.publicado}>{formatDate(artigo.publicado)}</time>
		<span aria-hidden="true">·</span>
		<span>{t('article.readingTime', { count: minutos })}</span>
	</p>
	<h3><a href={`/artigos/${artigo.slug}`}>{artigo.titulo}</a></h3>
	<p class="descricao">{artigo.descricao}</p>
	{#if artigo.serie && nomeSerie}
		<p class="serie">{t('article.partOf', { order: artigo.serie.ordem, series: nomeSerie })}</p>
	{/if}
</article>

<style>
	.cartao {
		position: relative;
		padding: var(--space-5);
		background: var(--color-surface);
		border: var(--frame-width) solid var(--color-border);
		box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--color-shadow);
		transition: transform var(--duration) steps(2), box-shadow var(--duration) steps(2);
	}

	.cartao:hover {
		transform: translate(-2px, -2px);
		box-shadow: calc(var(--shadow-offset) + 2px) calc(var(--shadow-offset) + 2px) 0
			var(--color-shadow);
	}

	h3 {
		font-size: var(--display-h2);
		margin: var(--space-2) 0;
	}

	h3 a {
		color: var(--color-text);
		text-decoration: none;
	}

	/* o cartão inteiro é clicável sem aninhar link */
	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.meta,
	.serie {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-muted);
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.serie {
		margin-top: var(--space-3);
		color: var(--color-accent);
		font-family: var(--font-mono);
	}

	.descricao {
		margin: 0;
	}
</style>
