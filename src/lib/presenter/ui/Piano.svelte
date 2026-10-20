<script lang="ts">
	import { nomeMidi } from '$lib/domain/ferramentas/acordes';
	import { t } from '$lib/presenter/i18n/i18n';

	let {
		acorde = new Set<number>(),
		melodia = new Set<number>(),
		onTocar,
		de = 36,
		ate = 83
	}: {
		acorde?: ReadonlySet<number>;
		melodia?: ReadonlySet<number>;
		onTocar?: (midi: number) => void;
		de?: number;
		ate?: number;
	} = $props();

	const PRETAS = new Set([1, 3, 6, 8, 10]);
	// Uma tecla de cada vez entra na ordem do Tab; as setas andam entre as teclas.
	let foco = $state(60);
	let piano: HTMLDivElement;

	function aoTeclar(e: KeyboardEvent, n: number) {
		const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!passo) return;
		e.preventDefault();
		const alvo = Math.min(Math.max(n + passo, de), ate);
		foco = alvo;
		piano.querySelector<HTMLButtonElement>(`[data-midi="${alvo}"]`)?.focus();
	}
	const teclas = $derived(Array.from({ length: ate - de + 1 }, (_, i) => de + i));
	const brancas = $derived(teclas.filter((n) => !PRETAS.has(n % 12)));
	const largura = $derived(100 / brancas.length);
	const posicao = (n: number) => {
		const indiceBranca = brancas.filter((b) => b < n).length;
		return PRETAS.has(n % 12) ? indiceBranca * largura - largura * 0.3 : indiceBranca * largura;
	};
</script>

<div class="rolagem">
	<div class="piano" bind:this={piano} role="group" aria-label={t('tools.acordes.piano')}>
		{#each brancas as n (n)}
			<button
				type="button"
				tabindex={foco === n ? 0 : -1}
				data-midi={n}
				onkeydown={(e) => aoTeclar(e, n)}
				onfocus={() => (foco = n)}
				class="tecla branca"
				class:acorde={acorde.has(n)}
				class:melodia={melodia.has(n)}
				style:left="{posicao(n)}%"
				style:width="{largura}%"
				aria-label={nomeMidi(n, false)}
				onclick={() => onTocar?.(n)}
			>
				{#if n % 12 === 0}<span class="oitava">{nomeMidi(n, false)}</span>{/if}
			</button>
		{/each}
		{#each teclas.filter((n) => PRETAS.has(n % 12)) as n (n)}
			<button
				type="button"
				tabindex={foco === n ? 0 : -1}
				data-midi={n}
				onkeydown={(e) => aoTeclar(e, n)}
				onfocus={() => (foco = n)}
				class="tecla preta"
				class:acorde={acorde.has(n)}
				class:melodia={melodia.has(n)}
				style:left="{posicao(n)}%"
				style:width="{largura * 0.6}%"
				aria-label={nomeMidi(n, false)}
				onclick={() => onTocar?.(n)}
			></button>
		{/each}
	</div>
</div>

<style>
	.rolagem {
		overflow-x: auto;
		padding-bottom: var(--space-2);
	}

	.piano {
		position: relative;
		min-width: var(--piano-largura-min);
		height: var(--piano-altura);
		border: var(--border-width) solid var(--color-border);
		background: var(--color-border);
		touch-action: manipulation;
	}

	.piano .tecla {
		position: absolute;
		top: 0;
		margin: 0;
		padding: 0;
		border: 0;
		box-shadow: none;
		cursor: pointer;
		transition: background var(--duration);
	}

	.piano .branca {
		height: 100%;
		background: var(--piano-tecla-branca);
		border-right: var(--border-width) solid var(--color-border);
		color: var(--piano-tecla-preta);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.piano .preta {
		z-index: 1;
		height: 62%;
		background: var(--piano-tecla-preta);
		border: var(--border-width) solid var(--color-border);
	}

	.piano .oitava {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		padding-bottom: var(--space-1);
		pointer-events: none;
	}

	.piano .tecla.acorde {
		background: var(--piano-acorde);
	}

	.piano .tecla.melodia {
		background: var(--piano-melodia);
	}

	.piano .tecla.acorde.melodia {
		background: linear-gradient(90deg, var(--piano-acorde) 50%, var(--piano-melodia) 50%);
	}

	.piano .tecla:focus-visible {
		outline: var(--focus-width) solid var(--color-accent);
		outline-offset: calc(-1 * var(--focus-width));
	}
</style>
