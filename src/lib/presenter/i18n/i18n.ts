import ptBR from './pt-BR.json';

export type Locale = 'pt-BR';
type Catalog = Record<string, string>;

const catalogs: Record<Locale, Catalog> = { 'pt-BR': ptBR };

export const locale: Locale = 'pt-BR';

type Vars = Record<string, string | number>;

/**
 * Busca a chave no catálogo e troca `{nome}` pelas variáveis.
 * Com `count`, usa `<chave>.one` ou `<chave>.other` pelas regras do idioma.
 */
export function t(key: string, vars: Vars = {}): string {
	const catalog = catalogs[locale];
	let resolved = key;
	if (typeof vars.count === 'number') {
		const form = new Intl.PluralRules(locale).select(vars.count);
		resolved = catalog[`${key}.${form}`] !== undefined ? `${key}.${form}` : `${key}.other`;
	}
	const template = catalog[resolved];
	if (template === undefined) throw new Error(`i18n: chave ausente "${resolved}"`);
	return template.replace(/\{(\w+)\}/g, (_, name: string) =>
		name === 'count' && typeof vars.count === 'number'
			? new Intl.NumberFormat(locale).format(vars.count)
			: String(vars[name] ?? `{${name}}`)
	);
}

export function formatDate(iso: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
		new Date(iso)
	);
}
