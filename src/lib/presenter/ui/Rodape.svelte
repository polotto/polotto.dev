<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import Icon from './Icon.svelte';

	const ano = new Date().getFullYear();
</script>

<footer class="rodape">
	<div class="wrap">
		<span>{t('footer.copyright', { year: ano })}</span>
		<a href="/rss.xml"><Icon name="rss" size={14} /> {t('footer.rss')}</a>
	</div>
	<div class="faixa" aria-hidden="true">
		<span></span><span></span><span></span><span></span>
	</div>
</footer>

<style>
	.rodape {
		margin-top: var(--space-9);
		border-top: var(--frame-width) solid var(--color-border);
		background: var(--color-surface);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.wrap {
		max-width: var(--page-width);
		margin: 0 auto;
		padding: var(--space-5) var(--space-4);
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	a {
		color: var(--color-muted);
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.faixa {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		height: var(--space-1);
	}

	.faixa span:nth-child(1) {
		background: var(--snes-red);
	}
	.faixa span:nth-child(2) {
		background: var(--snes-yellow);
	}
	.faixa span:nth-child(3) {
		background: var(--snes-green);
	}
	.faixa span:nth-child(4) {
		background: var(--snes-blue);
	}
</style>
