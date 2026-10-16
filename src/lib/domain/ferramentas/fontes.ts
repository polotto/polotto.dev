// Fontes do Google Fonts para testar na prévia da paleta. Só a prévia muda;
// a fonte é carregada sob demanda quando a pessoa escolhe.

export type Categoria = 'sans' | 'serif' | 'display' | 'mono';

/**
 * `pesoUnico`: a família só tem 400, e pedir 700 quebra a URL.
 * `superfamilia`: famílias desenhadas juntas (IBM Plex Sans e Mono).
 */
export type Fonte = { nome: string; categoria: Categoria; pesoUnico?: true; superfamilia?: string };

export const FONTES: readonly Fonte[] = [
	{ nome: 'Inter', categoria: 'sans' },
	{ nome: 'Roboto', categoria: 'sans' },
	{ nome: 'Open Sans', categoria: 'sans' },
	{ nome: 'Lato', categoria: 'sans' },
	{ nome: 'Montserrat', categoria: 'sans' },
	{ nome: 'Poppins', categoria: 'sans' },
	{ nome: 'Nunito', categoria: 'sans' },
	{ nome: 'DM Sans', categoria: 'sans' },
	{ nome: 'IBM Plex Sans', categoria: 'sans', superfamilia: 'IBM Plex' },
	{ nome: 'Space Grotesk', categoria: 'sans' },
	{ nome: 'Merriweather', categoria: 'serif' },
	{ nome: 'Lora', categoria: 'serif' },
	{ nome: 'Playfair Display', categoria: 'serif' },
	{ nome: 'Source Serif 4', categoria: 'serif' },
	{ nome: 'Fraunces', categoria: 'serif' },
	{ nome: 'Bebas Neue', categoria: 'display', pesoUnico: true },
	{ nome: 'Pixelify Sans', categoria: 'display' },
	{ nome: 'Press Start 2P', categoria: 'display', pesoUnico: true },
	{ nome: 'JetBrains Mono', categoria: 'mono' },
	{ nome: 'IBM Plex Mono', categoria: 'mono', superfamilia: 'IBM Plex' }
];

export const CATEGORIAS: Categoria[] = ['sans', 'serif', 'display', 'mono'];

const RESERVA: Record<Categoria, string> = {
	sans: 'sans-serif',
	serif: 'serif',
	display: 'sans-serif',
	mono: 'monospace'
};

export function buscarFonte(nome: string): Fonte | undefined {
	return FONTES.find((f) => f.nome === nome);
}

/** Valor de `font-family` com a reserva genérica da categoria. */
export function pilhaCss(fonte: Fonte): string {
	return `'${fonte.nome}', ${RESERVA[fonte.categoria]}`;
}

/** Uma URL do Google Fonts para várias famílias, com 400 e 700 quando há. */
export function urlGoogleFonts(fontes: Fonte[]): string {
	const familias = [...new Map(fontes.map((f) => [f.nome, f])).values()].map(
		(f) => `family=${f.nome.replace(/ /g, '+')}${f.pesoUnico ? '' : ':wght@400;700'}`
	);
	return `https://fonts.googleapis.com/css2?${familias.join('&')}&display=swap`;
}

// Regras de combinação (título + texto), das mais usadas em tipografia:
// 1. o texto corrido pede fonte de leitura: sem serifa ou com serifa. Display
//    e monoespaçada cansam em parágrafo longo, então ficam só no título;
// 2. a mesma fonte nos dois sempre combina (a hierarquia vem do peso);
// 3. fontes da mesma superfamília foram desenhadas para andar juntas;
// 4. categorias diferentes combinam pelo contraste (serifa com sem serifa,
//    display ou mono com fonte de leitura);
// 5. duas fontes diferentes da mesma categoria competem: parecem quase
//    iguais, e o leitor nota a diferença como erro.

export type Combinacao =
	| { combina: true; regra: 'mesma-fonte' | 'superfamilia' | 'contraste' }
	| { combina: false; regra: 'texto-sem-leitura' | 'mesma-categoria' };

export function combinar(titulo: Fonte, texto: Fonte): Combinacao {
	if (texto.categoria !== 'sans' && texto.categoria !== 'serif') return { combina: false, regra: 'texto-sem-leitura' };
	if (titulo.nome === texto.nome) return { combina: true, regra: 'mesma-fonte' };
	if (titulo.superfamilia && titulo.superfamilia === texto.superfamilia) return { combina: true, regra: 'superfamilia' };
	if (titulo.categoria !== texto.categoria) return { combina: true, regra: 'contraste' };
	return { combina: false, regra: 'mesma-categoria' };
}

/** Todos os pares que passam nas regras, sem a mesma fonte nos dois. */
export function paresQueCombinam(): [Fonte, Fonte][] {
	return FONTES.flatMap((titulo) =>
		FONTES.filter((texto) => texto.nome !== titulo.nome && combinar(titulo, texto).combina).map(
			(texto): [Fonte, Fonte] => [titulo, texto]
		)
	);
}

/** Sorteia um par que combina, diferente do atual quando der. */
export function sortearPar(atual?: [string, string], sorteio: () => number = Math.random): [Fonte, Fonte] {
	const pares = paresQueCombinam().filter(([a, b]) => !atual || a.nome !== atual[0] || b.nome !== atual[1]);
	return pares[Math.floor(sorteio() * pares.length)];
}

/** CSS pronto: import do Google Fonts, variáveis e onde aplicar. */
export function cssDasFontes(titulo: Fonte, texto: Fonte): string {
	return [
		`@import url('${urlGoogleFonts([titulo, texto])}');`,
		'',
		':root {',
		`\t--fonte-titulo: ${pilhaCss(titulo)};`,
		`\t--fonte-texto: ${pilhaCss(texto)};`,
		'}',
		'',
		'body {',
		'\tfont-family: var(--fonte-texto);',
		'}',
		'',
		'h1,',
		'h2,',
		'h3 {',
		'\tfont-family: var(--fonte-titulo);',
		'}'
	].join('\n');
}
