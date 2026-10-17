// Raiz de composição do servidor: a única parte, com `ferramentas.ts`, que
// conhece a infra concreta. Rotas importam daqui. Lê `content/` no build,
// então nunca importar de página que roda no navegador.
import type { ConteudoRepository, PerfilRepository } from '$lib/domain/models';
import { criarRepositorioDoBuild } from '$lib/infrastructure/repositorio';
import { criarPerfilStackOverflow } from '$lib/infrastructure/stackoverflow';

export const repositorio: ConteudoRepository = criarRepositorioDoBuild();

/** O `fetch` vem do `load` do SvelteKit. */
export function perfis(buscar: typeof fetch): PerfilRepository {
	return criarPerfilStackOverflow(buscar);
}
