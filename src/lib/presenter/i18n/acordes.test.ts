import { describe, expect, it } from 'vitest';
import { TECNICAS } from '$lib/domain/ferramentas/reharmonizacao';
import { t } from './i18n';

// A página chama t() com o id de qualquer técnica: chave ausente derruba a tela.
describe('i18n do gerador de acordes', () => {
	it('toda técnica tem nome', () => {
		for (const id of TECNICAS) expect(() => t(`tools.acordes.tecnica.${id}.nome`), id).not.toThrow();
	});

	it('toda técnica de acorde livre tem descrição e referência para ouvir', () => {
		for (const id of TECNICAS.filter((x) => x !== 'pedal' && x !== 'baixo-descendente')) {
			expect(() => t(`tools.acordes.tecnica.${id}.descricao`), id).not.toThrow();
			expect(() => t(`tools.acordes.tecnica.${id}.ouvir`), id).not.toThrow();
		}
	});

	it('as opções de baixo têm nome e descrição', () => {
		for (const b of ['nenhum', 'baixo-descendente', 'pedal']) {
			expect(() => t(`tools.acordes.baixo.${b}.nome`), b).not.toThrow();
			expect(() => t(`tools.acordes.baixo.${b}.descricao`), b).not.toThrow();
		}
	});
});
