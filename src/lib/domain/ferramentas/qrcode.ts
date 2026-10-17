import type { Desenho } from './gerador-mascote';

export type NivelCorrecao = 'L' | 'M' | 'Q' | 'H';
export const NIVEIS: NivelCorrecao[] = ['L', 'M', 'Q', 'H'];

/** Gera o QR Code. A infra implementa com a biblioteca; a página só conhece a interface. */
export interface GeradorQrCode {
	/** Grade com margem, ou `undefined` quando o texto não cabe com essa correção. */
	gerar(texto: string, nivel: NivelCorrecao): Desenho | undefined;
}
