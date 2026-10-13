import { Marked } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';

// Markdown do artigo para HTML, no build. Código com destaque do Shiki num
// tema escuro só: o bloco de código é escuro nos dois modos. Bloco mermaid
// sai como texto em `pre.mermaid` e vira diagrama no navegador (diagramas.ts).

const TEMA = 'tokyo-night';
const LINGUAGENS = [
	'bash',
	'shell',
	'json',
	'yaml',
	'typescript',
	'javascript',
	'swift',
	'kotlin',
	'java',
	'csharp',
	'html',
	'css',
	'sql',
	'markdown',
	'diff'
];

function escaparHtml(texto: string): string {
	return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let highlighter: Promise<Highlighter> | undefined;

function obterHighlighter() {
	highlighter ??= createHighlighter({ themes: [TEMA], langs: LINGUAGENS });
	return highlighter;
}

export async function renderizarMarkdown(markdown: string): Promise<string> {
	const hl = await obterHighlighter();
	const marked = new Marked({
		renderer: {
			code({ text, lang }) {
				if (lang === 'mermaid') return `<pre class="mermaid">${escaparHtml(text)}</pre>\n`;
				const linguagem = lang && hl.getLoadedLanguages().includes(lang) ? lang : 'text';
				return hl.codeToHtml(text, { lang: linguagem, theme: TEMA });
			}
		}
	});
	return marked.parse(markdown, { async: false }) as string;
}
