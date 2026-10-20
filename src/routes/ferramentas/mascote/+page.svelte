<script lang="ts">
	import {
		alturaPara,
		desenhoParaSvg,
		gerarMascote,
		textoAleatorio,
		type Estilo
	} from '$lib/domain/ferramentas/gerador-mascote';
	import { baixarPng, baixarSvg } from '$lib/presenter/baixar';
	import { t } from '$lib/presenter/i18n/i18n';
	import CabecalhoFerramenta from '$lib/presenter/ui/CabecalhoFerramenta.svelte';

	const ESTILOS: Estilo[] = ['personagem', 'identicon'];
	// Largura do arquivo: 420 px é o tamanho do identicon do GitHub.
	const LARGURA = 420;

	let texto = $state('polotto');
	let estilo = $state<Estilo>('personagem');

	const desenho = $derived(gerarMascote(texto, estilo));
	const previa = $derived(desenhoParaSvg(desenho, 240));
	const nome = $derived(`mascote-${(texto || 'vazio').replace(/[^\w-]+/g, '-').slice(0, 40)}`);

	let baixou = $state(true);

	async function baixarImagem() {
		baixou = await baixarPng(`${nome}.png`, desenhoParaSvg(desenho, LARGURA), LARGURA, alturaPara(desenho, LARGURA));
	}
</script>

<CabecalhoFerramenta slug="mascote" />

<div class="grade">
	<section class="painel">
		<label class="campo">
			{t('tools.mascote.text')}
			<input type="text" bind:value={texto} autocomplete="off" spellcheck="false" />
		</label>
		<fieldset class="campos">
			<legend class="campo">{t('tools.mascote.style')}</legend>
			{#each ESTILOS as e (e)}
				<label class="opcao"><input type="radio" value={e} bind:group={estilo} /> {t(`tools.mascote.estilo.${e}`)}</label>
			{/each}
		</fieldset>
		<div class="acoes">
			<button type="button" class="secundario" onclick={() => (texto = textoAleatorio())}>{t('tools.mascote.random')}</button>
		</div>
		<p class="dica">{t('tools.mascote.hint')}</p>
	</section>

	<section class="painel resultado">
		<div class="previa" role="img" aria-label={t('tools.mascote.alt', { text: texto })}>
			{@html previa}
		</div>
		<div class="acoes">
			<button type="button" onclick={baixarImagem}>{t('tools.downloadPng')}</button>
			<button type="button" class="secundario" onclick={() => baixarSvg(`${nome}.svg`, desenhoParaSvg(desenho, LARGURA))}>
				{t('tools.downloadSvg')}
			</button>
		</div>
		{#if !baixou}<p class="erro">{t('tools.downloadFailed')}</p>{/if}
	</section>
</div>

<style>
	.grade {
		display: grid;
		gap: var(--space-5);
		grid-template-columns: repeat(auto-fit, minmax(var(--column-min), 1fr));
		align-items: start;
	}

	fieldset {
		border: 0;
		padding: 0;
		margin: var(--space-4) 0;
	}

	legend {
		width: 100%;
		margin-bottom: var(--space-2);
	}

	.resultado {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.previa {
		background: var(--color-bg);
		border: var(--frame-width) solid var(--color-border);
		padding: var(--space-4);
	}

	.previa :global(svg) {
		display: block;
		width: var(--card-min);
		max-width: 100%;
		height: auto;
	}
</style>
