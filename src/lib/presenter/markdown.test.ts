import { describe, expect, it } from 'vitest';
import { renderizarMarkdown } from './markdown';

describe('renderizarMarkdown', () => {
	it('gera HTML com destaque de código', async () => {
		const html = await renderizarMarkdown('## Título\n\n```bash\necho oi\n```\n');
		expect(html).toContain('<h2');
		expect(html).toContain('class="shiki tokyo-night"');
		expect(html).toContain('echo');
	});

	it('linguagem desconhecida cai em texto puro sem quebrar', async () => {
		const html = await renderizarMarkdown('```cobol\nDISPLAY "OI".\n```\n');
		expect(html).toContain('DISPLAY');
	});

	it('bloco mermaid sai como texto para o navegador desenhar', async () => {
		const html = await renderizarMarkdown('```mermaid\nflowchart LR\n  a[A<br/>x] --> b\n```\n');
		expect(html).toContain('<pre class="mermaid">');
		expect(html).toContain('a[A&lt;br/&gt;x] --&gt; b');
		expect(html).not.toContain('shiki');
	});
});
