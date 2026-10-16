import { describe, expect, it } from 'vitest';
import { gerarQrCode } from './qrcode';

describe('QR Code', () => {
	it('gera grade quadrada com margem', () => {
		const d = gerarQrCode('https://polotto.dev', 'M')!;
		expect(d.grade).toHaveLength(d.largura);
		expect(d.grade[0]).toMatch(/^#######/); // padrão de posição no canto
		expect(d.margem).toBe(4);
	});

	it('acento muda o código (UTF-8, não 1 byte por caractere)', () => {
		expect(gerarQrCode('ação', 'L')!.grade).not.toEqual(gerarQrCode('aCAo', 'L')!.grade);
	});

	it('texto grande demais não gera', () => {
		expect(gerarQrCode('x'.repeat(5000), 'H')).toBeUndefined();
	});
});
