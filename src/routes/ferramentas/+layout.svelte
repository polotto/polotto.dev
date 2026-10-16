<script lang="ts">
	let { children } = $props();
</script>

<!-- Estilos comuns aos formulários de todas as ferramentas. -->
<div class="ferramentas">
	{@render children()}
</div>

<style>
	.ferramentas :global(.painel) {
		padding: var(--space-5);
		margin-bottom: var(--space-5);
		background: var(--color-surface);
		border: var(--frame-width) solid var(--color-border);
	}

	.ferramentas :global(.painel h2) {
		font-size: var(--text-md);
		margin: 0 0 var(--space-4);
	}

	.ferramentas :global(.campos) {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: flex-end;
		margin-bottom: var(--space-4);
	}

	.ferramentas :global(.campo) {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.ferramentas :global(.campo.largo) {
		flex: 1 1 var(--input-min);
	}

	.ferramentas :global(.opcao) {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.ferramentas :global(input[type='text']),
	.ferramentas :global(input[type='number']),
	.ferramentas :global(select),
	.ferramentas :global(textarea) {
		min-width: 0;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-size: var(--text-md);
		color: var(--color-text);
		background: var(--color-bg);
		border: var(--frame-width) solid var(--color-border);
		border-radius: var(--radius);
	}

	.ferramentas :global(textarea) {
		width: 100%;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
		resize: vertical;
		tab-size: 2;
	}

	.ferramentas :global(input:focus),
	.ferramentas :global(select:focus),
	.ferramentas :global(textarea:focus) {
		outline: none;
		border-color: var(--color-accent);
	}

	.ferramentas :global(input[type='checkbox']),
	.ferramentas :global(input[type='radio']) {
		accent-color: var(--color-accent);
		width: var(--space-4);
		height: var(--space-4);
	}

	.ferramentas :global(.acoes) {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.ferramentas :global(.campo + .acoes) {
		margin-top: var(--space-4);
	}

	.ferramentas :global(button) {
		padding: var(--space-2) var(--space-4);
		font: inherit;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-accent-text);
		background: var(--color-accent);
		border: var(--frame-width) solid var(--color-border);
		box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--color-shadow);
		cursor: pointer;
	}

	.ferramentas :global(button:active:not(:disabled)) {
		transform: translate(var(--shadow-offset), var(--shadow-offset));
		box-shadow: none;
	}

	.ferramentas :global(button.secundario) {
		color: var(--color-text);
		background: var(--color-surface-2);
	}

	.ferramentas :global(button:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ferramentas :global(.dica) {
		font-size: var(--text-sm);
		color: var(--color-muted);
		margin: var(--space-3) 0 0;
	}

	.ferramentas :global(.ok) {
		color: var(--color-ok);
	}

	.ferramentas :global(.erro) {
		color: var(--snes-red);
	}
</style>
