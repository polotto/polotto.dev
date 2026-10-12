import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checarConteudo } from './checar-conteudo.mjs';
import { converterCorpo, lerNota, origemDoVault, sincronizar } from './sync.mjs';

let raiz, vault, saida;

function nota(caminho, frontmatter, corpo = '') {
	const arquivo = join(vault, 'blog', caminho);
	mkdirSync(dirname(arquivo), { recursive: true });
	writeFileSync(arquivo, `---\n${frontmatter.trim()}\n---\n${corpo}`);
}

function serieLegado() {
	nota('series/Migrando o legado.md', 'titulo: Migrando o legado\ndescricao: Série.\nslug: migrando-o-legado\nstatus: publicado');
}

beforeEach(() => {
	raiz = mkdtempSync(join(tmpdir(), 'polotto-sync-'));
	vault = join(raiz, 'vault');
	saida = join(raiz, 'repo');
	mkdirSync(join(vault, 'blog'), { recursive: true });
});

afterEach(() => rmSync(raiz, { recursive: true, force: true }));

const lerSaida = (rel) => lerNota(readFileSync(join(saida, rel), 'utf8'));

describe('sincronizar', () => {
	it('copia só o que está publicado', () => {
		serieLegado();
		nota('Por que migrar.md', 'titulo: Por que migrar\ndescricao: D.\nslug: por-que-migrar\nstatus: publicado\npublicado: 2026-11-02\nserie: migrando-o-legado\nordem: 1', '\nTexto.');
		nota('Rascunho.md', 'titulo: R\ndescricao: D.\nslug: rascunho\nstatus: rascunho');
		nota('Sem status antigo.md', 'title: "Old post"');
		nota('ideias/Ideia.md', 'titulo: I\ndescricao: D.\nslug: ideia\nstatus: publicado\npublicado: 2026-01-01');

		const r = sincronizar({ vault, saida });

		expect(r).toMatchObject({ artigos: 1, series: 1, projetos: 0, rascunhos: 2 });
		expect(existsSync(join(saida, 'content/artigos/rascunho.md'))).toBe(false);
		expect(existsSync(join(saida, 'content/artigos/ideia.md'))).toBe(false);
		const { dados, corpo } = lerSaida('content/artigos/por-que-migrar.md');
		expect(dados).toEqual({
			titulo: 'Por que migrar',
			descricao: 'D.',
			slug: 'por-que-migrar',
			publicado: '2026-11-02',
			serie: 'migrando-o-legado',
			ordem: 1,
			projetos: []
		});
		expect(corpo.trim()).toBe('Texto.');
	});

	it('converte wikilinks pelo nome do arquivo e pelo slug', () => {
		nota('Primeiro artigo.md', 'titulo: A\ndescricao: D.\nslug: primeiro\nstatus: publicado\npublicado: 2026-11-01');
		nota('Segundo.md', 'titulo: B\ndescricao: D.\nslug: segundo\nstatus: publicado\npublicado: 2026-11-02',
			'\nVeja [[Primeiro artigo]], [[primeiro|o primeiro]] e [[Rascunho|o rascunho]].');
		nota('Rascunho.md', 'titulo: R\ndescricao: D.\nslug: rascunho\nstatus: rascunho');

		sincronizar({ vault, saida });

		expect(lerSaida('content/artigos/segundo.md').corpo.trim()).toBe(
			'Veja [Primeiro artigo](/artigos/primeiro), [o primeiro](/artigos/primeiro) e o rascunho.'
		);
	});

	it('copia imagens da pasta da nota para /media/<slug>/', () => {
		writeFileSync(join(vault, 'blog', 'diagrama proxy.png'), 'png');
		writeFileSync(join(vault, 'blog', 'foto.jpg'), 'jpg');
		nota('Com imagem.md', 'titulo: A\ndescricao: D.\nslug: com-imagem\nstatus: publicado\npublicado: 2026-11-01',
			'\n![[diagrama proxy.png|O proxy]]\n\n![foto](foto.jpg)\n\n![externa](https://x.dev/a.png)');

		const r = sincronizar({ vault, saida });

		expect(r.midias).toBe(2);
		expect(readFileSync(join(saida, 'static/media/com-imagem/diagrama proxy.png'), 'utf8')).toBe('png');
		expect(lerSaida('content/artigos/com-imagem.md').corpo.trim()).toBe(
			'![O proxy](/media/com-imagem/diagrama%20proxy.png)\n\n![foto](/media/com-imagem/foto.jpg)\n\n![externa](https://x.dev/a.png)'
		);
	});

	it('grava projetos com situação e links', () => {
		nota('projetos/Live Player.md', 'nome: Live Player\ndescricao: Player.\nslug: live-player\nstatus: publicado\nsituacao: ativo\ndestaque: true\nlinks:\n  site: https://getliveplayer.com');

		sincronizar({ vault, saida });

		expect(lerSaida('content/projetos/live-player.md').dados).toEqual({
			nome: 'Live Player',
			descricao: 'Player.',
			slug: 'live-player',
			situacao: 'ativo',
			destaque: true,
			links: { site: 'https://getliveplayer.com' }
		});
	});

	it('apaga a saída anterior', () => {
		mkdirSync(join(saida, 'content/artigos'), { recursive: true });
		writeFileSync(join(saida, 'content/artigos/velho.md'), 'x');
		sincronizar({ vault, saida });
		expect(existsSync(join(saida, 'content/artigos/velho.md'))).toBe(false);
	});

	it('falha sem gravar nada quando o contrato quebra', () => {
		mkdirSync(join(saida, 'content/artigos'), { recursive: true });
		writeFileSync(join(saida, 'content/artigos/velho.md'), 'x');
		nota('Sem data.md', 'titulo: A\ndescricao: D.\nslug: sem-data\nstatus: publicado');
		nota('Serie fantasma.md', 'titulo: B\ndescricao: D.\nslug: fantasma\nstatus: publicado\npublicado: 2026-01-01\nserie: nao-existe\nordem: 1');
		nota('Imagem sumida.md', 'titulo: C\ndescricao: D.\nslug: sumida\nstatus: publicado\npublicado: 2026-01-01', '\n![[nada.png]]');
		nota('projetos/X.md', 'nome: X\ndescricao: D.\nslug: x\nstatus: publicado\nsituacao: talvez');

		let erro;
		try {
			sincronizar({ vault, saida });
		} catch (e) {
			erro = e;
		}

		expect(erro.erros).toEqual(
			expect.arrayContaining([
				expect.stringContaining('publicado deve ser AAAA-MM-DD'),
				expect.stringContaining('série "nao-existe"'),
				expect.stringContaining('imagem não encontrada: nada.png'),
				expect.stringContaining('situacao deve ser')
			])
		);
		expect(existsSync(join(saida, 'content/artigos/velho.md'))).toBe(true);
	});

	it('acusa slug e ordem repetidos', () => {
		serieLegado();
		const base = 'descricao: D.\nstatus: publicado\npublicado: 2026-01-01\nserie: migrando-o-legado\nordem: 1';
		nota('A.md', `titulo: A\nslug: igual\n${base}`);
		nota('B.md', `titulo: B\nslug: igual\n${base}`);

		expect(() => sincronizar({ vault, saida })).toThrow(/slug de artigo repetido[\s\S]*ordem 1 repetida/);
	});
});

describe('converterCorpo', () => {
	it('não mexe em bloco de código', () => {
		const corpo = 'Antes [[x]]\n\n```md\n[[x]] ![[y.png]]\n```\n';
		const out = converterCorpo(corpo, {
			slug: 's',
			pastaNota: '/',
			linkDe: () => '/artigos/x',
			copiarMidia: () => '/media/s/y.png'
		});
		expect(out).toBe('Antes [x](/artigos/x)\n\n```md\n[[x]] ![[y.png]]\n```\n');
	});
});

describe('origem do conteúdo', () => {
	it('vault comum marca vault e passa na checagem', () => {
		sincronizar({ vault, saida });
		expect(readFileSync(join(saida, 'content/.origem'), 'utf8').trim()).toBe('vault');
		expect(checarConteudo(join(saida, 'content'))).toBeUndefined();
	});

	it('vault de exemplo é reconhecido e barrado', () => {
		expect(origemDoVault(join(import.meta.dirname, 'fixtures/vault'))).toBe('exemplo');
		mkdirSync(join(saida, 'content'), { recursive: true });
		writeFileSync(join(saida, 'content/.origem'), 'exemplo\n');
		expect(checarConteudo(join(saida, 'content'))).toMatch(/npm run sync/);
	});

	it('sem marca também é barrado', () => {
		expect(checarConteudo(join(saida, 'content'))).toMatch(/sem marca/);
	});
});
