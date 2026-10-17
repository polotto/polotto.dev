import { listarArtigos, projetosEmDestaque } from '$lib/domain/casos-de-uso';
import { repositorio } from '$lib/app/conteudo';
import { resumir } from '$lib/presenter/resumo';

const RECENTES = 5;

export const load = () => ({
	artigos: resumir(repositorio, listarArtigos(repositorio).slice(0, RECENTES)),
	temMais: listarArtigos(repositorio).length > RECENTES,
	projetos: projetosEmDestaque(repositorio).map((p) => ({ ...p, corpo: '' }))
});
