// Acordes, tonalidade e sorteio de progressão. Regra pura: sem navegador,
// sem som. Notas são classes de altura (0 = dó ... 11 = si).

import { criarAleatorio, type Aleatorio } from './aleatorio';

export { criarAleatorio, type Aleatorio };

export type Modo = 'maior' | 'menor';

/** Intervalos em semitons a partir da fundamental e sufixo na cifra brasileira. */
export const QUALIDADES = {
	maior: { intervalos: [0, 4, 7], sufixo: '' },
	menor: { intervalos: [0, 3, 7], sufixo: 'm' },
	sexta: { intervalos: [0, 4, 7, 9], sufixo: '6' },
	dom7: { intervalos: [0, 4, 7, 10], sufixo: '7' },
	maj7: { intervalos: [0, 4, 7, 11], sufixo: '7M' },
	min7: { intervalos: [0, 3, 7, 10], sufixo: 'm7' },
	m7b5: { intervalos: [0, 3, 6, 10], sufixo: 'm7(b5)' },
	dim7: { intervalos: [0, 3, 6, 9], sufixo: 'dim' },
	min6: { intervalos: [0, 3, 7, 9], sufixo: 'm6' },
	mmaj7: { intervalos: [0, 3, 7, 11], sufixo: 'm(7M)' },
	maj9: { intervalos: [0, 4, 7, 11, 14], sufixo: '7M(9)' },
	maj7s11: { intervalos: [0, 4, 7, 11, 18], sufixo: '7M(#11)' },
	min9: { intervalos: [0, 3, 7, 10, 14], sufixo: 'm9' },
	dom9: { intervalos: [0, 4, 7, 10, 14], sufixo: '9' },
	dom13: { intervalos: [0, 4, 7, 10, 14, 21], sufixo: '13' },
	dom7b9: { intervalos: [0, 4, 7, 10, 13], sufixo: '7(b9)' },
	dom7s11: { intervalos: [0, 4, 7, 10, 18], sufixo: '7(#11)' },
	dom7alt: { intervalos: [0, 4, 10, 15, 20], sufixo: '7(#9,b13)' },
	dom7sus4: { intervalos: [0, 5, 7, 10], sufixo: '7(sus4)' }
} as const;

export type Qualidade = keyof typeof QUALIDADES;

export type Acorde = {
	raiz: number;
	qualidade: Qualidade;
	/** Nota do baixo quando não é a fundamental (inversão ou pedal). */
	baixo?: number;
	/** Duração em tempos. */
	tempos: number;
	/** Compasso da progressão original a que o acorde pertence (0, 1, ...). */
	compasso: number;
	/** Técnicas de reharmonização que mexeram neste acorde. */
	tecnicas: string[];
};

export type Tonalidade = { tonica: number; modo: Modo };

export type Progressao = { tonalidade: Tonalidade; acordes: Acorde[] };

export const ESCALA: Record<Modo, readonly number[]> = {
	maior: [0, 2, 4, 5, 7, 9, 11],
	menor: [0, 2, 3, 5, 7, 8, 10]
};

const NOTAS_SUSTENIDO = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTAS_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
// Tonalidades maiores que ficam melhor escritas com bemol (F, Bb, Eb, Ab, Db).
const MAIORES_COM_BEMOL = new Set([1, 3, 5, 8, 10]);

export const mod12 = (n: number) => ((n % 12) + 12) % 12;

export function usaBemol(t: Tonalidade): boolean {
	const relativaMaior = t.modo === 'maior' ? t.tonica : mod12(t.tonica + 3);
	return MAIORES_COM_BEMOL.has(relativaMaior);
}

export function nomeNota(pc: number, bemol: boolean): string {
	return (bemol ? NOTAS_BEMOL : NOTAS_SUSTENIDO)[mod12(pc)];
}

/** Nome com oitava de uma nota MIDI (60 = C4). */
export function nomeMidi(midi: number, bemol: boolean): string {
	return `${nomeNota(midi, bemol)}${Math.floor(midi / 12) - 1}`;
}

/**
 * Grafia da nota na tonalidade: bII, bIII, bVI e bVII saem em bemol (Db7, Bb7),
 * diminuto de passagem em sustenido (C#dim) e o resto segue a armadura.
 */
export function nomeRaiz(pc: number, t: Tonalidade, diminuto = false): string {
	const g = mod12(pc - t.tonica);
	if (diminuto) return nomeNota(pc, false);
	if (g === 1 || g === 3 || g === 8 || g === 10) return nomeNota(pc, true);
	return nomeNota(pc, usaBemol(t));
}

export function cifra(a: Acorde, t: Tonalidade): string {
	const base = `${nomeRaiz(a.raiz, t, a.qualidade === 'dim7')}${QUALIDADES[a.qualidade].sufixo}`;
	return a.baixo === undefined || a.baixo === a.raiz ? base : `${base}/${nomeRaiz(a.baixo, t)}`;
}

export function nomeTonalidade(t: Tonalidade): string {
	return `${nomeNota(t.tonica, usaBemol(t))}${t.modo === 'menor' ? 'm' : ''}`;
}

/** Classes de altura do acorde, na ordem dos intervalos (a fundamental primeiro). */
export function notasDoAcorde(a: Acorde): number[] {
	return QUALIDADES[a.qualidade].intervalos.map((i) => mod12(a.raiz + i));
}

/** Grau em semitons acima da tônica. */
export const grau = (a: Acorde, t: Tonalidade) => mod12(a.raiz - t.tonica);

export const ehDominante = (q: Qualidade) => q.startsWith('dom');
export const ehMenor = (q: Qualidade) =>
	q === 'menor' || q === 'min7' || q === 'min9' || q === 'min6' || q === 'm7b5' || q === 'mmaj7';

export function novoAcorde(raiz: number, qualidade: Qualidade, compasso: number, tempos = 4): Acorde {
	return { raiz: mod12(raiz), qualidade, tempos, compasso, tecnicas: [] };
}

/** Compassos da progressão, cada um com as cifras que cabem nele. */
export function cifrasPorCompasso(p: Progressao): string[][] {
	const compassos: string[][] = [];
	for (const a of p.acordes) (compassos[a.compasso] ??= []).push(cifra(a, p.tonalidade));
	return compassos.filter(Boolean);
}

export function cifraEmTexto(p: Progressao): string {
	return `| ${cifrasPorCompasso(p)
		.map((c) => c.join(' '))
		.join(' | ')} |`;
}

export const inteiro = (n: number, a: Aleatorio) => Math.floor(a() * n);
export const sortearItem = <T>(itens: readonly T[], a: Aleatorio): T => itens[inteiro(itens.length, a)];

/** Cada item: semitons acima da tônica e qualidade. Um acorde por compasso. */
type Molde = { id: string; modo: Modo; graus: readonly (readonly [number, Qualidade])[] };

export const MOLDES: readonly Molde[] = [
	{ id: 'I-vi-ii-V', modo: 'maior', graus: [[0, 'maior'], [9, 'menor'], [2, 'menor'], [7, 'dom7']] },
	{ id: 'ii-V-I-vi', modo: 'maior', graus: [[2, 'menor'], [7, 'dom7'], [0, 'maior'], [9, 'menor']] },
	{ id: 'I-IV-V-I', modo: 'maior', graus: [[0, 'maior'], [5, 'maior'], [7, 'dom7'], [0, 'maior']] },
	{ id: 'vi-IV-I-V', modo: 'maior', graus: [[9, 'menor'], [5, 'maior'], [0, 'maior'], [7, 'dom7']] },
	{ id: 'I-iii-IV-V', modo: 'maior', graus: [[0, 'maior'], [4, 'menor'], [5, 'maior'], [7, 'dom7']] },
	{ id: 'I-IV-vi-V', modo: 'maior', graus: [[0, 'maior'], [5, 'maior'], [9, 'menor'], [7, 'dom7']] },
	{
		id: 'I-vi-ii-V-iii-VI-ii-V',
		modo: 'maior',
		graus: [[0, 'maior'], [9, 'menor'], [2, 'menor'], [7, 'dom7'], [4, 'menor'], [9, 'dom7'], [2, 'menor'], [7, 'dom7']]
	},
	{
		id: 'I-V-vi-iii-IV-I-IV-V',
		modo: 'maior',
		graus: [[0, 'maior'], [7, 'maior'], [9, 'menor'], [4, 'menor'], [5, 'maior'], [0, 'maior'], [5, 'maior'], [7, 'dom7']]
	},
	{ id: 'i-iv-V-i', modo: 'menor', graus: [[0, 'menor'], [5, 'menor'], [7, 'dom7'], [0, 'menor']] },
	{ id: 'i-VI-III-VII', modo: 'menor', graus: [[0, 'menor'], [8, 'maior'], [3, 'maior'], [10, 'maior']] },
	{ id: 'i-VII-VI-V', modo: 'menor', graus: [[0, 'menor'], [10, 'maior'], [8, 'maior'], [7, 'dom7']] },
	{ id: 'i-iv-VII-III', modo: 'menor', graus: [[0, 'menor'], [5, 'menor'], [10, 'maior'], [3, 'maior']] },
	{ id: 'iiø-V-i-i', modo: 'menor', graus: [[2, 'm7b5'], [7, 'dom7'], [0, 'menor'], [0, 'menor']] },
	{
		id: 'i-iv-VII-III-VI-iiø-V-i',
		modo: 'menor',
		graus: [[0, 'menor'], [5, 'menor'], [10, 'maior'], [3, 'maior'], [8, 'maior'], [2, 'm7b5'], [7, 'dom7'], [0, 'menor']]
	}
];

export type OpcoesSorteio = {
	/** Tônica fixa; sem ela, sorteia. */
	tonica?: number;
	/** Modo fixo; sem ele, sorteia. */
	modo?: Modo;
	/** Quantidade de compassos (4 ou 8); sem ela, sorteia. */
	compassos?: 4 | 8;
};

export function sortearProgressao(a: Aleatorio, op: OpcoesSorteio = {}): Progressao & { molde: string } {
	const modo = op.modo ?? (a() < 0.5 ? 'maior' : 'menor');
	const tonica = op.tonica ?? inteiro(12, a);
	const moldes = MOLDES.filter((m) => m.modo === modo && (!op.compassos || m.graus.length === op.compassos));
	const molde = sortearItem(moldes, a);
	return {
		tonalidade: { tonica, modo },
		molde: molde.id,
		acordes: molde.graus.map(([g, q], i) => novoAcorde(tonica + g, q, i))
	};
}
