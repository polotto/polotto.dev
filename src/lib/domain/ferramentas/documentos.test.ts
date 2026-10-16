import { describe, expect, it } from 'vitest';
import { formatar, gerar, limpar, validar } from './documentos';

describe('CPF e CNPJ', () => {
	it('valida CPF com e sem máscara', () => {
		expect(validar('529.982.247-25')).toEqual({ valido: true, tipo: 'cpf', formatado: '529.982.247-25' });
		expect(validar('52998224725')).toMatchObject({ valido: true, tipo: 'cpf' });
	});

	it('valida CNPJ numérico e alfanumérico', () => {
		expect(validar('11.222.333/0001-81')).toMatchObject({ valido: true, tipo: 'cnpj' });
		// exemplo do material da Receita sobre o CNPJ alfanumérico
		expect(validar('12.ABC.345/01DE-35')).toEqual({ valido: true, tipo: 'cnpj', formatado: '12.ABC.345/01DE-35' });
		expect(validar('12abc34501de35')).toMatchObject({ valido: true, tipo: 'cnpj' });
	});

	it('explica por que é inválido', () => {
		expect(validar('')).toEqual({ valido: false, motivo: 'vazio' });
		expect(validar('123')).toEqual({ valido: false, motivo: 'tamanho' });
		expect(validar('5299822472A')).toEqual({ valido: false, motivo: 'caractere' });
		expect(validar('12.ABC.345/01DE-3A')).toEqual({ valido: false, motivo: 'caractere' });
		expect(validar('111.111.111-11')).toEqual({ valido: false, motivo: 'repetido' });
		expect(validar('529.982.247-26')).toEqual({ valido: false, motivo: 'digito' });
		expect(validar('11.222.333/0001-82')).toEqual({ valido: false, motivo: 'digito' });
	});

	it('gera documentos válidos', () => {
		for (let i = 0; i < 200; i++) {
			const cpf = gerar({ tipo: 'cpf' });
			expect(cpf).toMatch(/^\d{11}$/);
			expect(validar(cpf).valido).toBe(true);
			const cnpj = gerar({ tipo: 'cnpj' });
			expect(cnpj).toMatch(/^\d{8}0001\d{2}$/);
			expect(validar(cnpj).valido).toBe(true);
			const alfa = gerar({ tipo: 'cnpj', alfanumerico: true });
			expect(alfa).toMatch(/^[0-9A-Z]{8}0001\d{2}$/);
			expect(validar(alfa).valido).toBe(true);
		}
	});

	it('formata e limpa', () => {
		expect(formatar('cpf', '52998224725')).toBe('529.982.247-25');
		expect(formatar('cnpj', '11222333000181')).toBe('11.222.333/0001-81');
		expect(limpar(' 12.abc.345/01de-35 ')).toBe('12ABC34501DE35');
	});
});
