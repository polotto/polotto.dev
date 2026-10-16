<script lang="ts">
	import type { Projeto } from '$lib/domain/models';
	import { t } from '$lib/presenter/i18n/i18n';
	import Icon from './Icon.svelte';

	let { projeto }: { projeto: Projeto } = $props();

	const link = $derived(projeto.links.site ?? projeto.links.loja ?? projeto.links.repo);
</script>

<article class="cartao">
	<p class={`situacao ${projeto.situacao}`}>
		<span class="led" aria-hidden="true"></span>
		{t(`project.status.${projeto.situacao}`)}
	</p>
	<h3>
		{#if link}
			<a href={link} target="_blank" rel="noopener noreferrer">{projeto.nome} <Icon name="externo" size={12} /></a>
		{:else}
			{projeto.nome}
		{/if}
	</h3>
	<p class="descricao">{projeto.descricao}</p>
</article>

<style>
	.cartao {
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: var(--frame-width) solid var(--color-border);
	}

	h3 {
		font-size: var(--text-md);
		margin: var(--space-2) 0;
	}

	h3 a {
		color: var(--color-text);
		text-decoration: none;
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	h3 a:hover {
		color: var(--color-link);
	}

	.descricao {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.situacao {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		text-transform: uppercase;
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.led {
		width: var(--space-2);
		height: var(--space-2);
		background: currentColor;
	}

	.ativo {
		color: var(--color-ok);
	}
	.pausado {
		color: var(--color-paused);
	}
	.encerrado {
		color: var(--color-ended);
	}
</style>
