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
});
