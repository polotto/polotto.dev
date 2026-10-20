import { describe, expect, it } from 'vitest';
import { linhaEColuna, posicaoDoErro, processarJson } from './json';

describe('JSON', () => {
	it('formata com 2, 4 espaços ou tab', () => {
		const entrada = '{"b":1,"a":[1,2]}';
		expect(processarJson(entrada, { modo: 'formatar' })).toEqual({
			ok: true,
			texto: '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}'
		});
		expect(processarJson('{"a":1}', { modo: 'formatar', indentacao: 4 })).toEqual({ ok: true, texto: '{\n    "a": 1\n}' });
		expect(processarJson('{"a":1}', { modo: 'formatar', indentacao: 'tab' })).toEqual({ ok: true, texto: '{\n\t"a": 1\n}' });
	});

	it('minifica e ordena chaves em qualquer nível', () => {
		const entrada = '{ "b": { "d": 1, "c": 2 }, "a": [ { "z": 0, "y": 1 } ] }';
		expect(processarJson(entrada, { modo: 'minificar', ordenarChaves: true })).toEqual({
			ok: true,
			texto: '{"a":[{"y":1,"z":0}],"b":{"c":2,"d":1}}'
		});
	});

	it('não altera números nem textos ao formatar', () => {
		const entrada = '{"a":1.0,"b":12345678901234567890,"c":1e2,"d":"\\u00e9\\n","e":-0,"f":[],"g":{}}';
		expect(processarJson(entrada, { modo: 'minificar' })).toEqual({ ok: true, texto: entrada });
		const r = processarJson(entrada, { modo: 'formatar' });
		expect(r.ok && r.texto).toContain('"b": 12345678901234567890');
		expect(r.ok && r.texto).toContain('"a": 1.0');
		expect(r.ok && r.texto).toContain('"c": 1e2');
		expect(r.ok && r.texto).toContain('"f": []');
		expect(r.ok && r.texto).toContain('"g": {}');
	});

	it('aguenta JSON muito aninhado sem quebrar', () => {
		const fundo = 20000;
		const entrada = '['.repeat(fundo) + ']'.repeat(fundo);
		const r = processarJson(entrada, { modo: 'minificar' });
		expect(r.ok || 'aninhado' in r).toBe(true);
	});

	it('JSON muito aninhado com chaves ordenadas devolve erro de aninhado', () => {
		const entrada = '['.repeat(20000) + ']'.repeat(20000);
		const r = processarJson(entrada, { modo: 'formatar', ordenarChaves: true });
		expect(!r.ok && 'aninhado' in r).toBe(true);
	});

	it('JSON inválido e muito aninhado devolve erro, sem estourar', () => {
		const r = processarJson('['.repeat(20000), { modo: 'minificar' });
		expect(r.ok).toBe(false);
	});

	it('aponta linha e coluna do erro', () => {
		const r = processarJson('{\n  "a": 1,\n  "b": \n}', { modo: 'formatar' });
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.linha).toBe(4);
			expect(r.coluna).toBe(1);
		}
	});

	it('acha o primeiro caractere inválido', () => {
		const casos: [string, number][] = [
			['{"a":1 x}', 7],
			['{"a":1,}', 7],
			['[1,2', 4],
			['{"a": tru}', 9],
			["{'a':1}", 1],
			['"abc', 4],
			['"a\\q"', 3],
			['01', 1],
			['{} {}', 3],
			['', 0]
		];
		for (const [texto, pos] of casos) expect(posicaoDoErro(texto), texto).toBe(pos);
	});

	it('converte posição em linha e coluna', () => {
		expect(linhaEColuna('ab\ncd', 0)).toEqual({ linha: 1, coluna: 1 });
		expect(linhaEColuna('ab\ncd', 4)).toEqual({ linha: 2, coluna: 2 });
	});
});
