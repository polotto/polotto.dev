import { describe, expect, it } from 'vitest';
import { criarAleatorio, mod12, novoAcorde, sortearProgressao, type Progressao } from './acordes';
import { notasMaoDireita, voicingDoAcorde, voicings } from './voicing';

describe('voicing', () => {
	it('acorde grande perde quinta e fundamental na mão direita', () => {
		expect(notasMaoDireita(novoAcorde(7, 'dom13', 0)).sort((a, b) => a - b)).toEqual([4, 5, 9, 11]); // G13: E F A B
		expect(notasMaoDireita(novoAcorde(0, 'maior', 0))).toEqual([0, 4, 7]);
		// Com a fundamental fora do baixo, ela fica.
		expect(notasMaoDireita({ ...novoAcorde(7, 'dom13', 0), baixo: 11 })).toContain(7);
	});

	it('o baixo toca a fundamental e respeita a inversão', () => {
		expect(mod12(voicingDoAcorde(novoAcorde(9, 'menor', 0)).baixo)).toBe(9);
		expect(mod12(voicingDoAcorde({ ...novoAcorde(2, 'menor', 0), baixo: 5 }).baixo)).toBe(5);
	});

	it('a mão direita fica em ordem crescente e dentro da faixa', () => {
		for (let s = 0; s < 60; s++) {
			const p = sortearProgressao(criarAleatorio(s));
			for (const v of voicings(p)) {
				expect(v.baixo).toBeGreaterThanOrEqual(36);
				expect(v.baixo).toBeLessThanOrEqual(52);
				expect([...v.mao].sort((a, b) => a - b)).toEqual(v.mao);
				expect(v.mao[0]).toBeGreaterThanOrEqual(52);
				expect(v.mao[v.mao.length - 1]).toBeLessThanOrEqual(79);
			}
		}
	});

	it('toca exatamente as notas do acorde', () => {
		const a = novoAcorde(0, 'maj7', 0);
		const { mao } = voicingDoAcorde(a);
		expect(new Set(mao.map(mod12))).toEqual(new Set([0, 4, 7, 11]));
	});

	it('conduz as vozes: de um acorde a outro o centro quase não se move', () => {
		const p: Progressao = {
			tonalidade: { tonica: 0, modo: 'maior' },
			acordes: [novoAcorde(2, 'min7', 0), novoAcorde(7, 'dom7', 1), novoAcorde(0, 'maj7', 2)]
		};
		const v = voicings(p);
		const centro = (n: number[]) => n.reduce((s, x) => s + x, 0) / n.length;
		expect(Math.abs(centro(v[1].mao) - centro(v[0].mao))).toBeLessThan(4);
		expect(Math.abs(centro(v[2].mao) - centro(v[1].mao))).toBeLessThan(4);
	});
});
