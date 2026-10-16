<script lang="ts" module>
	// Sprite do autor em pixel art, estilo personagem de mapa de RPG 16-bit:
	// cabelo longo e escuro, barba e bigode mais claros, sem acessório.
	// Cada linha é uma fileira da grade. Legenda:
	//   c = cabelo, d = barba e bigode, s = pele, o = olho, b = camisa,
	//   l = calça, k = sapato, p = celular, g = tela, m = notebook,
	//   n = teclado, x = caneca (e botão do controle), v = vapor e bolinhas,
	//   j = controle, f = fone, w = página, q = capa do livro, z = letra ou nota,
	//   . = vazio
	//
	// Cada ação tem dois quadros que alternam. A ação é sorteada a cada
	// carregamento por `HEAD_MASCOTE` (no `<head>`, antes de pintar a tela),
	// que também traz o CSS que mostra só a sorteada. Roda 6 ciclos e para.

	const CABECA = [
		'...cccccc...',
		'..cccccccc..',
		'.cccccccccc.',
		'.ccsssssscc.',
		'.ccsossoscc.',
		'.ccsossoscc.',
		'.ccddddddcc.',
		'.ccddddddcc.',
		'.c..dddd..c.'
	];
	// olhando para baixo: só a fileira de baixo dos olhos
	const CABECA_BAIXO = [...CABECA.slice(0, 4), '.ccsssssscc.', ...CABECA.slice(5)];
	const TRONCO = ['..bbbbbbbb..', '.sbbbbbbbbs.', '.sbbbbbbbbs.', '..bbbbbbbb..'];
	const CINTURA = '..llllllll..';
	const PERNAS = ['..ll....ll..', '..ll....ll..', '..kk....kk..'];
	const PERNAS_PASSO = ['...ll..ll...', '...ll..ll...', '...kk..kk...'];

	export const SPRITES = {
		andando: [
			[...CABECA, ...TRONCO, CINTURA, ...PERNAS],
			[...CABECA, ...TRONCO, CINTURA, ...PERNAS_PASSO]
		],
		// smartphone em pé (mais alto que largo), tela acesa com uma linha de
		// conteúdo rolando, seguro pelas duas mãos
		celular: [
			[...CABECA_BAIXO.slice(0, 8), '.c..pppp..c.', '..bbpggpbb..', '.sbbpwwpbbs.', '.sbspggpsbs.', '..bbppppbb..', CINTURA, ...PERNAS],
			[...CABECA_BAIXO.slice(0, 8), '.c..pppp..c.', '..bbpwwpbb..', '.sbbpggpbbs.', '.sbspggpsbs.', '..bbppppbb..', CINTURA, ...PERNAS]
		],
		// notebook aberto visto por trás: tampa com moldura e logo, base mais
		// larga que a tampa; as mãos se alternam no teclado
		computador: [
			[...CABECA_BAIXO, '..nnnnnnnn..', '.bnmmmmmmnb.', '.bnmmwwmmnb.', '.snmmmmmmnb.', 'nnnnnnnnnnnn', ...PERNAS],
			[...CABECA_BAIXO, '..nnnnnnnn..', '.bnmmmmmmnb.', '.bnmmwwmmnb.', '.bnmmmmmmns.', 'nnnnnnnnnnnn', ...PERNAS]
		],
		cafe: [
			[
				...CABECA.slice(0, 8),
				'.c..dddd..cv',
				'..bbbbbbbb.v',
				'.sbbbbbbbbs.',
				'.sbbbbbbbbxx',
				'..bbbbbbbbxx',
				CINTURA,
				...PERNAS
			],
			// caneca no canto da boca, com a mão segurando
			[
				...CABECA.slice(0, 6),
				'.ccdddddxxc.',
				'.ccdddddxxs.',
				'.c..dddd..s.',
				'..bbbbbbbbs.',
				'.sbbbbbbbb..',
				'.sbbbbbbbb..',
				'..bbbbbbbb..',
				CINTURA,
				...PERNAS
			]
		],
		acenando: [
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsossoscc.', '.ccsossosccs', '.ccddddddccs', '.ccddddddcs.', '.c..dddd..s.', '..bbbbbbbbb.', '.sbbbbbbbb..', '.sbbbbbbbb..', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsossoscc.', '.ccsossoscc.', '.ccddddddcc.', '.ccddddddccs', '.c..dddd..ss', '..bbbbbbbbb.', '.sbbbbbbbb..', '.sbbbbbbbb..', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
		],
		videogame: [
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsossoscc.', '.ccsossoscc.', '.ccddddddcc.', '.ccddddddcc.', '.c..dddd..c.', '..bbbbbbbb..', '.bbbbbbbbbb.', '.bbspjjxsbb.', '..bbjjjjbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsossoscc.', '.ccsossoscc.', '.ccddddddcc.', '.ccddddddcc.', '.c..dddd..c.', '..bbbbbbbb..', '.bbbbbbbbbb.', '.bbsjpxjsbb.', '..bbjjjjbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
		],
		cochilando: [
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsssssscc.', '.ccoossoocc.', '.ccddddddcc.', '.ccddddddcc.', '.c..dddd..c.', '..bbbbbbbb..', '.sbbbbbbbbs.', '.sbbbbbbbbs.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsssssscc.', '.ccoossoocc.', '.ccddddddcc.', '.ccddddddcc.', '.c..dddd..c.', '..bbbbbbbb..', '.sbbbbbbbbs.', '.sbbbbbbbbs.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
		],
		// fone: arco por cima (o topo vem de EXTRAS) e conchas dos lados
		musica: [
			['..fccccccf..', '.fccccccccf.', 'fccccccccccf', 'xxcsssssscxx', 'xxcsossoscxx', 'xxcsossoscxx', '.ccddddddcc.', '.ccddddddcc.', '.c..dddd..c.', '..bbbbbbbb..', '.sbbbbbbbbs.', '.sbbbbbbbbs.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
			['..fccccccf..', '.fccccccccf.', 'fccccccccccf', 'xxcsssssscxx', 'xxcsossoscxx', 'xxcsossoscxx', '.ccddddddcc.', '.ccddddddcc.', '.c..dddd..c.', '..bbbbbbbb..', '.sbbbbbbbbs.', '.sbbbbbbbbs.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..']
		],
		// lendo: livro aberto na frente do rosto, visto por trás (capa, lombada
		// e páginas em cima); os olhos correm a linha
		lendo: [
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsssssscc.', '.ccsossoscc.', '.ccddddddcc.', '.ccwwwwwwcc.', '.csqqllqqsc.', '.bsqqllqqsb.', '.sbqqllqqbs.', '.sbbbbbbbbs.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsssssscc.', '.ccssossocc.', '.ccddddddcc.', '.ccwwwwwwcc.', '.csqqllqqsc.', '.bsqqllqqsb.', '.sbqqllqqbs.', '.sbbbbbbbbs.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..']
		],
		// pensando: olha para cima, mão no queixo (o balão vem de EXTRAS)
		pensando: [
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsossoscc.', '.ccsssssscc.', '.ccddddddcc.', '.ccddddddcc.', '.c..dddss.c.', '..bbbbbbbsb.', '.sbbbbbbbbs.', '.sbbbbbbbbb.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..'],
			['...cccccc...', '..cccccccc..', '.cccccccccc.', '.ccsssssscc.', '.ccsossoscc.', '.ccsssssscc.', '.ccddddddcc.', '.ccddddddcc.', '.c..dddss.c.', '..bbbbbbbsb.', '.sbbbbbbbbs.', '.sbbbbbbbbb.', '..bbbbbbbb..', '..llllllll..', '..ll....ll..', '..ll....ll..', '..kk....kk..']
		]
	} as const;

	// Desenho fora da grade, em volta do sprite (o SVG deixa vazar). Cada
	// pedaço tem a posição do canto de cima à esquerda. z = letra ou nota.
	// Limites: até 8 pixels acima (no header, o mascote fica a 16px do topo
	// com 2px por pixel) e nada à esquerda (no celular, a margem é de 16px).
	type Extra = { x: number; y: number; grade: readonly string[] };
	const Z_PEQUENO = ['.zzz', '...z', '..z.', '.zzz'];
	const Z_GRANDE = ['zzzz', '...z', '..z.', '.z..', 'zzzz'];
	const NOTA = ['.zz', '.z.', '.z.', 'zz.', 'zz.'];
	const INTERROGACAO = ['zzz', '..z', '.zz', '.z.', '...', '.z.'];
	const ARCO: Extra = { x: 3, y: -1, grade: ['ffffff'] };
	export const EXTRAS: Partial<Record<keyof typeof SPRITES, readonly (readonly Extra[])[]>> = {
		cochilando: [
			[{ x: 9, y: -4, grade: Z_PEQUENO }],
			[
				{ x: 9, y: -4, grade: Z_PEQUENO },
				{ x: 13, y: -7, grade: Z_GRANDE }
			]
		],
		pensando: [
			[
				{ x: 10, y: -1, grade: ['z'] },
				{ x: 11, y: -3, grade: ['z'] }
			],
			[
				{ x: 10, y: -1, grade: ['z'] },
				{ x: 11, y: -3, grade: ['z'] },
				{ x: 12, y: -8, grade: INTERROGACAO }
			]
		],
		musica: [
			[ARCO, { x: 12, y: -3, grade: NOTA }],
			[ARCO, { x: 13, y: -7, grade: NOTA }]
		]
	};

	export type Acao = keyof typeof SPRITES;
	export const ACOES = Object.keys(SPRITES) as Acao[];

	// Sem JavaScript não há sorteio: aparece andando.
	const MOSTRAR = [
		`:root:not([data-mascote]) .mascote [data-acao='andando']`,
		...ACOES.map((a) => `:root[data-mascote='${a}'] .mascote [data-acao='${a}']`)
	].join(',');

	/**
	 * Vai inline no `<head>` do layout: sorteia a ação no `<html data-mascote>`
	 * e mostra só ela. Gerado da lista de ações, para não repetir no CSS.
	 */
	export const HEAD_MASCOTE =
		`<style>${MOSTRAR}{display:inline}</style>` +
		`<script>try{var a=${JSON.stringify(ACOES)};document.documentElement.dataset.mascote=a[Math.floor(Math.random()*a.length)]}catch(e){}<\/script>`;

	const CLASSES: Record<string, string> = {
		c: 'cabelo',
		d: 'barba',
		s: 'pele',
		o: 'olho',
		b: 'camisa',
		l: 'calca',
		k: 'sapato',
		p: 'celular',
		g: 'tela',
		m: 'notebook',
		n: 'teclado',
		x: 'caneca',
		v: 'vapor',
		j: 'controle',
		f: 'fone',
		w: 'pagina',
		q: 'livro',
		z: 'letra'
	};

	export const LARGURA = 12;
	export const ALTURA = 17;

	// Junta pixels vizinhos da mesma cor numa fileira: bem menos <rect> no HTML.
	function trechos(grade: readonly string[], origem = { x: 0, y: 0 }) {
		return grade.flatMap((linha, linhaY) => {
			const y = linhaY + origem.y;
			const saida: { x: number; y: number; w: number; classe: string }[] = [];
			let x = 0;
			while (x < linha.length) {
				const c = linha[x];
				let fim = x + 1;
				while (fim < linha.length && linha[fim] === c) fim++;
				if (CLASSES[c]) saida.push({ x: x + origem.x, y, w: fim - x, classe: CLASSES[c] });
				x = fim;
			}
			return saida;
		});
	}

	const QUADROS = ACOES.map((acao) => ({
		acao,
		quadros: SPRITES[acao].map((grade, i) => {
			const extras = (EXTRAS[acao]?.[i] ?? []).flatMap((e) => trechos(e.grade, e));
			const todos = [...trechos(grade), ...extras];
			return {
				corpo: todos.filter((p) => p.classe !== 'olho'),
				olhos: todos.filter((p) => p.classe === 'olho')
			};
		})
	}));
</script>

<script lang="ts">
	let { tamanho = 3, label }: { tamanho?: number; label?: string } = $props();
</script>

<svg
	class="mascote"
	width={LARGURA * tamanho}
	height={ALTURA * tamanho}
	viewBox={`0 0 ${LARGURA} ${ALTURA}`}
	shape-rendering="crispEdges"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<g class="pulo">
		{#each QUADROS as { acao, quadros } (acao)}
			<g class="acao" data-acao={acao}>
				{#each quadros as quadro, i (i)}
					<g class={`quadro quadro-${i}`}>
						{#each quadro.corpo as p (`${p.x}-${p.y}`)}
							<rect class={p.classe} x={p.x} y={p.y} width={p.w} height="1" />
						{/each}
						<g class="olhos">
							{#each quadro.olhos as p (`${p.x}-${p.y}`)}
								<rect class={p.classe} x={p.x} y={p.y} width={p.w} height="1" />
							{/each}
						</g>
					</g>
				{/each}
			</g>
		{/each}
	</g>
</svg>

<style>
	.mascote {
		/* um ciclo = os dois quadros; depois de CICLOS, para no quadro 0 */
		--ciclo: 1s;
		--ciclos: 6;
		display: inline-block;
		flex-shrink: 0;
		overflow: visible;
	}

	.cabelo,
	.sapato {
		fill: var(--mascote-cabelo);
	}
	.barba {
		fill: var(--mascote-barba);
	}
	.pele {
		fill: var(--mascote-pele);
	}
	.camisa {
		fill: var(--mascote-camisa);
	}
	.calca {
		fill: var(--mascote-calca);
	}
	.olho {
		fill: var(--mascote-olho);
	}
	.celular {
		fill: var(--mascote-celular);
	}
	.tela {
		fill: var(--mascote-tela);
	}
	.notebook {
		fill: var(--mascote-notebook);
	}
	.teclado {
		fill: var(--mascote-teclado);
	}
	.caneca {
		fill: var(--mascote-caneca);
	}
	.vapor {
		fill: var(--mascote-vapor);
	}
	.controle {
		fill: var(--mascote-controle);
	}
	.fone {
		fill: var(--mascote-fone);
	}
	.pagina {
		fill: var(--mascote-pagina);
	}
	.livro {
		fill: var(--mascote-livro);
	}
	.letra {
		fill: var(--color-text);
	}

	/* só a ação sorteada aparece: a regra que mostra vem do HEAD_MASCOTE */
	.acao {
		display: none;
	}

	.quadro-1 {
		opacity: 0;
	}
	.quadro-0 {
		animation: quadro-a var(--ciclo) steps(1) var(--ciclos);
	}
	.quadro-1 {
		animation: quadro-b var(--ciclo) steps(1) var(--ciclos);
	}

	/* pisca duas vezes no mesmo tempo dos ciclos */
	.olhos {
		transform-box: fill-box;
		transform-origin: center;
		animation: piscar calc(var(--ciclo) * var(--ciclos) / 2) steps(1) 2;
	}

	/* passar o mouse: pulinho de dois quadros */
	:global(a:hover) > .mascote .pulo,
	.mascote:hover .pulo {
		animation: pular 0.4s steps(1) infinite;
	}

	@keyframes pular {
		0%,
		49% {
			transform: translateY(-2px);
		}
		50%,
		100% {
			transform: translateY(0);
		}
	}

	@keyframes piscar {
		0%,
		90% {
			transform: scaleY(1);
		}
		91%,
		96% {
			transform: scaleY(0.2);
		}
		97%,
		100% {
			transform: scaleY(1);
		}
	}

	@keyframes quadro-a {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	@keyframes quadro-b {
		0%,
		49% {
			opacity: 0;
		}
		50%,
		100% {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulo,
		.olhos,
		.quadro-0,
		.quadro-1 {
			animation: none;
		}
	}
</style>
