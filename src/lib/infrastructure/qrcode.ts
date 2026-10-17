import qrcode from 'qrcode-generator';
import type { Desenho } from '$lib/domain/ferramentas/gerador-mascote';
import type { GeradorQrCode, NivelCorrecao } from '$lib/domain/ferramentas/qrcode';

// A biblioteca lê cada caractere como 1 byte e estraga acento e emoji.
// Em UTF-8 todo leitor de QR Code entende.
qrcode.stringToBytes = (texto: string) => Array.from(new TextEncoder().encode(texto));

/**
 * QR Code como grade (`#` escuro, `.` claro), com a margem de 4 módulos que a
 * norma pede. `undefined` quando o texto não cabe com essa correção.
 */
export function gerarQrCode(texto: string, nivel: NivelCorrecao): Desenho | undefined {
	const qr = qrcode(0, nivel);
	qr.addData(texto, 'Byte');
	try {
		qr.make();
	} catch {
		return undefined;
	}
	const n = qr.getModuleCount();
	const grade = Array.from({ length: n }, (_, y) =>
		Array.from({ length: n }, (_, x) => (qr.isDark(y, x) ? '#' : '.')).join('')
	);
	return { largura: n, altura: n, grade, cores: { '#': '#000000' }, fundo: '#ffffff', margem: 4 };
}

export function criarGeradorQrCode(): GeradorQrCode {
	return { gerar: gerarQrCode };
}
