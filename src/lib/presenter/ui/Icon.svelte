<script lang="ts" module>
	// Ícones em pixel art: cada linha é uma fileira da grade, `#` é pixel aceso.
	const bitmaps = {
		'seta-direita': [
			'..#.....',
			'..##....',
			'..###...',
			'..####..',
			'..####..',
			'..###...',
			'..##....',
			'..#.....'
		],
		'seta-esquerda': [
			'.....#..',
			'....##..',
			'...###..',
			'..####..',
			'..####..',
			'...###..',
			'....##..',
			'.....#..'
		],
		externo: [
			'...#####',
			'.....###',
			'....#.##',
			'...#...#',
			'#.#.....',
			'#.......',
			'#.......',
			'#####...'
		],
		rss: [
			'#####...',
			'.....#..',
			'###...#.',
			'...#...#',
			'#...#..#',
			'##..#..#',
			'##.....#',
			'........'
		],
		moeda: [
			'..####..',
			'.#....#.',
			'#..##..#',
			'#..##..#',
			'#..##..#',
			'#..##..#',
			'.#....#.',
			'..####..'
		],
		qrcode: [
			'###..###',
			'#.#..#.#',
			'###..###',
			'...##...',
			'##.#..#.',
			'...##.##',
			'###.#...',
			'#.#.##.#'
		],
		documento: [
			'#####...',
			'#...##..',
			'#.##.##.',
			'#......#',
			'#.####.#',
			'#......#',
			'#.###..#',
			'########'
		],
		chaves: [
			'..#..#..',
			'.#....#.',
			'.#....#.',
			'#......#',
			'.#....#.',
			'.#....#.',
			'..#..#..',
			'........'
		],
		paleta: [
			'..####..',
			'.#....#.',
			'#.#..#.#',
			'#......#',
			'#.#...#.',
			'#....#..',
			'.#...#..',
			'..###...'
		],
		rosto: [
			'.######.',
			'#......#',
			'#.#..#.#',
			'#......#',
			'#.#..#.#',
			'#..##..#',
			'#......#',
			'.######.'
		]
	} as const;

	export type IconName = keyof typeof bitmaps;

	function pixels(name: IconName) {
		return bitmaps[name].flatMap((row, y) =>
			[...row].flatMap((c, x) => (c === '#' ? [{ x, y }] : []))
		);
	}
</script>

<script lang="ts">
	let { name, size = 16, label }: { name: IconName; size?: number; label?: string } = $props();
	const pts = $derived(pixels(name));
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 8 8"
	fill="currentColor"
	shape-rendering="crispEdges"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	{#each pts as p (`${p.x}-${p.y}`)}
		<rect x={p.x} y={p.y} width="1" height="1" />
	{/each}
</svg>

<style>
	.icon {
		display: inline-block;
		vertical-align: -0.125em;
		flex-shrink: 0;
	}
</style>
