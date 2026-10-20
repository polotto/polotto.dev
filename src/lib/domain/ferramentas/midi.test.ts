import { describe, expect, it } from 'vitest';
import { criarAleatorio, sortearProgressao } from './acordes';
import { gerarMelodia } from './melodia';
import { gerarMidi } from './midi';
import { voicings } from './voicing';

type Faixa = { eventos: { tick: number; tipo: string; dados: number[] }[]; fim: number };

function ler(b: Uint8Array) {
	let p = 0;
	const u8 = () => b[p++];
	const u16 = () => (u8() << 8) | u8();
	const u32 = () => ((u8() << 24) | (u8() << 16) | (u8() << 8) | u8()) >>> 0;
	const txt = (n: number) => String.fromCharCode(...b.slice(p, (p += n)));
	const variavel = () => {
		let v = 0;
		let x: number;
		do {
			x = u8();
			v = (v << 7) | (x & 0x7f);
		} while (x & 0x80);
		return v;
	};
	expect(txt(4)).toBe('MThd');
	expect(u32()).toBe(6);
	const formato = u16();
	const n = u16();
	const divisao = u16();
	const faixas: Faixa[] = [];
	for (let f = 0; f < n; f++) {
		expect(txt(4)).toBe('MTrk');
		const tam = u32();
		const fimFaixa = p + tam;
		const eventos: Faixa['eventos'] = [];
		let tick = 0;
		let status = 0;
		while (p < fimFaixa) {
			tick += variavel();
			if (b[p] === 0xff) {
				p++;
				const tipo = u8();
				const len = variavel();
				eventos.push({ tick, tipo: `meta${tipo}`, dados: Array.from(b.slice(p, p + len)) });
				p += len;
			} else {
				status = u8();
				const tamanho = (status & 0xf0) === 0xc0 ? 1 : 2;
				const dados = Array.from(b.slice(p, p + tamanho));
				p += tamanho;
				const tipo = (status & 0xf0) === 0x90 && dados[1] > 0 ? 'on' : (status & 0xf0) === 0x80 || (status & 0xf0) === 0x90 ? 'off' : 'prog';
				eventos.push({ tick, tipo, dados });
			}
		}
		expect(p).toBe(fimFaixa);
		faixas.push({ eventos, fim: tick });
	}
	expect(p).toBe(b.length);
	return { formato, divisao, faixas };
}

describe('arquivo MIDI', () => {
	const progressao = sortearProgressao(criarAleatorio(7), { tonica: 0, modo: 'maior', compassos: 4 });
	const vozes = voicings(progressao);
	const melodia = gerarMelodia(progressao, criarAleatorio(3));
	const midi = ler(gerarMidi({ progressao, vozes, melodia, bpm: 100, nomes: { acordes: 'Acordes', melodia: 'Melodia' } }));

	it('tem cabeçalho, andamento e três faixas', () => {
		expect(midi.formato).toBe(1);
		expect(midi.divisao).toBe(480);
		expect(midi.faixas).toHaveLength(3);
		const tempo = midi.faixas[0].eventos.find((e) => e.tipo === 'meta81')!;
		expect((tempo.dados[0] << 16) | (tempo.dados[1] << 8) | tempo.dados[2]).toBe(600000);
	});

	it('uma nota ligada para cada desligada, com a melodia inteira', () => {
		for (const f of midi.faixas.slice(1)) {
			const ligadas = f.eventos.filter((e) => e.tipo === 'on').length;
			expect(f.eventos.filter((e) => e.tipo === 'off').length).toBe(ligadas);
		}
		expect(midi.faixas[2].eventos.filter((e) => e.tipo === 'on')).toHaveLength(melodia.length);
		const acordes = progressao.acordes.reduce((s, _, i) => s + 1 + vozes[i].mao.length, 0);
		expect(midi.faixas[1].eventos.filter((e) => e.tipo === 'on')).toHaveLength(acordes);
	});

	it('a duração bate com a progressão e cada acorde vira um marcador', () => {
		const total = progressao.acordes.reduce((s, a) => s + a.tempos, 0) * 480;
		expect(midi.faixas[1].fim).toBe(total);
		expect(midi.faixas[0].eventos.filter((e) => e.tipo === 'meta6')).toHaveLength(progressao.acordes.length);
	});

	it('notas dentro do intervalo MIDI', () => {
		for (const f of midi.faixas.slice(1)) {
			for (const e of f.eventos.filter((x) => x.tipo === 'on')) expect(e.dados[0]).toBeGreaterThanOrEqual(0), expect(e.dados[0]).toBeLessThan(128);
		}
	});
});
