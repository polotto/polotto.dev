<script lang="ts">
	// Recebe HTML já renderizado no build a partir do markdown do vault
	// (conteúdo do próprio autor, nunca de terceiros).
	let { html }: { html: string } = $props();
</script>

<div class="corpo">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>

<style>
	.corpo {
		max-width: var(--measure);
	}

	.corpo :global(h2) {
		margin-top: var(--space-7);
	}

	.corpo :global(h3) {
		font-size: var(--text-md);
		margin-top: var(--space-6);
	}

	.corpo :global(p),
	.corpo :global(ul),
	.corpo :global(ol) {
		margin: 0 0 var(--space-5);
	}

	.corpo :global(li + li) {
		margin-top: var(--space-2);
	}

	.corpo :global(li::marker) {
		color: var(--color-accent);
	}

	.corpo :global(blockquote) {
		margin: 0 0 var(--space-5);
		padding: var(--space-3) var(--space-5);
		border-left: var(--frame-width) solid var(--color-accent);
		background: var(--color-surface);
		color: var(--color-muted);
	}

	.corpo :global(blockquote > :last-child) {
		margin-bottom: 0;
	}

	.corpo :global(code) {
		font-family: var(--font-mono);
		font-size: 0.9em;
		background: var(--color-surface-2);
		padding: 0.1em 0.35em;
	}

	.corpo :global(pre) {
		margin: 0 0 var(--space-5);
		padding: var(--space-4) var(--space-5);
		overflow-x: auto;
		background: var(--color-code-bg);
		color: var(--color-code-text);
		border: var(--frame-width) solid var(--color-border);
		box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--color-shadow);
		font-size: var(--text-sm);
		line-height: 1.6;
	}

	/* o Shiki põe o fundo do tema inline; vale o token */
	.corpo :global(pre.shiki) {
		background-color: var(--color-code-bg) !important;
	}

	.corpo :global(pre code) {
		background: none;
		padding: 0;
		color: inherit;
	}

	.corpo :global(img) {
		border: var(--frame-width) solid var(--color-border);
	}
</style>
