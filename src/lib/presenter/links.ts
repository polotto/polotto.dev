import { SITE_URL } from './site';

// Link para fora do polotto.dev abre em nova aba, em qualquer lugar do site
// (componentes e corpo dos artigos). Interno continua na mesma aba.

const HOST = new URL(SITE_URL).host;

export function ehExterno(href: string): boolean {
	try {
		const url = new URL(href);
		return (url.protocol === 'http:' || url.protocol === 'https:') && url.host !== HOST;
	} catch {
		return false;
	}
}

/** Atributos de nova aba. `rel` extra (ex. `me`) entra junto. */
export function novaAba(rel = ''): { target: '_blank'; rel: string } {
	return { target: '_blank', rel: `${rel} noopener noreferrer`.trim() };
}
