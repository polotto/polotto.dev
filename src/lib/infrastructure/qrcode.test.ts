import { describe, expect, it } from 'vitest';
import qrcode from 'qrcode-generator';
import { gerarQrCode } from './qrcode';

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
		const utf8 = qrcode.stringToBytes;
		qrcode.stringToBytes = (texto) => Array.from(texto, (c) => c.charCodeAt(0) & 0xff);
		const umByte = gerarQrCode('ação', 'L')!.grade;
		qrcode.stringToBytes = utf8;
		expect(gerarQrCode('ação', 'L')!.grade).not.toEqual(umByte);
	});

	it('texto grande demais não gera', () => {
		expect(gerarQrCode('x'.repeat(5000), 'H')).toBeUndefined();
	});
});
