// Arquivo MIDI (formato 1) da progressão: uma faixa de acordes, uma de melodia
// e marcadores com a cifra de cada acorde. Abre em qualquer editor de música.

import { cifra, type Progressao } from './acordes';
import type { NotaMelodia } from './melodia';
import type { Voicing } from './voicing';

const TICKS_POR_SEMINIMA = 480;
const PIANO = 0;
const VELOCIDADE_BAIXO = 70;
const VELOCIDADE_ACORDE = 55;
const VELOCIDADE_MELODIA = 90;
const CANAL_ACORDES = 0;
const CANAL_MELODIA = 1;

type Evento = { tick: number; ordem: number; bytes: number[] };

const texto = (s: string) => Array.from(new TextEncoder().encode(s));

function variavel(valor: number): number[] {
	let resto = Math.max(0, Math.round(valor));
	const bytes = [resto & 0x7f];
	while ((resto >>= 7) > 0) bytes.unshift((resto & 0x7f) | 0x80);
	return bytes;
}

const u16 = (n: number) => [(n >> 8) & 0xff, n & 0xff];
const u32 = (n: number) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
const meta = (tipo: number, dados: number[]) => [0xff, tipo, ...variavel(dados.length), ...dados];

function faixa(eventos: Evento[]): number[] {
	// No mesmo instante, o fim de uma nota vem antes do início da seguinte.
	const ordenados = [...eventos].sort((a, b) => a.tick - b.tick || a.ordem - b.ordem);
	const corpo: number[] = [];
	let anterior = 0;
	for (const e of ordenados) {
		corpo.push(...variavel(e.tick - anterior), ...e.bytes);
		anterior = e.tick;
	}
	corpo.push(...variavel(0), ...meta(0x2f, []));
	return [...texto('MTrk'), ...u32(corpo.length), ...corpo];
}

function nota(canal: number, midi: number, inicio: number, fim: number, velocidade: number): Evento[] {
	return [
		{ tick: inicio, ordem: 2, bytes: [0x90 | canal, midi, velocidade] },
		{ tick: fim, ordem: 1, bytes: [0x80 | canal, midi, 0] }
	];
}

const troca = (canal: number): Evento => ({ tick: 0, ordem: 0, bytes: [0xc0 | canal, PIANO] });
const nome = (s: string): Evento => ({ tick: 0, ordem: 0, bytes: meta(0x03, texto(s)) });

export type EntradaMidi = {
	progressao: Progressao;
	vozes: Voicing[];
	melodia: NotaMelodia[];
	bpm: number;
	/** Nomes das faixas, já no idioma da tela. */
	nomes: { acordes: string; melodia: string };
};

export function gerarMidi({ progressao, vozes, melodia, bpm, nomes }: EntradaMidi): Uint8Array {
	const ticks = (tempos: number) => Math.round(tempos * TICKS_POR_SEMINIMA);
	const microssegundos = Math.round(60_000_000 / bpm);

	const andamento: Evento[] = [
		{ tick: 0, ordem: 0, bytes: meta(0x51, [(microssegundos >> 16) & 0xff, (microssegundos >> 8) & 0xff, microssegundos & 0xff]) },
		{ tick: 0, ordem: 0, bytes: meta(0x58, [4, 2, 24, 8]) }
	];

	const acordes: Evento[] = [nome(nomes.acordes), troca(CANAL_ACORDES)];
	let inicio = 0;
	progressao.acordes.forEach((a, i) => {
		const fim = inicio + ticks(a.tempos);
		const marcador = cifra(a, progressao.tonalidade);
		andamento.push({ tick: inicio, ordem: 0, bytes: meta(0x06, texto(marcador)) });
		acordes.push(...nota(CANAL_ACORDES, vozes[i].baixo, inicio, fim, VELOCIDADE_BAIXO));
		for (const m of vozes[i].mao) acordes.push(...nota(CANAL_ACORDES, m, inicio, fim, VELOCIDADE_ACORDE));
		inicio = fim;
	});

	const linha: Evento[] = [nome(nomes.melodia), troca(CANAL_MELODIA)];
	for (const n of melodia) {
		linha.push(...nota(CANAL_MELODIA, n.midi, ticks(n.inicio), ticks(n.inicio + n.duracao), VELOCIDADE_MELODIA));
	}

	const cabecalho = [...texto('MThd'), ...u32(6), ...u16(1), ...u16(3), ...u16(TICKS_POR_SEMINIMA)];
	return Uint8Array.from([...cabecalho, ...faixa(andamento), ...faixa(acordes), ...faixa(linha)]);
}
