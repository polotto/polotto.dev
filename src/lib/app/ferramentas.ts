// Raiz de composição das ferramentas, que rodam no navegador. Separado de
// `conteudo.ts` para o conteúdo do site não entrar no bundle do cliente.
import type { GeradorQrCode } from '$lib/domain/ferramentas/qrcode';
import { criarGeradorQrCode } from '$lib/infrastructure/qrcode';

export const geradorQrCode: GeradorQrCode = criarGeradorQrCode();
