// Paleta de cores harmônicas a partir de uma cor base, girando o matiz no
// círculo cromático (HSL). Inclui o contraste WCAG para escolher o texto.

export type Harmonia =
	| 'complementar'
	| 'analoga'
	| 'triade'
	| 'tetrade'
	| 'complementar-dividida'
	| 'monocromatica';

export const HARMONIAS: Harmonia[] = [
	'complementar',
	'analoga',
	'triade',
	'tetrade',
	'complementar-dividida',
	'monocromatica'
];

type Hsl = { h: number; s: number; l: number };

/** `#abc` ou `#aabbcc`, com ou sem `#`. Devolve `#aabbcc` minúsculo. */
export function normalizarHex(texto: string): string | undefined {
	const m = texto.trim().replace(/^#/, '').toLowerCase();
	if (/^[0-9a-f]{3}$/.test(m)) return `#${[...m].map((c) => c + c).join('')}`;
	if (/^[0-9a-f]{6}$/.test(m)) return `#${m}`;
	return undefined;
}

function rgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexParaHsl(hex: string): Hsl {
	const [r, g, b] = rgb(hex).map((v) => v / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	const d = max - min;
	if (d === 0) return { h: 0, s: 0, l: l * 100 };
	const s = d / (1 - Math.abs(2 * l - 1));
	const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}

export function hslParaHex({ h, s, l }: Hsl): string {
	const sn = s / 100;
	const ln = l / 100;
	const a = sn * Math.min(ln, 1 - ln);
	const canal = (n: number) => {
		const k = (n + h / 30) % 12;
		const v = ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${canal(0)}${canal(8)}${canal(4)}`;
}

const girar = (c: Hsl, graus: number): Hsl => ({ ...c, h: (c.h + graus + 360) % 360 });
const limitar = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Cores da harmonia. A base vem primeiro, menos na análoga e na
 * monocromática, que ficam na ordem do degradê com a base no meio.
 */
export function gerarPaleta(base: string, harmonia: Harmonia): string[] {
	const c = hexParaHsl(base);
	const cores: Hsl[] = {
		complementar: [c, { ...c, l: limitar(c.l + 20) }, girar(c, 180), { ...girar(c, 180), l: limitar(c.l - 20) }],
		analoga: [girar(c, -60), girar(c, -30), c, girar(c, 30), girar(c, 60)],
		triade: [c, girar(c, 120), girar(c, 240)],
		tetrade: [c, girar(c, 90), girar(c, 180), girar(c, 270)],
		'complementar-dividida': [c, girar(c, 150), girar(c, 210)],
		monocromatica: [-30, -15, 0, 15, 30].map((d) => ({ ...c, l: limitar(c.l + d) }))
	}[harmonia];
	return cores.map(hslParaHex);
}

function luminancia(hex: string): number {
	const [r, g, b] = rgb(hex).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores (1 a 21). */
export function contraste(a: string, b: string): number {
	const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
	return (l1 + 0.05) / (l2 + 0.05);
}

/** Preto ou branco, o que tiver mais contraste sobre a cor. */
export function corDoTexto(fundo: string): '#000000' | '#ffffff' {
	return contraste(fundo, '#000000') >= contraste(fundo, '#ffffff') ? '#000000' : '#ffffff';
}

export function cssVariables(cores: string[], prefixo = 'cor'): string {
	return `:root {\n${cores.map((c, i) => `\t--${prefixo}-${i + 1}: ${c};`).join('\n')}\n}`;
}

export function corAleatoria(sorteio: () => number = Math.random): string {
	// Saturação e luminosidade no meio, para não sair cinza nem quase preto.
	return hslParaHex({ h: sorteio() * 360, s: 55 + sorteio() * 30, l: 45 + sorteio() * 15 });
}

// Sugestão de onde usar cada cor numa interface.
//
// A base vira a cor primária (botão principal). A cor da paleta com matiz
// mais distante da base vira o destaque (link, botão secundário, foco).
// Fundo, superfície, borda e texto saem da base quase sem saturação, para a
// interface puxar para a cor da marca sem brigar com ela. Texto e destaque
// são ajustados até passar no contraste WCAG AA (4,5:1) sobre o fundo.

export type Modo = 'claro' | 'escuro';

export type Papel =
	| 'fundo'
	| 'superficie'
	| 'borda'
	| 'texto'
	| 'texto-secundario'
	| 'primaria'
	| 'texto-primaria'
	| 'destaque';

export const PAPEIS: Papel[] = [
	'fundo',
	'superficie',
	'borda',
	'texto',
	'texto-secundario',
	'primaria',
	'texto-primaria',
	'destaque'
];

/** Contraste mínimo do WCAG AA para texto normal. */
export const CONTRASTE_AA = 4.5;

export type Sugestao = {
	papel: Papel;
	cor: string;
	/** Contraste com a cor onde ela aparece (fundo ou primária). Só para texto. */
	contraste?: number;
};

const distanciaMatiz = (a: number, b: number) => {
	const d = Math.abs(a - b) % 360;
	return d > 180 ? 360 - d : d;
};

/** Escurece (modo claro) ou clareia (modo escuro) até ter contraste com o fundo. */
function garantirContraste(cor: string, fundo: string, modo: Modo, minimo = CONTRASTE_AA): string {
	const c = hexParaHsl(cor);
	for (let l = c.l; l >= 0 && l <= 100; l += modo === 'claro' ? -2 : 2) {
		const hex = hslParaHex({ ...c, l });
		if (contraste(hex, fundo) >= minimo) return hex;
	}
	return modo === 'claro' ? '#000000' : '#ffffff';
}

export function sugerirPapeis(cores: string[], base: string, modo: Modo): Sugestao[] {
	const b = hexParaHsl(base);
	const neutra = (s: number, l: number) => hslParaHex({ h: b.h, s: Math.min(b.s, s), l });
	const claro = modo === 'claro';

	const fundo = claro ? neutra(25, 97) : neutra(25, 9);
	const superficie = claro ? neutra(25, 92) : neutra(25, 14);
	const borda = claro ? neutra(15, 80) : neutra(15, 28);
	const texto = claro ? neutra(25, 12) : neutra(15, 92);
	const textoSecundario = garantirContraste(claro ? neutra(15, 40) : neutra(15, 68), fundo, modo);

	const outras = cores.filter((c) => c !== base);
	const maisDistante = outras.reduce<string | undefined>(
		(melhor, c) =>
			!melhor || distanciaMatiz(hexParaHsl(c).h, b.h) > distanciaMatiz(hexParaHsl(melhor).h, b.h) ? c : melhor,
		undefined
	);
	// Na monocromática o matiz é o mesmo: o destaque é a própria base.
	const destaque = garantirContraste(maisDistante && distanciaMatiz(hexParaHsl(maisDistante).h, b.h) > 10 ? maisDistante : base, fundo, modo);
	const textoPrimaria = corDoTexto(base);

	return [
		{ papel: 'fundo', cor: fundo },
		{ papel: 'superficie', cor: superficie },
		{ papel: 'borda', cor: borda },
		{ papel: 'texto', cor: texto, contraste: contraste(texto, fundo) },
		{ papel: 'texto-secundario', cor: textoSecundario, contraste: contraste(textoSecundario, fundo) },
		{ papel: 'primaria', cor: base },
		{ papel: 'texto-primaria', cor: textoPrimaria, contraste: contraste(textoPrimaria, base) },
		{ papel: 'destaque', cor: destaque, contraste: contraste(destaque, fundo) }
	];
}

export function cssDosPapeis(sugestoes: Sugestao[]): string {
	return `:root {\n${sugestoes.map((s) => `\t--cor-${s.papel}: ${s.cor};`).join('\n')}\n}`;
}
