<script lang="ts">
	import {
		contraste,
		corAleatoria,
		cssDosPapeis,
		sugerirPapeis,
		type Modo,
		corDoTexto,
		cssVariables,
		gerarPaleta,
		HARMONIAS,
		normalizarHex,
		type Harmonia
	} from '$lib/domain/ferramentas/paleta';
	import {
		buscarFonte,
		CATEGORIAS,
		combinar,
		cssDasFontes,
		FONTES,
		pilhaCss,
		sortearPar,
		urlGoogleFonts
	} from '$lib/domain/ferramentas/fontes';
	import { copiar } from '$lib/presenter/baixar';
	import { t } from '$lib/presenter/i18n/i18n';
	import BotaoCopiar from '$lib/presenter/ui/BotaoCopiar.svelte';
	import CabecalhoFerramenta from '$lib/presenter/ui/CabecalhoFerramenta.svelte';

	let base = $state('#5b3cc4');
	let hex = $state('#5b3cc4');
	let harmonia = $state<Harmonia>('complementar');
	let copiada = $state('');

	const hexValido = $derived(normalizarHex(hex));
	const cores = $derived(gerarPaleta(base, harmonia));
	const css = $derived(cssVariables(cores));

	const MODOS: Modo[] = ['claro', 'escuro'];
	let modo = $state<Modo>('claro');
	const papeis = $derived(sugerirPapeis(cores, base, modo));
	const cor = $derived(Object.fromEntries(papeis.map((p) => [p.papel, p.cor])) as Record<string, string>);
	const cssPapeis = $derived(cssDosPapeis(papeis));

	let fonteTitulo = $state('Playfair Display');
	let fonteTexto = $state('Inter');
	const titulo = $derived(buscarFonte(fonteTitulo)!);
	const corpo = $derived(buscarFonte(fonteTexto)!);
	const urlFontes = $derived(urlGoogleFonts([titulo, corpo]));
	const combinacao = $derived(combinar(titulo, corpo));
	const cssFontes = $derived(cssDasFontes(titulo, corpo));

	function fontesAleatorias() {
		[fonteTitulo, fonteTexto] = sortearPar([fonteTitulo, fonteTexto]).map((f) => f.nome);
	}

	function definir(cor: string) {
		base = cor;
		hex = cor;
	}

	function aoDigitar() {
		if (hexValido) base = hexValido;
	}

	async function copiarCor(cor: string) {
		if (!(await copiar(cor))) return;
		copiada = cor;
		setTimeout(() => (copiada = copiada === cor ? '' : copiada), 1500);
	}
</script>

<svelte:head>
	<link rel="stylesheet" href={urlFontes} />
</svelte:head>

{#snippet seletorFonte(rotulo: string, valor: string, mudar: (v: string) => void)}
	<div class="campo largo">
		<label for={rotulo}>{t(rotulo)}</label>
		<div class="linha-fonte">
			<select id={rotulo} value={valor} onchange={(e) => mudar(e.currentTarget.value)}>
				{#each CATEGORIAS as c (c)}
					<optgroup label={t(`tools.paleta.categoria.${c}`)}>
						{#each FONTES.filter((f) => f.categoria === c) as f (f.nome)}
							<option value={f.nome}>{f.nome}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
			<BotaoCopiar texto={pilhaCss(buscarFonte(valor)!)} rotulo={t('tools.paleta.copyFont')} />
		</div>
	</div>
{/snippet}

<CabecalhoFerramenta slug="paleta" />
<p class="aviso-fontes">{t('tools.paleta.fontsPrivacy')}</p>

<section class="painel">
	<div class="campos">
		<label class="campo">
			{t('tools.paleta.base')}
			<input type="color" value={base} oninput={(e) => definir(e.currentTarget.value)} />
		</label>
		<label class="campo">
			{t('tools.paleta.hex')}
			<input type="text" bind:value={hex} oninput={aoDigitar} size="9" spellcheck="false" aria-invalid={!hexValido} />
		</label>
		<label class="campo">
			{t('tools.paleta.harmony')}
			<select bind:value={harmonia}>
				{#each HARMONIAS as h (h)}
					<option value={h}>{t(`tools.paleta.harmonia.${h}`)}</option>
				{/each}
			</select>
		</label>
		<button type="button" class="secundario" onclick={() => definir(corAleatoria())}>{t('tools.paleta.random')}</button>
	</div>
	{#if !hexValido}<p class="erro">{t('tools.paleta.invalidHex')}</p>{/if}

	<ul class="cores">
		{#each cores as cor, i (`${i}-${cor}`)}
			{@const texto = corDoTexto(cor)}
			<li>
				<button
					type="button"
					class="cor"
					style:background={cor}
					style:color={texto}
					onclick={() => copiarCor(cor)}
					aria-label={t('tools.paleta.copyColor', { color: cor })}
				>
					<span class="hex">{copiada === cor ? t('tools.copied') : cor}</span>
					<span class="contraste">{t('tools.paleta.contrast', { ratio: contraste(cor, texto).toFixed(1) })}</span>
				</button>
			</li>
		{/each}
	</ul>
</section>

<section class="painel" aria-labelledby="papeis">
	<h2 id="papeis">{t('tools.paleta.roles')}</h2>
	<fieldset class="campos">
		<legend class="visually-hidden">{t('tools.paleta.mode')}</legend>
		{#each MODOS as m (m)}
			<label class="opcao"><input type="radio" value={m} bind:group={modo} /> {t(`tools.paleta.modo.${m}`)}</label>
		{/each}
	</fieldset>

	<div class="papeis">
		<ul class="lista-papeis">
			{#each papeis as p (p.papel)}
				<li>
					<button
						type="button"
						class="amostra"
						style:background={p.cor}
						onclick={() => copiarCor(p.cor)}
						aria-label={t('tools.paleta.copyColor', { color: p.cor })}
					></button>
					<div>
						<p class="nome">
							{t(`tools.paleta.papel.${p.papel}`)}
							<code>{copiada === p.cor ? t('tools.copied') : p.cor}</code>
							{#if p.contraste !== undefined}
								<span class="aa">{t('tools.paleta.aa', { ratio: p.contraste.toFixed(1) })}</span>
							{/if}
						</p>
						<p class="uso">{t(`tools.paleta.papel.${p.papel}.uso`)}</p>
					</div>
				</li>
			{/each}
		</ul>

		<div class="lado-previa">
		<div class="campos">
			{@render seletorFonte('tools.paleta.fontTitle', fonteTitulo, (v) => (fonteTitulo = v))}
			{@render seletorFonte('tools.paleta.fontBody', fonteTexto, (v) => (fonteTexto = v))}
		</div>
		<div class="acoes fontes-acoes">
			<button type="button" class="secundario" onclick={fontesAleatorias}>{t('tools.paleta.fontRandom')}</button>
		</div>
		<p class={combinacao.combina ? 'ok regra' : 'erro regra'} aria-live="polite">{t(`tools.paleta.regra.${combinacao.regra}`)}</p>
		<!-- Prévia com as cores e fontes sugeridas: estilo inline porque são dado. -->
		<div
			class="previa"
			style:background={cor.fundo}
			style:color={cor.texto}
			style:font-family={pilhaCss(corpo)}
			aria-label={t('tools.paleta.preview')}
			role="img"
		>
			<div class="previa-card" style:background={cor.superficie} style:border-color={cor.borda}>
				<p class="previa-titulo" style:font-family={pilhaCss(titulo)}>{t('tools.paleta.preview.title')}</p>
				<p class="previa-meta" style:color={cor['texto-secundario']}>{t('tools.paleta.preview.meta')}</p>
				<p class="previa-texto">
					{t('tools.paleta.preview.before')}<span class="previa-link" style:color={cor.destaque}>{t('tools.paleta.preview.link')}</span>{t('tools.paleta.preview.after')}
				</p>
				<span class="previa-campo" style:background={cor.fundo} style:border-color={cor.borda} style:color={cor['texto-secundario']}>
					{t('tools.paleta.preview.input')}
				</span>
				<span class="previa-botoes">
					<span class="previa-botao" style:background={cor.primaria} style:color={cor['texto-primaria']}>{t('tools.paleta.preview.primary')}</span>
					<span class="previa-botao" style:border-color={cor.destaque} style:color={cor.destaque}>{t('tools.paleta.preview.secondary')}</span>
				</span>
			</div>
		</div>
		<p class="dica">{t('tools.paleta.fontHint')}</p>
		<label class="campo css-fontes">
			{t('tools.paleta.fontsCss')}
			<textarea rows="17" readonly value={cssFontes} spellcheck="false"></textarea>
		</label>
		<div class="acoes"><BotaoCopiar texto={cssFontes} /></div>
		</div>
	</div>
	<p class="dica">{t('tools.paleta.rolesHint')}</p>
	<label class="campo css-papeis">
		{t('tools.paleta.rolesCss')}
		<textarea rows={papeis.length + 2} readonly value={cssPapeis} spellcheck="false"></textarea>
	</label>
	<div class="acoes"><BotaoCopiar texto={cssPapeis} /></div>
</section>

<section class="painel">
	<label class="campo">
		{t('tools.paleta.css')}
		<textarea rows={cores.length + 2} readonly value={css} spellcheck="false"></textarea>
	</label>
	<div class="acoes"><BotaoCopiar texto={css} /></div>
</section>

<style>
	input[type='color'] {
		width: var(--space-8);
		height: calc(var(--space-7) - var(--space-1));
		padding: var(--space-1);
		background: var(--color-bg);
		border: var(--frame-width) solid var(--color-border);
		cursor: pointer;
	}

	.cores {
		list-style: none;
		padding: 0;
		margin: var(--space-5) 0 0;
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fit, minmax(calc(var(--card-min) / 2), 1fr));
	}

	/* o botão da cor não segue o botão padrão: fundo é a própria cor */
	.cores .cor {
		width: 100%;
		min-height: var(--space-9);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: flex-start;
		gap: var(--space-1);
		padding: var(--space-3);
		text-align: left;
	}

	fieldset {
		border: 0;
		padding: 0;
		margin: 0 0 var(--space-4);
	}

	.papeis {
		display: grid;
		gap: var(--space-5);
		grid-template-columns: repeat(auto-fit, minmax(var(--column-min), 1fr));
		align-items: start;
	}

	.lista-papeis {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.lista-papeis li {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.lista-papeis .amostra {
		flex-shrink: 0;
		width: var(--space-7);
		height: var(--space-7);
		padding: 0;
	}

	.nome,
	.uso {
		margin: 0;
	}

	.nome {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-2);
		align-items: baseline;
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.nome code {
		font-family: var(--font-mono);
		font-weight: 400;
		color: var(--color-muted);
	}

	.aa {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 400;
		color: var(--color-ok);
	}

	.uso {
		font-size: var(--text-xs);
		color: var(--color-muted);
	}

	.previa {
		padding: var(--space-5);
		border: var(--frame-width) solid var(--color-border);
	}

	.previa-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		border: var(--border-width) solid;
	}

	.previa-card p {
		margin: 0;
	}

	.previa-titulo {
		font-size: var(--text-lg);
		font-weight: 700;
		line-height: var(--leading-tight);
	}

	.previa-meta {
		font-size: var(--text-xs);
	}

	.previa-texto {
		font-size: var(--text-sm);
	}

	.previa-link {
		text-decoration: underline;
	}

	.previa-campo {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		border: var(--border-width) solid;
	}

	.previa-botoes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.previa-botao {
		padding: var(--space-2) var(--space-4);
		font-weight: 700;
		font-size: var(--text-sm);
		border: var(--border-width) solid transparent;
	}

	.linha-fonte {
		display: flex;
		gap: var(--space-2);
	}

	.linha-fonte select {
		flex: 1;
	}

	.fontes-acoes {
		margin-bottom: var(--space-2);
	}

	.regra {
		font-size: var(--text-sm);
		margin: 0 0 var(--space-4);
	}

	.css-fontes {
		margin-top: var(--space-4);
	}

	.css-papeis {
		margin-top: var(--space-4);
	}

	.hex {
		font-size: var(--text-md);
		font-weight: 600;
	}

	.contraste {
		font-size: var(--text-xs);
	}

	.aviso-fontes {
		font-size: var(--text-sm);
		color: var(--color-muted);
		margin: calc(-1 * var(--space-4)) 0 var(--space-5);
	}
</style>
