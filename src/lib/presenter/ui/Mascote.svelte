<script lang="ts" module>
	// Sprite do autor em pixel art, estilo personagem de mapa de RPG 16-bit:
	// cabelo longo e escuro, barba e bigode mais claros, sem acessório.
	// Cada linha é uma fileira da grade. Legenda:
	//   c = cabelo, d = barba e bigode, s = pele, o = olho, b = camisa,
	//   l = calça, k = sapato, . = vazio
	const SPRITE = [
		'...cccccc...',
		'..cccccccc..',
		'.cccccccccc.',
		'.ccsssssscc.',
		'.ccsossoscc.',
		'.ccsossoscc.',
		'.ccddddddcc.',
		'.ccddddddcc.',
		'.c..dddd..c.',
		'..bbbbbbbb..',
		'.sbbbbbbbbs.',
		'.sbbbbbbbbs.',
		'..bbbbbbbb..',
		'..llllllll..'
	];

	// Dois quadros de perna alternando embaixo do sprite: anda no lugar.
	const PERNAS = [
		['..ll....ll..', '..ll....ll..', '..kk....kk..'],
		['...ll..ll...', '...ll..ll...', '...kk..kk...']
	];

	const CLASSES: Record<string, string> = {
		c: 'cabelo',
		d: 'barba',
		s: 'pele',
		o: 'olho',
		b: 'camisa',
		l: 'calca',
		k: 'sapato'
	};

	const LARGURA = SPRITE[0].length;
	const ALTURA = SPRITE.length + PERNAS[0].length;

	function pixels(grade: string[], deslocamento = 0) {
		return grade.flatMap((linha, y) =>
			[...linha].flatMap((c, x) =>
				CLASSES[c] ? [{ x, y: y + deslocamento, classe: CLASSES[c] }] : []
			)
		);
	}

	const TODOS = pixels(SPRITE);
	const CORPO = TODOS.filter((p) => p.classe !== 'olho');
	const OLHOS = TODOS.filter((p) => p.classe === 'olho');
	const QUADROS = PERNAS.map((q) => pixels(q, SPRITE.length));
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
		{#each CORPO as p (`${p.x}-${p.y}`)}
			<rect class={p.classe} x={p.x} y={p.y} width="1" height="1" />
		{/each}
		<g class="olhos">
			{#each OLHOS as p (`${p.x}-${p.y}`)}
				<rect class={p.classe} x={p.x} y={p.y} width="1" height="1" />
			{/each}
		</g>
	</g>
	{#each QUADROS as quadro, i (i)}
		<g class={`quadro quadro-${i}`}>
			{#each quadro as p (`${p.x}-${p.y}`)}
				<rect class={p.classe} x={p.x} y={p.y} width="1" height="1" />
			{/each}
		</g>
	{/each}
</svg>

<style>
	.mascote {
		display: inline-block;
		flex-shrink: 0;
		overflow: visible;
	}

	.cabelo {
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
	.sapato {
		fill: var(--mascote-cabelo);
	}
	.olho {
		fill: var(--mascote-olho);
	}

	.olhos {
		transform-box: fill-box;
		transform-origin: center;
		animation: piscar 4s steps(1) infinite;
	}

	/* parado: respira um pixel a cada pouco mais de um segundo */
	.pulo {
		animation: respirar 1.2s steps(1) infinite;
	}

	/* andar no lugar: dois quadros de perna alternando */
	.quadro-0 {
		animation: quadro-a 0.8s steps(1) infinite;
	}
	.quadro-1 {
		animation: quadro-b 0.8s steps(1) infinite;
	}

	/* passar o mouse: pulinho de dois quadros */
	:global(a:hover) > .mascote .pulo,
	.mascote:hover .pulo {
		animation: pular 0.4s steps(1) infinite;
	}

	@keyframes respirar {
		0%,
		60% {
			transform: translateY(0);
		}
		61%,
		100% {
			transform: translateY(1px);
		}
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
		92% {
			transform: scaleY(1);
		}
		93%,
		97% {
			transform: scaleY(0.2);
		}
		98%,
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
		.quadro-0 {
			animation: none;
		}
		.quadro-1 {
			animation: none;
			opacity: 0;
		}
	}
</style>
