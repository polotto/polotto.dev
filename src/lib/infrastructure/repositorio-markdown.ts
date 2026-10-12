import { parse } from 'yaml';
import type {
	Artigo,
	ConteudoRepository,
	LinksProjeto,
	Projeto,
	Serie,
	Situacao
} from '$lib/domain/models';

// `content/` é gerado pelo `npm run sync`, que já valida o contrato.
// Aqui só se converte o frontmatter para os modelos do domain.

type Arquivos = Record<string, string>;
type Dados = Record<string, unknown>;

function lerNota(texto: string): { dados: Dados; corpo: string } {
	const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!m) throw new Error('conteúdo sem frontmatter: rode `npm run sync`');
	return { dados: (parse(m[1]) ?? {}) as Dados, corpo: m[2].trim() };
}

const texto = (v: unknown) => (typeof v === 'string' ? v : '');

function daPasta(arquivos: Arquivos, pasta: string) {
	return Object.entries(arquivos)
		.filter(([caminho]) => caminho.includes(`/content/${pasta}/`))
		.map(([, conteudo]) => lerNota(conteudo));
}

function paraArtigo({ dados: d, corpo }: { dados: Dados; corpo: string }): Artigo {
	return {
		slug: texto(d.slug),
		titulo: texto(d.titulo),
		descricao: texto(d.descricao),
		publicado: texto(d.publicado),
		atualizado: typeof d.atualizado === 'string' ? d.atualizado : undefined,
		serie: typeof d.serie === 'string' ? { slug: d.serie, ordem: Number(d.ordem) } : undefined,
		projetos: Array.isArray(d.projetos) ? d.projetos.map(String) : [],
		corpo
	};
}

function paraSerie({ dados: d, corpo }: { dados: Dados; corpo: string }): Serie {
	return { slug: texto(d.slug), titulo: texto(d.titulo), descricao: texto(d.descricao), corpo };
}

function paraProjeto({ dados: d, corpo }: { dados: Dados; corpo: string }): Projeto {
	const links = (d.links ?? {}) as LinksProjeto;
	return {
		slug: texto(d.slug),
		nome: texto(d.nome),
		descricao: texto(d.descricao),
		situacao: texto(d.situacao) as Situacao,
		destaque: d.destaque === true,
		links: { site: links.site, loja: links.loja, repo: links.repo },
		corpo
	};
}

/** Repositório sobre o mapa caminho -> texto dos arquivos de `content/`. */
export function criarRepositorio(arquivos: Arquivos): ConteudoRepository {
	const artigos = daPasta(arquivos, 'artigos').map(paraArtigo);
	const series = daPasta(arquivos, 'series').map(paraSerie);
	const projetos = daPasta(arquivos, 'projetos').map(paraProjeto);
	return {
		artigos: () => artigos,
		series: () => series,
		projetos: () => projetos
	};
}
