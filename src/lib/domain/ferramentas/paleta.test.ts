import { describe, expect, it } from 'vitest';
import {
	CONTRASTE_AA,
	contraste,
	cssDosPapeis,
	PAPEIS,
	sugerirPapeis,
	corAleatoria,
	corDoTexto,
	cssVariables,
	gerarPaleta,
	HARMONIAS,
	hexParaHsl,
	hslParaHex,
	normalizarHex
} from './paleta';

describe('paleta', () => {
	it('normaliza hex', () => {
		expect(normalizarHex('#ABC')).toBe('#aabbcc');
		expect(normalizarHex('5b3cc4')).toBe('#5b3cc4');
		expect(normalizarHex('#12345')).toBeUndefined();
		expect(normalizarHex('xyz')).toBeUndefined();
	});

	it('converte hex e HSL ida e volta', () => {
		for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#5b3cc4', '#f0bf2c', '#808080', '#000000', '#ffffff']) {
			expect(hslParaHex(hexParaHsl(hex))).toBe(hex);
		}
		expect(hexParaHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 });
	});

	it('gera cada harmonia com a base na posição certa', () => {
		const tamanhos = { complementar: 4, analoga: 5, triade: 3, tetrade: 4, 'complementar-dividida': 3, monocromatica: 5 };
		for (const h of HARMONIAS) {
			const cores = gerarPaleta('#ff0000', h);
			expect(cores, h).toHaveLength(tamanhos[h]);
			expect(cores[['analoga', 'monocromatica'].includes(h) ? 2 : 0], h).toBe('#ff0000');
			for (const c of cores) expect(c).toMatch(/^#[0-9a-f]{6}$/);
		}
		expect(gerarPaleta('#ff0000', 'complementar')[2]).toBe('#00ffff');
		expect(gerarPaleta('#ff0000', 'triade')).toEqual(['#ff0000', '#00ff00', '#0000ff']);
	});

	it('calcula contraste e escolhe a cor do texto', () => {
		expect(contraste('#000000', '#ffffff')).toBeCloseTo(21);
		expect(contraste('#777777', '#777777')).toBeCloseTo(1);
		expect(corDoTexto('#f0bf2c')).toBe('#000000');
		expect(corDoTexto('#15121f')).toBe('#ffffff');
	});

	it('exporta CSS variables', () => {
		expect(cssVariables(['#111111', '#222222'])).toBe(':root {\n\t--cor-1: #111111;\n\t--cor-2: #222222;\n}');
	});

	it('sorteia cor válida', () => {
		expect(corAleatoria(() => 0.5)).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe('papéis da paleta', () => {
	it('dá um papel para cada uso, com texto legível nos dois modos', () => {
		for (const base of ['#5b3cc4', '#f0bf2c', '#3d9a4b', '#ffffff', '#000000', '#ff0000']) {
			for (const h of HARMONIAS) {
				for (const modo of ['claro', 'escuro'] as const) {
					const s = sugerirPapeis(gerarPaleta(base, h), base, modo);
					expect(s.map((x) => x.papel)).toEqual(PAPEIS);
					for (const x of s) {
						expect(x.cor).toMatch(/^#[0-9a-f]{6}$/);
						if (x.contraste !== undefined) expect(x.contraste, `${base} ${h} ${modo} ${x.papel}`).toBeGreaterThanOrEqual(CONTRASTE_AA);
					}
				}
			}
		}
	});

	it('usa a base como primária e a cor de matiz mais distante como destaque', () => {
		const cores = gerarPaleta('#ff0000', 'complementar');
		const s = Object.fromEntries(sugerirPapeis(cores, '#ff0000', 'escuro').map((x) => [x.papel, x.cor]));
		expect(s.primaria).toBe('#ff0000');
		expect(hexParaHsl(s.destaque).h).toBeCloseTo(180, 0);
	});

	it('fundo claro no modo claro e escuro no modo escuro', () => {
		const claro = sugerirPapeis(['#5b3cc4'], '#5b3cc4', 'claro')[0].cor;
		const escuro = sugerirPapeis(['#5b3cc4'], '#5b3cc4', 'escuro')[0].cor;
		expect(hexParaHsl(claro).l).toBeGreaterThan(90);
		expect(hexParaHsl(escuro).l).toBeLessThan(15);
	});

	it('exporta CSS dos papéis', () => {
		expect(cssDosPapeis([{ papel: 'fundo', cor: '#ffffff' }])).toBe(':root {\n\t--cor-fundo: #ffffff;\n}');
	});
});
