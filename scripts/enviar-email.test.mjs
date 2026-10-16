import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { emailsDoDia, hojeEmSaoPaulo } from './enviar-email.mjs';

let content;

function nota(caminho, frontmatter) {
	const arquivo = join(content, caminho);
	mkdirSync(join(arquivo, '..'), { recursive: true });
	writeFileSync(arquivo, `---\n${frontmatter.trim()}\n---\nCorpo.`);
}

beforeEach(() => {
	content = mkdtempSync(join(tmpdir(), 'polotto-email-'));
	nota('series/migrando-o-legado.md', 'titulo: Migrando o legado\ndescricao: S.\nslug: migrando-o-legado');
	nota(
		'artigos/tipos.md',
		'titulo: Tipos de migração\ndescricao: Como escolher.\nslug: tipos-de-migracao\npublicado: 2026-10-22\nserie: migrando-o-legado\nordem: 2'
	);
	nota('artigos/antigo.md', 'titulo: Antigo\ndescricao: D.\nslug: antigo\npublicado: 2026-10-15');
});

afterEach(() => rmSync(content, { recursive: true, force: true }));

describe('e-mail do artigo do dia', () => {
	it('monta um e-mail só para o artigo de hoje', () => {
		const emails = emailsDoDia(content, '2026-10-22');
		expect(emails).toHaveLength(1);
		expect(emails[0]).toMatchObject({
			subject: 'Tipos de migração',
			slug: 'tipos-de-migracao',
			canonical_url: 'https://polotto.dev/artigos/tipos-de-migracao',
			status: 'about_to_send'
		});
		expect(emails[0].body).toContain('*Parte 2 da série Migrando o legado*');
		expect(emails[0].body).toContain('[Ler o artigo](https://polotto.dev/artigos/tipos-de-migracao)');
	});

	it('dia sem artigo não manda nada', () => {
		expect(emailsDoDia(content, '2026-10-21')).toEqual([]);
	});

	it('usa a data de São Paulo, não a UTC', () => {
		// 01:00 UTC de 23/10 ainda é 22/10 em São Paulo
		expect(hojeEmSaoPaulo(new Date('2026-10-23T01:00:00Z'))).toBe('2026-10-22');
	});
});
