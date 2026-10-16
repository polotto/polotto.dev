import { describe, expect, it } from 'vitest';
import { ACOES, ALTURA, EXTRAS, LARGURA, SPRITES } from './Mascote.svelte';

describe('sprites do mascote', () => {
	it.each(ACOES)('%s: dois quadros, todos do tamanho da grade', (acao) => {
		expect(SPRITES[acao]).toHaveLength(2);
		for (const quadro of SPRITES[acao]) {
			expect(quadro).toHaveLength(ALTURA);
			for (const linha of quadro) expect(linha).toHaveLength(LARGURA);
		}
	});

	// Até 8 pixels acima (header) e nada à esquerda (margem do celular).
	it.each(Object.keys(EXTRAS) as (keyof typeof EXTRAS)[])('%s: extras dentro dos limites', (acao) => {
		for (const quadro of EXTRAS[acao] ?? [])
			for (const e of quadro) {
				expect(e.x).toBeGreaterThanOrEqual(0);
				expect(e.y).toBeGreaterThanOrEqual(-8);
			}
	});
});
