import type { ConteudoRepository } from '$lib/domain/models';
import { criarRepositorio } from './repositorio-markdown';

// Lido no build: o Vite embute o texto de cada arquivo de `content/`.
const arquivos = import.meta.glob<string>('/content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Data de hoje no fuso do blog. Artigo agendado só entra a partir do dia dele.
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

/** Repositório do conteúdo embutido no build. Criado uma vez em `$lib/app/conteudo.server`. */
export function criarRepositorioDoBuild(): ConteudoRepository {
	return criarRepositorio(arquivos, hoje);
}
