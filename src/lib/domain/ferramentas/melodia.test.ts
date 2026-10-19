import { describe, expect, it } from 'vitest';
import { criarAleatorio, mod12, QUALIDADES, sortearProgressao } from './acordes';
import { escalaDoAcorde, gerarMelodia } from './melodia';
import { reharmonizar, TECNICAS } from './reharmonizacao';

function progressaoSortida(semente: number, completa: boolean) {
	const a = criarAleatorio(semente);
	const p = sortearProgressao(a);
	return completa ? reharmonizar(p, TECNICAS, a).progressao : p;
}

describe('melodia', () => {
	it('cobre a progressão inteira, sem buracos nem sobreposição', () => {
		for (let s = 0; s < 80; s++) {
			const p = progressaoSortida(s, s % 2 === 0);
			const notas = gerarMelodia(p, criarAleatorio(s + 1000));
			const total = p.acordes.reduce((t, a) => t + a.tempos, 0);
			let relogio = 0;
			for (const n of notas) {
				expect(n.inicio).toBeCloseTo(relogio);
				relogio += n.duracao;
			}
			expect(relogio).toBeCloseTo(total);
		}
	});

	it('fica na faixa cantável e sem saltos grandes', () => {
		for (let s = 0; s < 80; s++) {
			const notas = gerarMelodia(progressaoSortida(s, true), criarAleatorio(s));
			notas.forEach((n, i) => {
				expect(n.midi).toBeGreaterThanOrEqual(60);
				expect(n.midi).toBeLessThanOrEqual(79);
				if (i > 0) expect(Math.abs(n.midi - notas[i - 1].midi)).toBeLessThanOrEqual(8);
			});
		}
	});

	it('só usa notas da escala do acorde e põe nota do acorde nos tempos fortes', () => {
		for (let s = 0; s < 80; s++) {
			const p = progressaoSortida(s, s % 2 === 1);
			const notas = gerarMelodia(p, criarAleatorio(s * 7 + 3));
			const inicioDoAcorde: number[] = [];
			let t = 0;
			for (const a of p.acordes) {
				inicioDoAcorde.push(t);
				t += a.tempos;
			}
			for (const n of notas) {
				const a = p.acordes[n.acorde];
				const rel = mod12(n.midi - a.raiz);
				expect(escalaDoAcorde(a, p.tonalidade)).toContain(rel);
				const posNoAcorde = n.inicio - inicioDoAcorde[n.acorde];
				if (posNoAcorde % 2 === 0) {
					expect(QUALIDADES[a.qualidade].intervalos.map(mod12)).toContain(rel);
				}
			}
		}
	});

	it('termina na fundamental ou na terça do último acorde', () => {
		for (let s = 0; s < 60; s++) {
			const p = progressaoSortida(s, false);
			const ultima = gerarMelodia(p, criarAleatorio(s)).at(-1)!;
			const a = p.acordes[p.acordes.length - 1];
			const [, terca] = QUALIDADES[a.qualidade].intervalos;
			expect([0, mod12(terca)]).toContain(mod12(ultima.midi - a.raiz));
		}
	});

	it('mesma semente, mesma melodia; outra semente, outra melodia', () => {
		const p = progressaoSortida(4, false);
		expect(gerarMelodia(p, criarAleatorio(9))).toEqual(gerarMelodia(p, criarAleatorio(9)));
		const diferentes = [10, 11, 12, 13].some(
			(s) => JSON.stringify(gerarMelodia(p, criarAleatorio(s))) !== JSON.stringify(gerarMelodia(p, criarAleatorio(9)))
		);
		expect(diferentes).toBe(true);
	});
});
