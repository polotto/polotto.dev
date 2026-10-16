import { describe, expect, it, vi } from 'vitest';
import { buscarPerfilStackOverflow, lerPerfil } from './stackoverflow';

const resposta = {
	items: [{ reputation: 9671, badge_counts: { gold: 2, silver: 42, bronze: 41 } }]
};

describe('perfil do Stack Overflow', () => {
	it('lê reputação e medalhas', () => {
		expect(lerPerfil(resposta)).toEqual({
			reputacao: 9671,
			medalhas: { ouro: 2, prata: 42, bronze: 41 }
		});
	});

	it('resposta sem o usuário vira undefined', () => {
		expect(lerPerfil({ items: [] })).toBeUndefined();
		expect(lerPerfil(null)).toBeUndefined();
	});

	it('falha da API não quebra o build', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const falha = (async () => new Response('', { status: 502 })) as typeof fetch;
		expect(await buscarPerfilStackOverflow(1, falha)).toBeUndefined();
	});
});
