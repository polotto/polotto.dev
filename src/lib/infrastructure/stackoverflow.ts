import type { PerfilRepository, PerfilStackOverflow } from '$lib/domain/models';

// Lido no build pela API pública do Stack Exchange (sem chave: 300 chamadas
// por dia por IP). Se falhar, o site sai sem o cartão em vez de quebrar.

const API = 'https://api.stackexchange.com/2.3/users';

/** Converte a resposta de `/users/{id}` no modelo. Resposta inesperada: `undefined`. */
export function lerPerfil(json: unknown): PerfilStackOverflow | undefined {
	const item = (json as { items?: unknown[] })?.items?.[0] as
		| { reputation?: unknown; badge_counts?: { gold?: unknown; silver?: unknown; bronze?: unknown } }
		| undefined;
	const numero = (v: unknown) => (typeof v === 'number' ? v : undefined);
	const reputacao = numero(item?.reputation);
	const ouro = numero(item?.badge_counts?.gold);
	const prata = numero(item?.badge_counts?.silver);
	const bronze = numero(item?.badge_counts?.bronze);
	if (reputacao === undefined || ouro === undefined || prata === undefined || bronze === undefined)
		return undefined;
	return { reputacao, medalhas: { ouro, prata, bronze } };
}

export async function buscarPerfilStackOverflow(
	id: number,
	buscar: typeof fetch = fetch
): Promise<PerfilStackOverflow | undefined> {
	try {
		const resposta = await buscar(`${API}/${id}?site=stackoverflow`);
		if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
		const perfil = lerPerfil(await resposta.json());
		if (!perfil) throw new Error('resposta sem reputação ou medalhas');
		return perfil;
	} catch (erro) {
		console.warn(`Stack Overflow: cartão fora do build (${(erro as Error).message})`);
		return undefined;
	}
}

export function criarPerfilStackOverflow(buscar: typeof fetch = fetch): PerfilRepository {
	return { buscarPerfil: (id) => buscarPerfilStackOverflow(id, buscar) };
}
