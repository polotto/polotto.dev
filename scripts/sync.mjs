#!/usr/bin/env node
// Sincroniza o vault do Obsidian para `content/` e `static/media/`.
// Contrato: docs/work/sveltekit-rebuild/contrato-frontmatter.md
// Decisão: docs/adr/0001-artigos-no-vault-copiados-por-script.md

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SITUACOES = ['ativo', 'pausado', 'encerrado'];
const STATUS = ['rascunho', 'publicado'];
const LINKS = ['site', 'loja', 'repo'];

/** Separa frontmatter e corpo. Nota sem frontmatter devolve `{}`. */
export function lerNota(texto) {
	const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!m) return { dados: {}, corpo: texto };
	return { dados: parse(m[1]) ?? {}, corpo: m[2] };
}

function arquivosMd(pasta) {
	if (!existsSync(pasta)) return [];
	return readdirSync(pasta)
		.filter((f) => extname(f) === '.md' && statSync(join(pasta, f)).isFile())
		.sort()
		.map((f) => join(pasta, f));
}

function validarComum(d, erros, onde) {
	if (!STATUS.includes(d.status)) erros.push(`${onde}: status deve ser rascunho ou publicado`);
	if (typeof d.slug !== 'string' || !SLUG.test(d.slug)) erros.push(`${onde}: slug ausente ou fora de kebab-case`);
	if (typeof d.descricao !== 'string' || !d.descricao.trim()) erros.push(`${onde}: descricao ausente`);
}

function validarArtigo(d, onde) {
	const erros = [];
	validarComum(d, erros, onde);
	if (typeof d.titulo !== 'string' || !d.titulo.trim()) erros.push(`${onde}: titulo ausente`);
	if (d.status === 'publicado') {
		if (typeof d.publicado !== 'string' || !DATA.test(d.publicado)) erros.push(`${onde}: publicado deve ser AAAA-MM-DD`);
		if (d.atualizado !== undefined && (typeof d.atualizado !== 'string' || !DATA.test(d.atualizado) || d.atualizado < d.publicado))
			erros.push(`${onde}: atualizado deve ser AAAA-MM-DD e posterior a publicado`);
		if (d.serie !== undefined && (!Number.isInteger(d.ordem) || d.ordem < 1)) erros.push(`${onde}: artigo de série precisa de ordem inteira a partir de 1`);
		if (d.projetos !== undefined && !Array.isArray(d.projetos)) erros.push(`${onde}: projetos deve ser lista`);
	}
	return erros;
}

function validarSerie(d, onde) {
	const erros = [];
	validarComum(d, erros, onde);
	if (typeof d.titulo !== 'string' || !d.titulo.trim()) erros.push(`${onde}: titulo ausente`);
	return erros;
}

function validarProjeto(d, onde) {
	const erros = [];
	validarComum(d, erros, onde);
	if (typeof d.nome !== 'string' || !d.nome.trim()) erros.push(`${onde}: nome ausente`);
	if (!SITUACOES.includes(d.situacao)) erros.push(`${onde}: situacao deve ser ativo, pausado ou encerrado`);
	if (d.links !== undefined) {
		if (d.links === null || typeof d.links !== 'object' || Array.isArray(d.links)) erros.push(`${onde}: links deve ser mapa`);
		else
			for (const [chave, url] of Object.entries(d.links)) {
				if (!LINKS.includes(chave)) erros.push(`${onde}: links.${chave} não existe (use site, loja ou repo)`);
				else if (typeof url !== 'string' || !/^https?:\/\/\S+$/.test(url)) erros.push(`${onde}: links.${chave} deve ser URL http(s)`);
			}
	}
	return erros;
}

/**
 * Separa o corpo em trechos de texto e blocos de código cercados, com ``` ou ~~~
 * de qualquer tamanho. O bloco fecha com o mesmo caractere e pelo menos o mesmo
 * tamanho; bloco sem fechamento vai até o fim, como no CommonMark.
 */
function separarCodigo(corpo) {
	const trechos = [];
	let atual = { codigo: false, linhas: [] };
	let cerca = null;
	for (const linha of corpo.split('\n')) {
		if (!cerca) {
			const abre = linha.match(/^ {0,3}(`{3,}|~{3,})/);
			if (abre && !(abre[1][0] === '`' && linha.slice(abre[0].length).includes('`'))) {
				trechos.push(atual);
				atual = { codigo: true, linhas: [linha] };
				cerca = abre[1];
				continue;
			}
			atual.linhas.push(linha);
		} else {
			atual.linhas.push(linha);
			const fecha = linha.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
			if (fecha && fecha[1][0] === cerca[0] && fecha[1].length >= cerca.length) {
				trechos.push(atual);
				atual = { codigo: false, linhas: [] };
				cerca = null;
			}
		}
	}
	trechos.push(atual);
	return trechos.filter((t) => t.linhas.length).map((t) => ({ codigo: t.codigo, texto: t.linhas.join('\n') }));
}

/**
 * Converte o corpo do Obsidian para markdown comum. Não mexe em bloco de código.
 * - `[[alvo]]` e `[[alvo|texto]]`: link para artigo publicado, ou texto puro.
 * - `![[img.png]]`, `![[img.png|alt]]` e `![alt](img.png)`: imagem em /media/<slug>/.
 */
export function converterCorpo(corpo, { slug, pastaNota, linkDe, copiarMidia }) {
	return separarCodigo(corpo)
		.map(({ codigo, texto }) => {
			if (codigo) return texto;
			return texto
				.replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, arquivo, alt) => {
					const url = copiarMidia(slug, pastaNota, arquivo.trim());
					return `![${(alt ?? '').trim()}](${url})`;
				})
				.replace(/!\[([^\]]*)\]\((?!https?:|\/)([^)\s]+)\)/g, (_, alt, arquivo) => {
					const url = copiarMidia(slug, pastaNota, decodeURI(arquivo));
					return `![${alt}](${url})`;
				})
				.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, alvo, texto) => {
					const nome = alvo.split('#')[0].trim();
					const rotulo = (texto ?? nome).trim();
					const href = linkDe(nome);
					return href ? `[${rotulo}](${href})` : rotulo;
				});
		})
		.join('\n');
}

function gravar(pasta, slug, dados, corpo) {
	mkdirSync(pasta, { recursive: true });
	writeFileSync(join(pasta, `${slug}.md`), `---\n${stringify(dados).trimEnd()}\n---\n\n${corpo.trim()}\n`);
}

/**
 * Lê `<vault>/blog/` e grava em `<saida>/content/` e `<saida>/static/media/`.
 * As duas pastas de saída são geradas: o conteúdo anterior é apagado.
 * Erro de contrato em nota publicada interrompe tudo antes de gravar.
 */
export const ARQUIVO_ORIGEM = '.origem';
const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures');

/** `exemplo` quando o vault é o de `scripts/fixtures/`, `vault` nos outros casos. */
export function origemDoVault(vault) {
	return resolve(vault).startsWith(FIXTURES) ? 'exemplo' : 'vault';
}

export function sincronizar({ vault, saida }) {
	const blog = join(vault, 'blog');
	if (!existsSync(blog)) throw new Error(`pasta não encontrada: ${blog}`);

	const notas = (pasta, validar) =>
		arquivosMd(pasta).map((caminho) => {
			const { dados, corpo } = lerNota(readFileSync(caminho, 'utf8'));
			const onde = caminho.slice(vault.length + 1);
			return { caminho, onde, dados, corpo, erros: dados.status === 'publicado' ? validar(dados, onde) : [] };
		});

	const artigos = notas(blog, validarArtigo);
	const series = notas(join(blog, 'series'), validarSerie);
	const projetos = notas(join(blog, 'projetos'), validarProjeto);

	const publicados = (lista) => lista.filter((n) => n.dados.status === 'publicado');
	const pubArtigos = publicados(artigos);
	const pubSeries = publicados(series);
	const pubProjetos = publicados(projetos);

	const erros = [...artigos, ...series, ...projetos].flatMap((n) => n.erros);
	for (const [tipo, lista] of [['artigo', pubArtigos], ['série', pubSeries], ['projeto', pubProjetos]]) {
		const vistos = new Map();
		for (const n of lista) {
			if (vistos.has(n.dados.slug)) erros.push(`${n.onde}: slug de ${tipo} repetido com ${vistos.get(n.dados.slug)}`);
			vistos.set(n.dados.slug, n.onde);
		}
	}
	const slugsSerie = new Set(pubSeries.map((n) => n.dados.slug));
	const slugsProjeto = new Set(pubProjetos.map((n) => n.dados.slug));
	const ordens = new Map();
	for (const n of pubArtigos) {
		const { serie, ordem, projetos: refs = [] } = n.dados;
		if (serie !== undefined) {
			if (!slugsSerie.has(serie)) erros.push(`${n.onde}: série "${serie}" não existe ou não está publicada`);
			const chave = `${serie}#${ordem}`;
			if (ordens.has(chave)) erros.push(`${n.onde}: ordem ${ordem} repetida na série com ${ordens.get(chave)}`);
			ordens.set(chave, n.onde);
		}
		for (const p of Array.isArray(refs) ? refs : []) {
			if (!slugsProjeto.has(p)) erros.push(`${n.onde}: projeto "${p}" não existe ou não está publicado`);
		}
	}

	// Wikilink aponta para nome de arquivo (padrão do Obsidian) ou para slug.
	const alvos = new Map();
	for (const n of pubArtigos) {
		alvos.set(basename(n.caminho, '.md'), n.dados.slug);
		alvos.set(n.dados.slug, n.dados.slug);
	}
	const linkDe = (nome) => (alvos.has(nome) ? `/artigos/${alvos.get(nome)}` : undefined);

	const pastaMidia = join(saida, 'static', 'media');
	const copias = [];
	const copiarMidia = (slug, pastaNota, arquivo) => {
		const origem = [join(pastaNota, arquivo), join(blog, arquivo)].find((c) => existsSync(c));
		if (!origem) {
			erros.push(`${slug}: imagem não encontrada: ${arquivo}`);
			return arquivo;
		}
		const nome = basename(arquivo);
		copias.push({ origem, destino: join(pastaMidia, slug, nome) });
		return `/media/${slug}/${encodeURIComponent(nome)}`;
	};

	const converter = (n) =>
		converterCorpo(n.corpo, { slug: n.dados.slug, pastaNota: dirname(n.caminho), linkDe, copiarMidia });
	const saidaArtigos = pubArtigos.map((n) => ({ n, corpo: converter(n) }));
	const saidaSeries = pubSeries.map((n) => ({ n, corpo: converter(n) }));
	const saidaProjetos = pubProjetos.map((n) => ({ n, corpo: converter(n) }));

	if (erros.length) {
		const err = new Error(`contrato do frontmatter quebrado:\n- ${erros.join('\n- ')}`);
		err.erros = erros;
		throw err;
	}

	const pastaConteudo = join(saida, 'content');
	rmSync(pastaConteudo, { recursive: true, force: true });
	rmSync(pastaMidia, { recursive: true, force: true });
	mkdirSync(pastaConteudo, { recursive: true });
	writeFileSync(join(pastaConteudo, ARQUIVO_ORIGEM), `${origemDoVault(vault)}\n`);

	const limpar = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
	for (const { n, corpo } of saidaArtigos) {
		const d = n.dados;
		gravar(join(pastaConteudo, 'artigos'), d.slug, limpar({
			titulo: d.titulo,
			descricao: d.descricao,
			slug: d.slug,
			publicado: d.publicado,
			atualizado: d.atualizado,
			serie: d.serie,
			ordem: d.ordem,
			projetos: d.projetos ?? []
		}), corpo);
	}
	for (const { n, corpo } of saidaSeries) {
		const d = n.dados;
		gravar(join(pastaConteudo, 'series'), d.slug, { titulo: d.titulo, descricao: d.descricao, slug: d.slug }, corpo);
	}
	for (const { n, corpo } of saidaProjetos) {
		const d = n.dados;
		gravar(join(pastaConteudo, 'projetos'), d.slug, {
			nome: d.nome,
			descricao: d.descricao,
			slug: d.slug,
			situacao: d.situacao,
			destaque: d.destaque === true,
			links: limpar({ site: d.links?.site, loja: d.links?.loja, repo: d.links?.repo })
		}, corpo);
	}
	for (const { origem, destino } of copias) {
		mkdirSync(dirname(destino), { recursive: true });
		copyFileSync(origem, destino);
	}

	return {
		artigos: saidaArtigos.length,
		series: saidaSeries.length,
		projetos: saidaProjetos.length,
		midias: new Set(copias.map((c) => c.destino)).size,
		rascunhos: [...artigos, ...series, ...projetos].length - pubArtigos.length - pubSeries.length - pubProjetos.length
	};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const vault = process.env.POLOTTO_VAULT ?? join(homedir(), 'Documents', 'Polotto');
	const saida = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	try {
		const r = sincronizar({ vault, saida });
		console.log(
			`sync ok: ${r.artigos} artigos, ${r.series} séries, ${r.projetos} projetos, ${r.midias} imagens. ${r.rascunhos} notas fora (rascunho ou sem status).`
		);
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}
}
