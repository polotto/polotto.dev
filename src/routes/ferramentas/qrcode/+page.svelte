<script lang="ts">
	import { desenhoParaSvg } from '$lib/domain/ferramentas/gerador-mascote';
	import { geradorQrCode } from '$lib/app/ferramentas';
	import { NIVEIS, type NivelCorrecao } from '$lib/domain/ferramentas/qrcode';
	import { baixarPng, baixarSvg, colar, copiarPng } from '$lib/presenter/baixar';
	import { t } from '$lib/presenter/i18n/i18n';
	import CabecalhoFerramenta from '$lib/presenter/ui/CabecalhoFerramenta.svelte';

	const TAMANHOS = [256, 512, 1024, 2048];

	let texto = $state('https://polotto.dev');
	let nivel = $state<NivelCorrecao>('M');
	let tamanho = $state(1024);
	let campo: HTMLTextAreaElement;

	// Colar troca o texto inteiro. Se o navegador negar a leitura, deixa o
	// campo focado e selecionado para o Cmd+V substituir.
	async function aoColar() {
		const colado = await colar();
		if (colado !== undefined) texto = colado;
		else campo.select();
	}

	let copia = $state<'' | 'ok' | 'falhou'>('');
	let timerCopia: ReturnType<typeof setTimeout>;

	async function copiarImagem() {
		if (!desenho) return;
		copia = (await copiarPng(desenhoParaSvg(desenho, tamanho), tamanho, tamanho)) ? 'ok' : 'falhou';
		clearTimeout(timerCopia);
		timerCopia = setTimeout(() => (copia = ''), 2500);
	}

	function limpar() {
		texto = '';
		campo.focus();
	}

	const desenho = $derived(texto ? geradorQrCode.gerar(texto, nivel) : undefined);
	const previa = $derived(desenho && desenhoParaSvg(desenho, 256));
</script>

<CabecalhoFerramenta slug="qrcode" />

<div class="grade">
	<section class="painel">
		<label class="campo">
			{t('tools.qrcode.text')}
			<textarea rows="5" bind:this={campo} bind:value={texto} placeholder={t('tools.qrcode.placeholder')} spellcheck="false"></textarea>
		</label>
		<div class="acoes colar">
			<button type="button" class="secundario" onclick={aoColar}>{t('tools.paste')}</button>
			<button type="button" class="secundario" onclick={limpar} disabled={!texto}>{t('tools.clear')}</button>
		</div>
		<div class="campos">
			<label class="campo">
				{t('tools.qrcode.level')}
				<select bind:value={nivel}>
					{#each NIVEIS as n (n)}
						<option value={n}>{t(`tools.qrcode.level.${n}`)}</option>
					{/each}
				</select>
			</label>
			<label class="campo">
				{t('tools.qrcode.size')}
				<select bind:value={tamanho}>
					{#each TAMANHOS as px (px)}
						<option value={px}>{px} px</option>
					{/each}
				</select>
			</label>
		</div>
		<p class="dica">{t('tools.qrcode.levelHint')}</p>
	</section>

	<section class="painel resultado" aria-live="polite">
		{#if !texto}
			<p class="dica">{t('tools.qrcode.empty')}</p>
		{:else if !desenho || !previa}
			<p class="erro">{t('tools.qrcode.tooLong')}</p>
		{:else}
			<div class="previa" role="img" aria-label={t('tools.qrcode.alt')}>
				{@html previa}
			</div>
			<div class="acoes">
				<button type="button" onclick={copiarImagem} aria-live="polite">
					{copia === 'ok' ? t('tools.copied') : t('tools.copyImage')}
				</button>
				<button type="button" class="secundario" onclick={() => baixarPng('qrcode.png', desenhoParaSvg(desenho, tamanho), tamanho, tamanho)}>
					{t('tools.downloadPng')}
				</button>
				<button type="button" class="secundario" onclick={() => baixarSvg('qrcode.svg', desenhoParaSvg(desenho, tamanho))}>
					{t('tools.downloadSvg')}
				</button>
			</div>
			{#if copia === 'falhou'}<p class="erro">{t('tools.copyImageFailed')}</p>{/if}
		{/if}
	</section>
</div>

<style>
	.grade {
		display: grid;
		gap: var(--space-5);
		grid-template-columns: repeat(auto-fit, minmax(var(--column-min), 1fr));
		align-items: start;
	}

	.colar {
		margin-bottom: var(--space-4);
	}

	.resultado {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.previa :global(svg) {
		display: block;
		width: 100%;
		max-width: var(--column-min);
		height: auto;
	}
</style>
