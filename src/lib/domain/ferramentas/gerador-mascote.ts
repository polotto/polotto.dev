// Mascote a partir de um texto: o mesmo texto sempre dá o mesmo desenho.
//
// Dois estilos:
// - identicon: grade 5x5 espelhada, como o avatar padrão do GitHub;
// - personagem: sprite 12x17 no estilo do mascote do blog (RPG 16-bit),
//   montado em camadas (rosto e corpo, cabelo, barba, óculos, boné).

import { criarAleatorio } from './aleatorio';

export type Estilo = 'identicon' | 'personagem';

/** Grade de caracteres; cada caractere aponta para uma cor em `cores`. */
export type Desenho = {
	largura: number;
	altura: number;
	grade: string[];
	cores: Record<string, string>;
	fundo?: string;
	/** Borda em células, em volta da grade. */
	margem: number;
};

// cyrb53: hash curto e bem espalhado, bom para semente (não é criptográfico).
export function hash(texto: string): number {
	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;
	for (let i = 0; i < texto.length; i++) {
		const c = texto.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 2654435761);
		h2 = Math.imul(h2 ^ c, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function hsl(h: number, s: number, l: number): string {
	const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
	const canal = (n: number) => {
		const k = (n + h / 30) % 12;
		const v = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		return Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${canal(0)}${canal(8)}${canal(4)}`;
}

const escolher = <T>(lista: readonly T[], r: () => number): T => lista[Math.floor(r() * lista.length)];

export function identicon(texto: string): Desenho {
	const r = criarAleatorio(hash(texto));
	const cor = hsl(r() * 360, 45 + r() * 20, 50 + r() * 10);
	const grade = Array.from({ length: 5 }, () => {
		const metade = Array.from({ length: 3 }, () => (r() < 0.5 ? '#' : '.'));
		return [...metade, metade[1], metade[0]].join('');
	});
	// Grade vazia fica sem graça: acende o centro.
	if (!grade.some((l) => l.includes('#'))) grade[2] = '..#..';
	return { largura: 5, altura: 5, grade, cores: { '#': cor }, fundo: '#f0f0f0', margem: 0.5 };
}

// Camadas do personagem. Em cada camada, '.' deixa ver a de baixo.
// Legenda: s = pele, o = olho, c = cabelo, d = barba, g = óculos, h = boné,
// b = camisa, l = calça, k = sapato.
const ROSTO = [
	'............',
	'...ssssss...',
	'..ssssssss..',
	'..ssssssss..',
	'..ssossoss..',
	'..ssossoss..',
	'..ssssssss..',
	'..ssssssss..',
	'....ssss....'
];
const CORPO = [
	'..bbbbbbbb..',
	'.sbbbbbbbbs.',
	'.sbbbbbbbbs.',
	'..bbbbbbbb..',
	'..llllllll..',
	'..ll....ll..',
	'..ll....ll..',
	'..kk....kk..'
];

const CABELOS: Record<string, string[]> = {
	careca: [],
	curto: ['...cccccc...', '..cccccccc..', '..cccccccc..', '..c......c..'],
	longo: [
		'...cccccc...',
		'..cccccccc..',
		'.cccccccccc.',
		'.cc......cc.',
		'.cc......cc.',
		'.cc......cc.',
		'.cc......cc.',
		'.cc......cc.',
		'.c........c.'
	],
	volumoso: ['..cccccccc..', '.cccccccccc.', '.cccccccccc.', '.cc......cc.', '.c........c.'],
	moicano: ['.....cc.....', '....cccc....', '.....cc.....'],
	coque: ['.....cc.....', '...cccccc...', '..cccccccc..', '..c......c..']
};

const BARBAS: Record<string, string[]> = {
	nenhuma: [],
	bigode: ['', '', '', '', '', '', '....dddd....'],
	cavanhaque: ['', '', '', '', '', '', '....dddd....', '.....dd.....'],
	cheia: ['', '', '', '', '', '', '..dddddddd..', '..dddddddd..', '....dddd....']
};

const OCULOS = ['', '', '', '', '...g.gg.g...', '...g.gg.g...'];
// joelho para baixo de fora: a segunda fileira das pernas vira pele
const BERMUDA = ['', '', '', '', '', '', '..ss....ss..'];
const BONE = ['...hhhhhh...', '..hhhhhhhh..', '..hhhhhhhhhh'];

const PELES = ['#f6d3b3', '#e2a77a', '#c68642', '#8d5524', '#5c3a21'];
const CORES_CABELO = ['#1c1410', '#4a2b19', '#8a5832', '#d9a441', '#b5651d', '#c8c8d2'];
const CALCAS = ['#2d3b6e', '#3b3b48', '#5a4632', '#2f5d50'];

function sobrepor(base: string[], camada: string[], inicio = 0): string[] {
	return base.map((linha, y) => {
		const cima = camada[y - inicio];
		if (!cima) return linha;
		return [...linha].map((c, x) => (cima[x] && cima[x] !== '.' ? cima[x] : c)).join('');
	});
}

export function personagem(texto: string): Desenho {
	const r = criarAleatorio(hash(texto));
	const cabelo = escolher(Object.keys(CABELOS), r);
	const barba = escolher(['nenhuma', 'nenhuma', 'bigode', 'cavanhaque', 'cheia', 'cheia'], r);
	const oculos = r() < 0.25;
	const bone = r() < 0.2;
	const corCabelo = escolher(CORES_CABELO, r);
	const bermuda = r() < 0.3;

	let grade = [...ROSTO, ...CORPO];
	grade = sobrepor(grade, CABELOS[cabelo]);
	grade = sobrepor(grade, BARBAS[barba]);
	if (oculos) grade = sobrepor(grade, OCULOS);
	if (bone) grade = sobrepor(grade, BONE);
	if (bermuda) grade = sobrepor(grade, BERMUDA, ROSTO.length);

	return {
		largura: 12,
		altura: grade.length,
		grade,
		cores: {
			s: escolher(PELES, r),
			o: '#1c1828',
			c: corCabelo,
			d: corCabelo,
			g: '#5a5478',
			h: hsl(r() * 360, 65, 50),
			b: hsl(r() * 360, 60 + r() * 20, 45 + r() * 10),
			l: escolher(CALCAS, r),
			k: '#28283a'
		},
		margem: 1
	};
}

export function gerarMascote(texto: string, estilo: Estilo): Desenho {
	return estilo === 'identicon' ? identicon(texto) : personagem(texto);
}

/** Altura em pixels para a largura dada, contando a margem. */
export function alturaPara(d: Desenho, largura: number): number {
	return Math.round((largura * (d.altura + 2 * d.margem)) / (d.largura + 2 * d.margem));
}

/** SVG com pixels vizinhos da mesma cor juntos numa fileira. */
export function desenhoParaSvg(d: Desenho, tamanho: number): string {
	const lado = d.largura + 2 * d.margem;
	const alto = d.altura + 2 * d.margem;
	const rects: string[] = [];
	if (d.fundo) rects.push(`<rect x="0" y="0" width="${lado}" height="${alto}" fill="${d.fundo}"/>`);
	d.grade.forEach((linha, y) => {
		for (let x = 0; x < linha.length; ) {
			const c = linha[x];
			let fim = x + 1;
			while (linha[fim] === c) fim++;
			const cor = d.cores[c];
			if (cor) rects.push(`<rect x="${x + d.margem}" y="${y + d.margem}" width="${fim - x}" height="1" fill="${cor}"/>`);
			x = fim;
		}
	});
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${alturaPara(d, tamanho)}" viewBox="0 0 ${lado} ${alto}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}

/** Texto aleatório para semente, quando a pessoa só quer um mascote qualquer. */
export function textoAleatorio(sorteio: () => number = Math.random): string {
	return Math.floor(sorteio() * 2 ** 40).toString(36);
}
