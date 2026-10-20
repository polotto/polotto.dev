import { describe, expect, it } from 'vitest';
import { criarAleatorio, sortearProgressao } from './acordes';
import { codificar, decodificar, tecnicasSemPosicao, type Configuracao } from './compartilhar';
import { gerarMelodia } from './melodia';
import { reharmonizar } from './reharmonizacao';

const base: Configuracao = {
	sementeProgressao: 7,
	sementeReharmonizacao: 999999,
	sementeMelodia: 3,
	modo: 'maior',
	tonica: 0,
	compassos: 4,
	tecnicas: ['ii-v', 'extensoes'],
	baixo: 'nenhum',
	versao: 'reharmonizada',
	bpm: 88,
	comMelodia: true,
	repetir: false
};

describe('semente para compartilhar', () => {
	it('ida e volta devolve a mesma configuração', () => {
		const volta = decodificar(codificar(base));
		expect(volta).toEqual({ ...base, tecnicas: ['extensoes', 'ii-v'] });
		const outra: Configuracao = { ...base, modo: 'qualquer', tonica: 'qualquer', compassos: 8, baixo: 'pedal', versao: 'original', bpm: 160, tecnicas: [] };
		expect(decodificar(codificar(outra))).toEqual(outra);
		expect(decodificar(codificar({ ...base, tonica: 11 }))?.tonica).toBe(11);
	});

	it('o código é curto e aceita link inteiro', () => {
		const c = codificar(base);
		expect(c.length).toBeLessThan(40);
		expect(decodificar(`https://polotto.dev/ferramentas/acordes#s=${c}`)).toEqual(decodificar(c));
		expect(decodificar(`  ${c.toUpperCase()}\n`)).toEqual(decodificar(c));
	});

	it('rejeita código inválido', () => {
		const c = codificar(base);
		for (const ruim of ['', 'abc', c + '-1', c.replace(/^1/, '2'), c.replace('-m-', '-z-'), c.replace(/-2g-/, '-1-'), 'x' + c]) {
			expect(decodificar(ruim), ruim).toBeUndefined();
		}
		expect(decodificar(codificar({ ...base, bpm: 49 }))).toBeUndefined();
		expect(decodificar(codificar({ ...base, sementeMelodia: 2 ** 33 }))).toBeUndefined();
	});

	it('toda técnica de acorde livre tem posição no código', () => {
		expect(tecnicasSemPosicao()).toEqual([]);
	});

	it('o código reproduz a mesma música', () => {
		const musica = (c: Configuracao) => {
			const o = sortearProgressao(criarAleatorio(c.sementeProgressao), {
				modo: c.modo === 'qualquer' ? undefined : c.modo,
				tonica: c.tonica === 'qualquer' ? undefined : c.tonica,
				compassos: c.compassos
			});
			const r = reharmonizar(o, [...c.tecnicas, ...(c.baixo === 'nenhum' ? [] : [c.baixo])], criarAleatorio(c.sementeReharmonizacao)).progressao;
			return { r, m: gerarMelodia(r, criarAleatorio(c.sementeMelodia)) };
		};
		for (const baixo of ['nenhum', 'pedal', 'baixo-descendente'] as const) {
			const c = { ...base, baixo, modo: 'qualquer' as const, tonica: 'qualquer' as const };
			expect(musica(decodificar(codificar(c))!)).toEqual(musica(c));
		}
	});
});
