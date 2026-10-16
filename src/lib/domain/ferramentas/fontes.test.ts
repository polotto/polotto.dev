import { describe, expect, it } from 'vitest';
import { buscarFonte, CATEGORIAS, combinar, cssDasFontes, FONTES, paresQueCombinam, pilhaCss, sortearPar, urlGoogleFonts } from './fontes';

const f = (nome: string) => buscarFonte(nome)!;

describe('fontes', () => {
	it('lista sem repetição e com categoria conhecida', () => {
		expect(new Set(FONTES.map((f) => f.nome)).size).toBe(FONTES.length);
		for (const f of FONTES) expect(CATEGORIAS).toContain(f.categoria);
	});

	it('monta font-family com reserva', () => {
		expect(pilhaCss(buscarFonte('Lora')!)).toBe("'Lora', serif");
		expect(pilhaCss(buscarFonte('JetBrains Mono')!)).toBe("'JetBrains Mono', monospace");
		expect(buscarFonte('Comic Sans')).toBeUndefined();
	});

	it('monta uma URL do Google Fonts sem repetir família', () => {
		const [playfair, inter, bebas] = ['Playfair Display', 'Inter', 'Bebas Neue'].map((n) => buscarFonte(n)!);
		expect(urlGoogleFonts([playfair, inter, inter, bebas])).toBe(
			'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;700&family=Bebas+Neue&display=swap'
		);
	});
});

describe('combinação de fontes', () => {
	it('segue as regras', () => {
		expect(combinar(f('Playfair Display'), f('Inter'))).toEqual({ combina: true, regra: 'contraste' });
		expect(combinar(f('Bebas Neue'), f('Lora'))).toEqual({ combina: true, regra: 'contraste' });
		expect(combinar(f('Inter'), f('Inter'))).toEqual({ combina: true, regra: 'mesma-fonte' });
		expect(combinar(f('IBM Plex Mono'), f('IBM Plex Sans'))).toEqual({ combina: true, regra: 'superfamilia' });
		expect(combinar(f('Poppins'), f('Inter'))).toEqual({ combina: false, regra: 'mesma-categoria' });
		expect(combinar(f('Lora'), f('Merriweather'))).toEqual({ combina: false, regra: 'mesma-categoria' });
		expect(combinar(f('Inter'), f('Bebas Neue'))).toEqual({ combina: false, regra: 'texto-sem-leitura' });
		expect(combinar(f('Inter'), f('JetBrains Mono'))).toEqual({ combina: false, regra: 'texto-sem-leitura' });
	});

	it('sorteio só devolve par que combina e muda o par atual', () => {
		expect(paresQueCombinam().length).toBeGreaterThan(50);
		for (let i = 0; i < 200; i++) {
			const [a, b] = sortearPar(['Playfair Display', 'Inter']);
			expect(combinar(a, b).combina).toBe(true);
			expect(a.nome === 'Playfair Display' && b.nome === 'Inter').toBe(false);
		}
	});

	it('gera CSS com import, variáveis e aplicação', () => {
		const css = cssDasFontes(f('Playfair Display'), f('Inter'));
		expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;700&display=swap');");
		expect(css).toContain("--fonte-titulo: 'Playfair Display', serif;");
		expect(css).toContain("--fonte-texto: 'Inter', sans-serif;");
		expect(css).toContain('font-family: var(--fonte-titulo);');
	});
});
