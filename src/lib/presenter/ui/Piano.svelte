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
	const teclas = $derived(Array.from({ length: ate - de + 1 }, (_, i) => de + i));
	const brancas = $derived(teclas.filter((n) => !PRETAS.has(n % 12)));
	const largura = $derived(100 / brancas.length);
	const posicao = (n: number) => {
		const indiceBranca = brancas.filter((b) => b < n).length;
		return PRETAS.has(n % 12) ? indiceBranca * largura - largura * 0.3 : indiceBranca * largura;
	};
</script>

<div class="rolagem">
	<div class="piano" role="group" aria-label={t('tools.acordes.piano')}>
		{#each brancas as n (n)}
			<button
				type="button"
				tabindex="-1"
				class="tecla branca"
				class:acorde={acorde.has(n)}
				class:melodia={melodia.has(n)}
				style:left="{posicao(n)}%"
				style:width="{largura}%"
				aria-label={nomeMidi(n, false)}
				onpointerdown={() => onTocar?.(n)}
			>
				{#if n % 12 === 0}<span class="oitava">{nomeMidi(n, false)}</span>{/if}
			</button>
		{/each}
		{#each teclas.filter((n) => PRETAS.has(n % 12)) as n (n)}
			<button
				type="button"
				tabindex="-1"
				class="tecla preta"
				class:acorde={acorde.has(n)}
				class:melodia={melodia.has(n)}
				style:left="{posicao(n)}%"
				style:width="{largura * 0.6}%"
				aria-label={nomeMidi(n, false)}
				onpointerdown={() => onTocar?.(n)}
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

	.tecla {
		position: absolute;
		top: 0;
		margin: 0;
		padding: 0;
		border: 0;
		box-shadow: none;
		cursor: pointer;
		transition: background var(--duration);
	}

	.branca {
		height: 100%;
		background: var(--piano-tecla-branca);
		border-right: 1px solid var(--color-border);
		color: var(--piano-tecla-preta);
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.preta {
		z-index: 1;
		height: 62%;
		background: var(--piano-tecla-preta);
		border: 1px solid var(--color-border);
	}

	.oitava {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		padding-bottom: var(--space-1);
		pointer-events: none;
	}

	.tecla.acorde {
		background: var(--piano-acorde);
	}

	.tecla.melodia {
		background: var(--piano-melodia);
	}

	.tecla.acorde.melodia {
		background: linear-gradient(90deg, var(--piano-acorde) 50%, var(--piano-melodia) 50%);
	}

	.tecla:focus-visible {
		outline: var(--focus-width) solid var(--color-accent);
		outline-offset: -2px;
	}
</style>
