import { describe, expect, it } from 'vitest';
import { desenhoParaSvg, gerarMascote, hash, identicon, personagem, textoAleatorio } from './gerador-mascote';

describe('gerador de mascote', () => {
	it('mesmo texto, mesmo desenho; texto diferente, desenho diferente', () => {
		expect(identicon('polotto')).toEqual(identicon('polotto'));
		expect(personagem('polotto')).toEqual(personagem('polotto'));
		expect(hash('a')).not.toBe(hash('b'));
		const vistos = new Set(Array.from({ length: 50 }, (_, i) => JSON.stringify(personagem(`p${i}`))));
		expect(vistos.size).toBeGreaterThan(45);
	});

	it('identicon é 5x5 espelhado e nunca vazio', () => {
		for (let i = 0; i < 100; i++) {
			const d = identicon(`t${i}`);
			expect(d.grade).toHaveLength(5);
			for (const linha of d.grade) {
				expect(linha).toMatch(/^[#.]{5}$/);
				expect(linha).toBe([...linha].reverse().join(''));
			}
			expect(d.grade.join('')).toContain('#');
		}
	});

	it('personagem tem 12x17 e só caracteres com cor', () => {
		for (let i = 0; i < 100; i++) {
			const d = gerarMascote(`t${i}`, 'personagem');
			expect(d.grade).toHaveLength(17);
			for (const linha of d.grade) {
				expect(linha).toHaveLength(12);
				for (const c of linha) if (c !== '.') expect(d.cores[c], c).toMatch(/^#[0-9a-f]{6}$/);
			}
		}
	});

	it('gera SVG com fundo, margem e proporção', () => {
		const svg = desenhoParaSvg(identicon('x'), 420);
		expect(svg).toContain('width="420" height="420" viewBox="0 0 6 6"');
		expect(svg).toContain('fill="#f0f0f0"');
		const p = desenhoParaSvg(personagem('x'), 280);
		expect(p).toContain('width="280" height="380" viewBox="0 0 14 19"');
	});

	it('texto aleatório não é vazio', () => {
		expect(textoAleatorio(() => 0.5).length).toBeGreaterThan(0);
	});
});
