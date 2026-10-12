// Dados fixos do site. Texto de interface fica no catálogo de i18n.

export const SITE_URL = 'https://polotto.dev';

export const AUTOR = {
	nome: 'Angelo Polotto',
	perfis: {
		linkedin: 'https://www.linkedin.com/in/angelo-polotto',
		github: 'https://github.com/polotto',
		stackoverflow: 'https://stackoverflow.com/users/6846888/%c3%82ngelo-polotto'
	}
} as const;

/**
 * Código do site no GoatCounter (`<codigo>.goatcounter.com`). Vazio desliga a
 * contagem, para não contar acesso de desenvolvimento nem antes de criar a conta.
 */
export const GOATCOUNTER_CODIGO = '';

export function urlAbsoluta(caminho: string): string {
	return new URL(caminho, SITE_URL).toString();
}
