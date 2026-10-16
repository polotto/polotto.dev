<script lang="ts">
	import { processarJson, type Indentacao } from '$lib/domain/ferramentas/json';
	import { t } from '$lib/presenter/i18n/i18n';
	import BotaoCopiar from '$lib/presenter/ui/BotaoCopiar.svelte';
	import CabecalhoFerramenta from '$lib/presenter/ui/CabecalhoFerramenta.svelte';

	const INDENTACOES: Indentacao[] = [2, 4, 'tab'];
	const EXEMPLO = '{"site":"polotto.dev","ferramentas":["qrcode","cpf-cnpj","json"],"ativo":true,"versao":1.0}';

	let entrada = $state('');
	let indentacao = $state<Indentacao>(2);
	let ordenarChaves = $state(false);
	let saida = $state('');

	const validacao = $derived(entrada.trim() ? processarJson(entrada, { modo: 'minificar' }) : undefined);

	function aplicar(modo: 'formatar' | 'minificar') {
		const r = processarJson(entrada, { modo, indentacao, ordenarChaves });
		if (r.ok) saida = r.texto;
	}
</script>

<CabecalhoFerramenta slug="json" />

<section class="painel">
	<label class="campo">
		{t('tools.json.input')}
		<textarea rows="12" bind:value={entrada} spellcheck="false" autocapitalize="off"></textarea>
	</label>
	<p class="status" aria-live="polite">
		{#if validacao?.ok}
			<span class="ok">{t('tools.json.valid')}</span>
		{:else if validacao}
			<span class="erro">{t('tools.json.error', { line: validacao.linha, column: validacao.coluna })}</span>
			<span class="detalhe">{validacao.mensagem}</span>
		{/if}
	</p>
	<div class="campos">
		<label class="campo">
			{t('tools.json.indent')}
			<select bind:value={indentacao}>
				{#each INDENTACOES as i (i)}
					<option value={i}>{t(`tools.json.indent.${i}`)}</option>
				{/each}
			</select>
		</label>
		<label class="opcao"><input type="checkbox" bind:checked={ordenarChaves} /> {t('tools.json.sort')}</label>
	</div>
	<div class="acoes">
		<button type="button" disabled={!validacao?.ok} onclick={() => aplicar('formatar')}>{t('tools.json.format')}</button>
		<button type="button" class="secundario" disabled={!validacao?.ok} onclick={() => aplicar('minificar')}>{t('tools.json.minify')}</button>
		<button type="button" class="secundario" onclick={() => ((entrada = EXEMPLO), (saida = ''))}>{t('tools.json.example')}</button>
	</div>
</section>

{#if saida}
	<section class="painel">
		<label class="campo">
			{t('tools.json.output')}
			<textarea rows="16" readonly value={saida} spellcheck="false"></textarea>
		</label>
		<div class="acoes"><BotaoCopiar texto={saida} /></div>
	</section>
{/if}

<style>
	.status {
		min-height: calc(var(--text-md) * var(--leading-body));
		margin: var(--space-2) 0 var(--space-4);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-3);
	}

	.detalhe {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-muted);
		align-self: center;
	}
</style>
