import { criarRepositorio } from './repositorio-markdown';

// Lido no build: o Vite embute o texto de cada arquivo de `content/`.
const arquivos = import.meta.glob<string>('/content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

export const repositorio = criarRepositorio(arquivos);
