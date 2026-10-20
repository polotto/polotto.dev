import { describe, expect, it } from 'vitest';
import qrcode from 'qrcode-generator';
import { criarGeradorQrCode, gerarQrCode } from './qrcode';

describe('QR Code', () => {
	it('gera grade quadrada com margem', () => {
		const d = gerarQrCode('https://polotto.dev', 'M')!;
		expect(d.grade).toHaveLength(d.largura);
		expect(d.grade[0]).toMatch(/^#######/); // padrão de posição no canto
		expect(d.margem).toBe(4);
	});

	it('lê o texto em UTF-8, não em 1 byte por caractere', () => {
		expect(qrcode.stringToBytes('ç')).toEqual([0xc3, 0xa7]);
		expect(qrcode.stringToBytes('😀')).toEqual([0xf0, 0x9f, 0x98, 0x80]);
		expect(gerarQrCode('ação', 'L')!.grade).not.toEqual(gerarQrCode('aCAo', 'L')!.grade);
	});

	it('texto grande demais não gera', () => {
		expect(gerarQrCode('x'.repeat(5000), 'H')).toBeUndefined();
	});

	it('o gerador da interface é o mesmo QR Code', () => {
		expect(criarGeradorQrCode().gerar('polotto', 'M')).toEqual(gerarQrCode('polotto', 'M'));
	});
});
