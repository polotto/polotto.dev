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
 * contagem. Em desenvolvimento ela fica sempre desligada (ver `+layout.svelte`).
 */
export const GOATCOUNTER_CODIGO = 'polotto';

/**
 * Usuário no Buttondown (`buttondown.com/<usuario>`), que manda os artigos novos
 * por e-mail lendo o `rss.xml`. Vazio esconde o formulário de inscrição.
 */
export const BUTTONDOWN_USUARIO = 'polotto';

export function urlAbsoluta(caminho: string): string {
	return new URL(caminho, SITE_URL).toString();
}
