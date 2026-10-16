<script lang="ts">
	import { onMount } from 'svelte';
	import { formatar, gerar, validar, type TipoDocumento } from '$lib/domain/ferramentas/documentos';
	import { t } from '$lib/presenter/i18n/i18n';
	import BotaoCopiar from '$lib/presenter/ui/BotaoCopiar.svelte';
	import CabecalhoFerramenta from '$lib/presenter/ui/CabecalhoFerramenta.svelte';

	let tipo = $state<TipoDocumento>('cpf');
	let alfanumerico = $state(false);
	let mascara = $state(true);
	let quantidade = $state(1);
	let gerados = $state<string[]>([]);

	let entrada = $state('');
	const validacao = $derived(validar(entrada));

	const exibidos = $derived(gerados.map((d) => (mascara ? formatar(d.length === 11 ? 'cpf' : 'cnpj', d) : d)));

	function gerarLista() {
		const n = Math.max(1, Math.min(50, Math.floor(quantidade) || 1));
		gerados = Array.from({ length: n }, () => gerar({ tipo, alfanumerico: tipo === 'cnpj' && alfanumerico }));
	}

	// Sorteio só no navegador: no build, a página sai sem número.
	onMount(gerarLista);
</script>

<CabecalhoFerramenta slug="cpf-cnpj" />

<div class="grade">
	<section class="painel" aria-labelledby="gerar">
		<h2 id="gerar">{t('tools.cpf-cnpj.generate')}</h2>
		<fieldset class="campos">
			<legend class="visually-hidden">{t('tools.cpf-cnpj.type')}</legend>
			<label class="opcao"><input type="radio" value="cpf" bind:group={tipo} onchange={gerarLista} /> {t('tools.cpf-cnpj.cpf')}</label>
			<label class="opcao"><input type="radio" value="cnpj" bind:group={tipo} onchange={gerarLista} /> {t('tools.cpf-cnpj.cnpj')}</label>
			{#if tipo === 'cnpj'}
				<label class="opcao"><input type="checkbox" bind:checked={alfanumerico} onchange={gerarLista} /> {t('tools.cpf-cnpj.alphanumeric')}</label>
			{/if}
		</fieldset>
		<div class="campos">
			<label class="opcao"><input type="checkbox" bind:checked={mascara} /> {t('tools.cpf-cnpj.mask')}</label>
			<label class="campo">
				{t('tools.cpf-cnpj.amount')}
				<input type="number" min="1" max="50" bind:value={quantidade} />
			</label>
			<button type="button" onclick={gerarLista}>{t('tools.cpf-cnpj.generateButton')}</button>
		</div>
		{#if exibidos.length}
			<ul class="gerados">
				{#each exibidos as doc, i (i)}
					<li><code>{doc}</code> <BotaoCopiar texto={doc} /></li>
				{/each}
			</ul>
			{#if exibidos.length > 1}
				<div class="acoes"><BotaoCopiar texto={exibidos.join('\n')} rotulo={t('tools.cpf-cnpj.copyAll')} /></div>
			{/if}
		{/if}
		<p class="dica">{t('tools.cpf-cnpj.testOnly')}</p>
	</section>

	<section class="painel" aria-labelledby="validar">
		<h2 id="validar">{t('tools.cpf-cnpj.validate')}</h2>
		<label class="campo">
			{t('tools.cpf-cnpj.input')}
			<input type="text" bind:value={entrada} autocomplete="off" spellcheck="false" />
		</label>
		<p class="resultado" aria-live="polite">
			{#if validacao.valido}
				<span class="ok">{t('tools.cpf-cnpj.valid', { type: t(`tools.cpf-cnpj.${validacao.tipo}`), value: validacao.formatado })}</span>
			{:else if entrada}
				<span class="erro">{t(`tools.cpf-cnpj.invalid.${validacao.motivo}`)}</span>
			{/if}
		</p>
		<p class="dica">{t('tools.cpf-cnpj.alphanumericHint')}</p>
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
		margin: 0 0 var(--space-4);
	}

	.gerados {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.gerados li {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		justify-content: space-between;
	}

	code {
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	.resultado {
		min-height: calc(var(--text-md) * var(--leading-body));
		margin: var(--space-3) 0 0;
	}
</style>
