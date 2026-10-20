<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import {
		cifra,
		cifraEmTexto,
		criarAleatorio,
		nomeMidi,
		nomeNota,
		nomeTonalidade,
		sortearProgressao,
		usaBemol,
		type Modo,
		type Progressao
	} from '$lib/domain/ferramentas/acordes';
	import { codificar, decodificar, BPM_MAX, BPM_MIN, type Configuracao } from '$lib/domain/ferramentas/compartilhar';
	import { gerarMelodia } from '$lib/domain/ferramentas/melodia';
	import { gerarMidi } from '$lib/domain/ferramentas/midi';
	import { reharmonizar, TECNICAS, type TecnicaId } from '$lib/domain/ferramentas/reharmonizacao';
	import { voicings } from '$lib/domain/ferramentas/voicing';
	import { baixar } from '$lib/presenter/baixar';
	import { t } from '$lib/presenter/i18n/i18n';
	import { PianoSintetico } from '$lib/presenter/piano-audio';
	import BotaoCopiar from '$lib/presenter/ui/BotaoCopiar.svelte';
	import CabecalhoFerramenta from '$lib/presenter/ui/CabecalhoFerramenta.svelte';
	import Piano from '$lib/presenter/ui/Piano.svelte';

	type Baixo = Configuracao['baixo'];
	type Versao = Configuracao['versao'];

	const TECNICAS_LIVRES = TECNICAS.filter((x) => x !== 'baixo-descendente' && x !== 'pedal');
	const BAIXOS: Baixo[] = ['nenhum', 'baixo-descendente', 'pedal'];
	const NOTAS = Array.from({ length: 12 }, (_, i) => i);
	// Sementes fixas na primeira tela: a página é pré-renderizada e não pode sortear.
	const SEMENTE_INICIAL = 7;

	const piano = new PianoSintetico();

	let sementeProgressao = $state(SEMENTE_INICIAL);
	let sementeReharmonizacao = $state(1);
	let sementeMelodia = $state(3);
	let modo = $state<Modo | 'qualquer'>('maior');
	let tonica = $state<number | 'qualquer'>(0);
	let compassos = $state<4 | 8>(4);
	let tecnicas = $state<TecnicaId[]>(['ii-v', 'extensoes']);
	let baixo = $state<Baixo>('nenhum');
	let versao = $state<Versao>('reharmonizada');
	let bpm = $state(88);
	let comMelodia = $state(true);
	let repetir = $state(true);

	const original = $derived<Progressao>(
		sortearProgressao(criarAleatorio(sementeProgressao), {
			modo: modo === 'qualquer' ? undefined : modo,
			tonica: tonica === 'qualquer' ? undefined : tonica,
			compassos
		})
	);
	const reharmonizada = $derived(
		reharmonizar(original, [...tecnicas, ...(baixo === 'nenhum' ? [] : [baixo])], criarAleatorio(sementeReharmonizacao))
	);
	const ativa = $derived(versao === 'original' ? original : reharmonizada.progressao);
	const melodia = $derived(gerarMelodia(ativa, criarAleatorio(sementeMelodia)));
	const vozes = $derived(voicings(ativa));
	const tonalidade = $derived(ativa.tonalidade);
	const bemol = $derived(usaBemol(tonalidade));
	const usosPorTecnica = $derived(
		TECNICAS.map((id) => ({ id, usos: reharmonizada.usos.filter((u) => u.tecnica === id) })).filter((g) => g.usos.length > 0)
	);

	function compassosDe(p: Progressao) {
		const lista: { numero: number; acordes: { indice: number; cifra: string; tecnicas: string[] }[] }[] = [];
		p.acordes.forEach((a, indice) => {
			(lista[a.compasso] ??= { numero: a.compasso + 1, acordes: [] }).acordes.push({
				indice,
				cifra: cifra(a, p.tonalidade),
				tecnicas: a.tecnicas
			});
		});
		return lista.filter(Boolean);
	}

	const compassosOriginal = $derived(compassosDe(original));
	const compassosAtiva = $derived(compassosDe(ativa));
	const totalTempos = $derived(ativa.acordes.reduce((s, a) => s + a.tempos, 0));

	// Reprodução ---------------------------------------------------------------

	let tocando = $state(false);
	let acordeAtual = $state(-1);
	let notasAcorde = $state(new Set<number>());
	let notasMelodia = $state(new Set<number>());
	let quadro = 0;
	let inicioCiclo = 0;
	let proximoAgendado = false;
	let avisoTimer: ReturnType<typeof setTimeout>;

	/** Agenda um ciclo inteiro a partir de `inicio` (relógio do áudio) e devolve a duração em segundos. */
	function agendar(inicio: number): number {
		const seg = 60 / bpm;
		let tempo = 0;
		vozes.forEach((v, i) => {
			const dur = ativa.acordes[i].tempos * seg;
			const quando = inicio + tempo * seg;
			piano.nota(v.baixo, quando, dur * 0.98, 0.5);
			v.mao.forEach((m, k) => piano.nota(m, quando + k * 0.012, dur * 0.95, 0.26));
			tempo += ativa.acordes[i].tempos;
		});
		if (comMelodia) for (const n of melodia) piano.nota(n.midi, inicio + n.inicio * seg, n.duracao * seg * 0.95, 0.4);
		return totalTempos * seg;
	}

	function quadroDeAnimacao() {
		const seg = 60 / bpm;
		const duracao = totalTempos * seg;
		const agora = piano.agora();
		const fim = inicioCiclo + duracao;
		if (repetir && !proximoAgendado && agora >= fim) {
			// A aba ficou em segundo plano e o ciclo seguinte não foi agendado a tempo: recomeça agora.
			inicioCiclo = agora + 0.05;
			agendar(inicioCiclo);
		} else if (repetir && !proximoAgendado && agora > fim - 0.6) {
			agendar(fim);
			proximoAgendado = true;
		}
		if (agora >= inicioCiclo + duracao) {
			if (!proximoAgendado) return parar();
			inicioCiclo += duracao;
			proximoAgendado = false;
		}
		const dec = (agora - inicioCiclo) / seg;
		if (dec >= 0) {
			let t = 0;
			let indice = -1;
			ativa.acordes.forEach((a, i) => {
				if (dec >= t && dec < t + a.tempos) indice = i;
				t += a.tempos;
			});
			if (indice !== acordeAtual) {
				acordeAtual = indice;
				const v = vozes[indice];
				notasAcorde = new Set(v ? [v.baixo, ...v.mao] : []);
			}
			const n = comMelodia ? melodia.find((x) => dec >= x.inicio && dec < x.inicio + x.duracao) : undefined;
			const midi = n?.midi;
			if (midi !== undefined ? !notasMelodia.has(midi) || notasMelodia.size !== 1 : notasMelodia.size > 0) {
				notasMelodia = new Set(midi === undefined ? [] : [midi]);
			}
		}
		quadro = requestAnimationFrame(quadroDeAnimacao);
	}

	function tocar() {
		parar();
		inicioCiclo = piano.agora() + 0.12;
		proximoAgendado = false;
		agendar(inicioCiclo);
		tocando = true;
		quadro = requestAnimationFrame(quadroDeAnimacao);
	}

	function parar() {
		cancelAnimationFrame(quadro);
		piano.parar();
		tocando = false;
		acordeAtual = -1;
		notasAcorde = new Set();
		notasMelodia = new Set();
	}

	function acender(acorde: number[], melodiaNotas: number[], ms: number) {
		notasAcorde = new Set(acorde);
		notasMelodia = new Set(melodiaNotas);
		clearTimeout(avisoTimer);
		avisoTimer = setTimeout(() => {
			if (!tocando) {
				notasAcorde = new Set();
				notasMelodia = new Set();
			}
		}, ms);
	}

	function tocarAcorde(indice: number) {
		if (tocando) parar();
		const v = vozes[indice];
		const agora = piano.agora() + 0.02;
		piano.nota(v.baixo, agora, 1.6, 0.5);
		v.mao.forEach((m, k) => piano.nota(m, agora + k * 0.03, 1.5, 0.26));
		acender([v.baixo, ...v.mao], [], 1600);
	}

	function tocarTecla(midi: number) {
		piano.nota(midi, piano.agora() + 0.01, 1.2, 0.45);
		if (!tocando) acender([], [midi], 400);
	}

	// Mudou a música ou o jeito de tocar: para, para não tocar uma coisa e mostrar outra.
	$effect(() => {
		void [ativa, melodia, bpm, comMelodia, repetir];
		untrack(() => {
			if (tocando) parar();
		});
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(quadro);
		clearTimeout(avisoTimer);
		piano.fechar();
	});

	// Ações ---------------------------------------------------------------------

	const sortearSemente = () => Math.floor(Math.random() * 1_000_000);

	function sortear() {
		sementeProgressao = sortearSemente();
		sementeReharmonizacao = sortearSemente();
		sementeMelodia = sortearSemente();
	}

	function surpreender() {
		const embaralhadas = [...TECNICAS_LIVRES].sort(() => Math.random() - 0.5);
		tecnicas = embaralhadas.slice(0, 2 + Math.floor(Math.random() * 3));
		baixo = BAIXOS[Math.floor(Math.random() * BAIXOS.length)];
		sementeReharmonizacao = sortearSemente();
		versao = 'reharmonizada';
	}

	function alternar(id: TecnicaId) {
		tecnicas = tecnicas.includes(id) ? tecnicas.filter((x) => x !== id) : [...tecnicas, id];
	}


	// Semente para compartilhar ---------------------------------------------------

	const configuracao = $derived<Configuracao>({
		sementeProgressao,
		sementeReharmonizacao,
		sementeMelodia,
		modo,
		tonica,
		compassos,
		tecnicas,
		baixo,
		versao,
		bpm,
		comMelodia,
		repetir
	});
	const codigo = $derived(codificar(configuracao));
	const link = $derived(browser ? `${location.origin}${location.pathname}#s=${codigo}` : '');
	let codigoDigitado = $state('');
	let codigoInvalido = $state(false);
	let pronto = $state(false);

	function aplicar(c: Configuracao) {
		sementeProgressao = c.sementeProgressao;
		sementeReharmonizacao = c.sementeReharmonizacao;
		sementeMelodia = c.sementeMelodia;
		modo = c.modo;
		tonica = c.tonica;
		compassos = c.compassos;
		tecnicas = c.tecnicas;
		baixo = c.baixo;
		versao = c.versao;
		bpm = c.bpm;
		comMelodia = c.comMelodia;
		repetir = c.repetir;
	}

	function abrirCodigo() {
		const c = decodificar(codigoDigitado);
		codigoInvalido = !c;
		if (!c) return;
		aplicar(c);
		codigoDigitado = '';
	}

	onMount(() => {
		const c = decodificar(location.hash);
		if (c) aplicar(c);
		pronto = true;
	});

	// O endereço sempre leva a música atual: copiar da barra de endereço também compartilha.
	$effect(() => {
		if (!pronto) return;
		const alvo = `#s=${codigo}`;
		untrack(() => {
			try {
				replaceState(alvo, {});
			} catch {
				// Sem roteador ainda: o código continua na tela.
			}
		});
	});

	function baixarMidi() {
		const bytes = gerarMidi({
			progressao: ativa,
			vozes,
			melodia: comMelodia ? melodia : [],
			bpm,
			nomes: { acordes: t('tools.acordes.faixaAcordes'), melodia: t('tools.acordes.faixaMelodia') }
		});
		baixar(`acordes-${codigo}.mid`, new Blob([bytes as BlobPart], { type: 'audio/midi' }));
	}

	const notaMelodiaTexto = (midi: number) => nomeMidi(midi, bemol);
	const FAIXA_MIN = 60;
	const FAIXA_MAX = 79;
	const ALTURA_NOTA = 6;
	const LARGURA_TEMPO = 24;
</script>

<CabecalhoFerramenta slug="acordes" />

<div class="grade">
	<section class="painel">
		<h2>{t('tools.acordes.sortear')}</h2>
		<div class="campos">
			<label class="campo">
				{t('tools.acordes.tom')}
				<select bind:value={tonica}>
					<option value="qualquer">{t('tools.acordes.qualquer')}</option>
					{#each NOTAS as n (n)}
						<option value={n}>{nomeNota(n, usaBemol({ tonica: n, modo: modo === 'menor' ? 'menor' : 'maior' }))}</option>
					{/each}
				</select>
			</label>
			<label class="campo">
				{t('tools.acordes.modo')}
				<select bind:value={modo}>
					<option value="qualquer">{t('tools.acordes.qualquer')}</option>
					<option value="maior">{t('tools.acordes.maior')}</option>
					<option value="menor">{t('tools.acordes.menor')}</option>
				</select>
			</label>
			<label class="campo">
				{t('tools.acordes.tamanho')}
				<select bind:value={compassos}>
					<option value={4}>{t('tools.acordes.compassos', { count: 4 })}</option>
					<option value={8}>{t('tools.acordes.compassos', { count: 8 })}</option>
				</select>
			</label>
		</div>
		<div class="acoes">
			<button type="button" onclick={sortear}>{t('tools.acordes.sortearBotao')}</button>
		</div>
		<h3>{t('tools.acordes.original')} <span class="tom">{nomeTonalidade(original.tonalidade)}</span></h3>
		<ol class="compassos">
			{#each compassosOriginal as c (c.numero)}
				<li class="compasso">
					<span class="numero">{c.numero}</span>
					{#each c.acordes as a (a.indice)}
						<span class="acorde">{a.cifra}</span>
					{/each}
				</li>
			{/each}
		</ol>
		<div class="acoes">
			<BotaoCopiar texto={cifraEmTexto(original)} rotulo={t('tools.acordes.copiar')} />
		</div>
	</section>

	<section class="painel">
		<h2>{t('tools.acordes.reharmonizar')}</h2>
		<fieldset class="tecnicas">
			<legend class="campo">{t('tools.acordes.tecnicas')}</legend>
			{#each TECNICAS_LIVRES as id (id)}
				<label class="tecnica">
					<input type="checkbox" checked={tecnicas.includes(id)} onchange={() => alternar(id)} />
					<span>
						<strong>{t(`tools.acordes.tecnica.${id}.nome`)}</strong>
						<small>{t(`tools.acordes.tecnica.${id}.descricao`)}</small>
						<small class="ouvir">{t(`tools.acordes.tecnica.${id}.ouvir`)}</small>
					</span>
				</label>
			{/each}
		</fieldset>
		<fieldset class="tecnicas">
			<legend class="campo">{t('tools.acordes.baixo')}</legend>
			{#each BAIXOS as b (b)}
				<label class="tecnica">
					<input type="radio" value={b} bind:group={baixo} />
					<span>
						<strong>{t(`tools.acordes.baixo.${b}.nome`)}</strong>
						<small>{t(`tools.acordes.baixo.${b}.descricao`)}</small>
					</span>
				</label>
			{/each}
		</fieldset>
		<div class="acoes">
			<button type="button" class="secundario" onclick={surpreender}>{t('tools.acordes.surpreenda')}</button>
			<button type="button" class="secundario" onclick={() => (sementeReharmonizacao = sortearSemente())}>
				{t('tools.acordes.variar')}
			</button>
		</div>
	</section>
</div>

<section class="painel">
	<h2>{t('tools.acordes.resultado')}</h2>
	<div class="campos">
		<fieldset class="versoes">
			<legend class="campo">{t('tools.acordes.versao')}</legend>
			<label class="opcao"><input type="radio" value="reharmonizada" bind:group={versao} /> {t('tools.acordes.reharmonizada')}</label>
			<label class="opcao"><input type="radio" value="original" bind:group={versao} /> {t('tools.acordes.original')}</label>
		</fieldset>
	</div>
	<ol class="compassos">
		{#each compassosAtiva as c (c.numero)}
			<li class="compasso">
				<span class="numero">{c.numero}</span>
				{#each c.acordes as a (a.indice)}
					<button
						type="button"
						class="acorde secundario"
						class:ativo={acordeAtual === a.indice}
						class:mudou={a.tecnicas.length > 0}
						title={a.tecnicas.map((id) => t(`tools.acordes.tecnica.${id}.nome`)).join(', ')}
						onclick={() => tocarAcorde(a.indice)}
					>
						{a.cifra}
					</button>
				{/each}
			</li>
		{/each}
	</ol>
	<p class="dica">{t('tools.acordes.dicaAcorde')}</p>

	{#if versao === 'reharmonizada'}
		{#if usosPorTecnica.length === 0}
			<p class="dica">{t('tools.acordes.nada')}</p>
		{:else}
			<details open>
				<summary>{t('tools.acordes.oQueMudou')}</summary>
				{#each usosPorTecnica as g (g.id)}
					<h3>{t(`tools.acordes.tecnica.${g.id}.nome`)}</h3>
					<ul class="usos">
						{#each g.usos as u, i (i)}
							<li>{t('tools.acordes.uso', { bar: u.compasso + 1, antes: u.antes, depois: u.depois })}</li>
						{/each}
					</ul>
				{/each}
			</details>
		{/if}
		<div class="acoes">
			<BotaoCopiar texto={cifraEmTexto(reharmonizada.progressao)} rotulo={t('tools.acordes.copiarReharmonizada')} />
		</div>
	{/if}
</section>

<section class="painel">
	<h2>{t('tools.acordes.tocar')}</h2>
	<div class="campos">
		<label class="campo">
			{t('tools.acordes.andamento', { bpm })}
			<input type="range" min={BPM_MIN} max={BPM_MAX} step="2" bind:value={bpm} />
		</label>
		<label class="opcao"><input type="checkbox" bind:checked={comMelodia} /> {t('tools.acordes.comMelodia')}</label>
		<label class="opcao"><input type="checkbox" bind:checked={repetir} /> {t('tools.acordes.repetir')}</label>
	</div>
	<div class="acoes">
		{#if tocando}
			<button type="button" onclick={parar}>{t('tools.acordes.parar')}</button>
		{:else}
			<button type="button" onclick={tocar}>{t('tools.acordes.tocarBotao')}</button>
		{/if}
		<button type="button" class="secundario" onclick={() => (sementeMelodia = sortearSemente())}>
			{t('tools.acordes.novaMelodia')}
		</button>
	</div>

	<div class="teclado">
		<Piano acorde={notasAcorde} melodia={notasMelodia} onTocar={tocarTecla} />
	</div>
	<p class="legenda">
		<span class="amostra acorde-cor"></span>{t('tools.acordes.legendaAcorde')}
		<span class="amostra melodia-cor"></span>{t('tools.acordes.legendaMelodia')}
	</p>

	{#if comMelodia}
		<h3>{t('tools.acordes.linhaMelodica')}</h3>
		<div class="rolagem">
			<svg
				class="rolo"
				viewBox="0 0 {totalTempos * LARGURA_TEMPO} {(FAIXA_MAX - FAIXA_MIN + 1) * ALTURA_NOTA}"
				role="img"
				aria-label={t('tools.acordes.linhaMelodicaAlt', { notas: melodia.map((n) => notaMelodiaTexto(n.midi)).join(' ') })}
			>
				{#each Array.from({ length: Math.ceil(totalTempos / 4) + 1 }, (_, i) => i) as c (c)}
					<line class="marca" x1={c * 4 * LARGURA_TEMPO} x2={c * 4 * LARGURA_TEMPO} y1="0" y2={(FAIXA_MAX - FAIXA_MIN + 1) * ALTURA_NOTA} />
				{/each}
				{#each melodia as n, i (i)}
					<rect
						class="nota"
						x={n.inicio * LARGURA_TEMPO + 1}
						y={(FAIXA_MAX - n.midi) * ALTURA_NOTA}
						width={n.duracao * LARGURA_TEMPO - 2}
						height={ALTURA_NOTA - 1}
					/>
				{/each}
			</svg>
		</div>
		<p class="notas">{melodia.map((n) => notaMelodiaTexto(n.midi)).join(' ')}</p>
	{/if}
</section>

<section class="painel">
	<h2>{t('tools.acordes.compartilhar')}</h2>
	<p class="dica">{t('tools.acordes.sementeDica')}</p>
	<p class="codigo"><code>{codigo}</code></p>
	<div class="acoes">
		<BotaoCopiar texto={codigo} rotulo={t('tools.acordes.copiarCodigo')} />
		<BotaoCopiar texto={link} rotulo={t('tools.acordes.copiarLink')} />
	</div>
	<form
		class="abrir"
		onsubmit={(e) => {
			e.preventDefault();
			abrirCodigo();
		}}
	>
		<label class="campo">
			{t('tools.acordes.abrirCodigo')}
			<input type="text" bind:value={codigoDigitado} autocomplete="off" spellcheck="false" aria-invalid={codigoInvalido} />
		</label>
		<button type="submit" class="secundario" disabled={codigoDigitado.trim() === ''}>{t('tools.acordes.abrir')}</button>
	</form>
	{#if codigoInvalido}
		<p class="erro" role="alert">{t('tools.acordes.codigoInvalido')}</p>
	{/if}

	<h3>{t('tools.acordes.salvar')}</h3>
	<p class="dica">{t('tools.acordes.midiDica')}</p>
	<div class="acoes">
		<button type="button" onclick={baixarMidi}>{t('tools.acordes.baixarMidi')}</button>
	</div>
</section>

<style>
	.grade {
		display: grid;
		gap: var(--space-5);
		grid-template-columns: repeat(auto-fit, minmax(var(--column-min), 1fr));
		align-items: start;
	}

	h3 {
		font-size: var(--text-sm);
		margin: var(--space-4) 0 var(--space-2);
		color: var(--color-muted);
	}

	.tom {
		font-family: var(--font-mono);
		color: var(--color-text);
	}

	fieldset {
		border: 0;
		padding: 0;
		margin: 0 0 var(--space-4);
	}

	legend {
		width: 100%;
		margin-bottom: var(--space-2);
	}

	.tecnicas {
		display: grid;
		gap: var(--space-3);
	}

	.tecnica {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		cursor: pointer;
	}

	.tecnica input {
		margin-top: var(--space-1);
		flex: none;
	}

	.tecnica span {
		display: grid;
		gap: var(--space-1);
	}

	.tecnica small {
		font-size: var(--text-sm);
		color: var(--color-muted);
		line-height: var(--leading-tight);
	}

	.tecnica small.ouvir {
		color: var(--color-link);
	}

	.compassos {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(auto-fill, minmax(var(--compasso-min), 1fr));
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-4);
	}

	.compasso {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-2);
		align-items: baseline;
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg);
		border: var(--border-width) solid var(--color-border);
		min-height: var(--space-7);
	}

	.numero {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-muted);
		width: 100%;
	}

	.acorde {
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	button.acorde {
		padding: var(--space-1) var(--space-2);
		box-shadow: none;
		color: var(--color-text);
	}

	button.acorde.mudou {
		border-color: var(--color-accent);
	}

	button.acorde.ativo {
		background: var(--piano-acorde);
		color: var(--piano-tecla-branca);
	}

	.dica {
		font-size: var(--text-sm);
		color: var(--color-muted);
		margin: 0 0 var(--space-4);
	}

	.usos {
		margin: 0 0 var(--space-3);
		padding-left: var(--space-5);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	summary {
		cursor: pointer;
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.teclado {
		margin-top: var(--space-4);
	}

	.legenda {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		font-size: var(--text-sm);
		color: var(--color-muted);
		margin: var(--space-2) 0 0;
	}

	.amostra {
		display: inline-block;
		width: var(--space-3);
		height: var(--space-3);
		border: var(--border-width) solid var(--color-border);
	}

	.amostra.acorde-cor {
		background: var(--piano-acorde);
	}

	.amostra.melodia-cor {
		background: var(--piano-melodia);
		margin-left: var(--space-3);
	}

	.rolagem {
		overflow-x: auto;
	}

	.rolo {
		display: block;
		width: 100%;
		min-width: var(--piano-largura-min);
		background: var(--color-bg);
		border: var(--border-width) solid var(--color-border);
	}

	.rolo .marca {
		stroke: var(--color-border);
		stroke-width: var(--border-width);
	}

	.rolo .nota {
		fill: var(--piano-melodia);
	}

	.codigo {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		overflow-wrap: anywhere;
	}

	.abrir {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: end;
		margin-top: var(--space-4);
	}

	.notas {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
</style>
