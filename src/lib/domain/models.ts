// Modelos do domínio. Termos em `GLOSSARY.md`; campos em
// `docs/work/sveltekit-rebuild/contrato-frontmatter.md`.

export interface ReferenciaSerie {
	slug: string;
	ordem: number;
}

export interface Artigo {
	slug: string;
	titulo: string;
	descricao: string;
	/** Data `AAAA-MM-DD`. */
	publicado: string;
	/** Data `AAAA-MM-DD`, quando houve revisão depois de publicar. */
	atualizado?: string;
	serie?: ReferenciaSerie;
	/** Slugs dos projetos citados. */
	projetos: string[];
	/** Corpo em markdown, já convertido do Obsidian pelo sync. */
	corpo: string;
}

export interface Serie {
	slug: string;
	titulo: string;
	descricao: string;
	corpo: string;
}

export type Situacao = 'ativo' | 'pausado' | 'encerrado';

export interface LinksProjeto {
	site?: string;
	loja?: string;
	repo?: string;
}

export interface Projeto {
	slug: string;
	nome: string;
	descricao: string;
	situacao: Situacao;
	destaque: boolean;
	links: LinksProjeto;
	corpo: string;
}

/** Fonte do conteúdo. A infra implementa; o domain só conhece a interface. */
export interface ConteudoRepository {
	artigos(): Artigo[];
	series(): Serie[];
	projetos(): Projeto[];
}
