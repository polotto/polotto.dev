import type { IconName } from './ui/Icon.svelte';

// Ferramentas da seção /ferramentas, na ordem do índice. Título e descrição
// ficam no i18n: `tools.<slug>.title` e `tools.<slug>.description`.

export type Ferramenta = { slug: string; icone: IconName };

export const FERRAMENTAS: readonly Ferramenta[] = [
	{ slug: 'qrcode', icone: 'qrcode' },
	{ slug: 'cpf-cnpj', icone: 'documento' },
	{ slug: 'json', icone: 'chaves' },
	{ slug: 'paleta', icone: 'paleta' },
	{ slug: 'mascote', icone: 'rosto' }
];

export const caminhoFerramenta = (slug: string) => `/ferramentas/${slug}`;
