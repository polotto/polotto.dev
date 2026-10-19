// Reharmonização: técnicas que trocam, inserem ou enriquecem acordes de uma
// progressão. Cada técnica é independente e pode ser combinada com as outras.

import {
	cifra,
	ehDominante,
	ehMenor,
	grau,
	inteiro,
	mod12,
	novoAcorde,
	QUALIDADES,
	type Acorde,
	type Aleatorio,
	type Progressao,
	type Tonalidade
} from './acordes';

export const TECNICAS = [
	'extensoes',
	'ii-v',
	'dominantes-secundarios',
	'substituicao-tritono',
	'emprestimo-modal',
	'diminuto-passagem',
	'backdoor',
	'dominante-alterado',
	'baixo-descendente',
	'pedal'
] as const;

export type TecnicaId = (typeof TECNICAS)[number];

/** Um lugar onde a técnica mexeu: cifras antes e depois, no compasso original. */
export type Uso = { tecnica: TecnicaId; compasso: number; antes: string; depois: string };

export type Resultado = { progressao: Progressao; usos: Uso[] };

type Contexto = {
	t: Tonalidade;
	a: Aleatorio;
	registrar: (tecnica: TecnicaId, compasso: number, antes: string, depois: string) => void;
};

type Aplicar = (acordes: Acorde[], c: Contexto) => Acorde[];

const cifras = (cs: Acorde[], c: Contexto) => cs.map((x) => cifra(x, c.t)).join(' ');
const marcar = (x: Acorde, id: TecnicaId): Acorde => ({ ...x, tecnicas: [...x.tecnicas, id] });
const criar = (raiz: number, qualidade: Acorde['qualidade'], compasso: number, tempos: number, id: TecnicaId): Acorde =>
	marcar(novoAcorde(raiz, qualidade, compasso, tempos), id);
const tem = (x: Acorde, id: TecnicaId) => x.tecnicas.includes(id);

/** Escolhe parte dos candidatos, sempre ao menos um quando houver. */
function escolher(candidatos: number[], p: number, a: Aleatorio): Set<number> {
	const escolhidos = new Set(candidatos.filter(() => a() < p));
	if (escolhidos.size === 0 && candidatos.length > 0) escolhidos.add(candidatos[inteiro(candidatos.length, a)]);
	return escolhidos;
}

const SIMPLES = new Set(['maior', 'menor']);

/** V7 trocado por iv7 e bVII7, a cadência "pela porta dos fundos" até a tônica. */
const backdoor: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) =>
		x.qualidade === 'dom7' && x.tempos === 4 && grau(x, c.t) === 7 && acordes[i + 1] && grau(acordes[i + 1], c.t) === 0 ? [i] : []
	);
	const sorteados = escolher(alvo, 0.8, c.a);
	return acordes.flatMap((x, i) => {
		if (!sorteados.has(i)) return [x];
		const novos = [
			criar(c.t.tonica + 5, 'min7', x.compasso, 2, 'backdoor'),
			criar(c.t.tonica + 10, 'dom7', x.compasso, 2, 'backdoor')
		];
		c.registrar('backdoor', x.compasso, cifra(x, c.t), cifras(novos, c));
		return novos;
	});
};

/** Antes de um acorde, o ii-V que leva a ele; ocupa a metade final do compasso anterior. */
const iiV: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) => (i > 0 && SIMPLES.has(x.qualidade) ? [i] : []));
	const sorteados = escolher(alvo, 0.5, c.a);
	const saida: Acorde[] = [];
	acordes.forEach((x, i) => {
		const ultimo = saida[saida.length - 1];
		const vRaiz = mod12(x.raiz + 7);
		if (sorteados.has(i) && ultimo && ultimo.tempos >= 4 && !(ehDominante(ultimo.qualidade) && ultimo.raiz === vRaiz)) {
			const antes = cifra(ultimo, c.t);
			ultimo.tempos -= 2;
			const novos = [
				criar(x.raiz + 2, x.qualidade === 'menor' ? 'm7b5' : 'min7', ultimo.compasso, 1, 'ii-v'),
				criar(vRaiz, 'dom7', ultimo.compasso, 1, 'ii-v')
			];
			saida.push(...novos);
			c.registrar('ii-v', ultimo.compasso, antes, `${antes} ${cifras(novos, c)}`);
		}
		saida.push(x);
	});
	return saida;
};

/** Antes de um acorde que não é a tônica, o dominante dele (V7/x). */
const dominantesSecundarios: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) => (i > 0 && SIMPLES.has(x.qualidade) && grau(x, c.t) !== 0 ? [i] : []));
	const sorteados = escolher(alvo, 0.6, c.a);
	const saida: Acorde[] = [];
	acordes.forEach((x, i) => {
		const ultimo = saida[saida.length - 1];
		const vRaiz = mod12(x.raiz + 7);
		if (sorteados.has(i) && ultimo && ultimo.tempos >= 4 && ultimo.raiz !== vRaiz) {
			const antes = cifra(ultimo, c.t);
			ultimo.tempos -= 2;
			const dominante = criar(vRaiz, 'dom7', ultimo.compasso, 2, 'dominantes-secundarios');
			saida.push(dominante);
			c.registrar('dominantes-secundarios', ultimo.compasso, antes, `${antes} ${cifra(dominante, c.t)}`);
		}
		saida.push(x);
	});
	return saida;
};

/** Entre dois acordes separados por um tom, um diminuto no semitom acima do primeiro. */
const diminutoPassagem: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) => {
		const prox = acordes[i + 1];
		return prox && x.tempos >= 2 && !x.qualidade.startsWith('dim') && mod12(prox.raiz - x.raiz) === 2 ? [i] : [];
	});
	const sorteados = escolher(alvo, 0.8, c.a);
	return acordes.flatMap((x, i) => {
		if (!sorteados.has(i)) return [x];
		const antes = cifra(x, c.t);
		const dim = criar(x.raiz + 1, 'dim7', x.compasso, 1, 'diminuto-passagem');
		const curto = { ...x, tempos: x.tempos - 1 };
		c.registrar('diminuto-passagem', x.compasso, antes, `${antes} ${cifra(dim, c.t)}`);
		return [curto, dim];
	});
};

/** Troca por um acorde do modo paralelo (maior pede emprestado do menor e vice-versa). */
const emprestimoModal: Aplicar = (acordes, c) => {
	const ultimo = acordes.length - 1;
	const troca = (x: Acorde, i: number): Acorde | undefined => {
		const g = grau(x, c.t);
		if (c.t.modo === 'maior') {
			if (x.qualidade === 'maior' && g === 5) return { ...x, qualidade: 'min6' };
			if (x.qualidade === 'menor' && g === 9) return { ...x, raiz: mod12(c.t.tonica + 8), qualidade: 'maj7' };
			if (x.qualidade === 'menor' && g === 2 && acordes[i + 1] && ehDominante(acordes[i + 1].qualidade))
				return { ...x, qualidade: 'm7b5' };
			if (x.qualidade === 'maior' && g === 7) return { ...x, raiz: mod12(c.t.tonica + 10) };
			return undefined;
		}
		if (x.qualidade === 'menor' && g === 5) return { ...x, qualidade: 'dom7' };
		if (x.qualidade === 'menor' && g === 0 && i === ultimo && i > 0) return { ...x, qualidade: 'maior' };
		return undefined;
	};
	const alvo = acordes.flatMap((x, i) => (troca(x, i) ? [i] : []));
	const sorteados = escolher(alvo, 0.7, c.a);
	return acordes.map((x, i) => {
		if (!sorteados.has(i)) return x;
		const novo = marcar(troca(x, i)!, 'emprestimo-modal');
		c.registrar('emprestimo-modal', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});
};

/** Dominante trocado pelo acorde a um trítono de distância (o mesmo trítono interno). */
const substituicaoTritono: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) => (x.qualidade === 'dom7' ? [i] : []));
	const sorteados = escolher(alvo, 0.7, c.a);
	return acordes.map((x, i) => {
		if (!sorteados.has(i)) return x;
		const novo = marcar({ ...x, raiz: mod12(x.raiz + 6) }, 'substituicao-tritono');
		c.registrar('substituicao-tritono', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});
};

/** Dominante com 7(b9) quando resolve num acorde menor e com 7(#9,b13) nos demais. */
const dominanteAlterado: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) => (x.qualidade === 'dom7' && !tem(x, 'substituicao-tritono') ? [i] : []));
	const sorteados = escolher(alvo, 0.8, c.a);
	return acordes.map((x, i) => {
		if (!sorteados.has(i)) return x;
		const prox = acordes[(i + 1) % acordes.length];
		const novo = marcar({ ...x, qualidade: ehMenor(prox.qualidade) ? 'dom7b9' : 'dom7alt' }, 'dominante-alterado');
		c.registrar('dominante-alterado', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});
};

/** Sétimas, nonas, décimas primeiras e décimas terceiras no lugar das tríades. */
const extensoes: Aplicar = (acordes, c) =>
	acordes.map((x, i) => {
		const g = grau(x, c.t);
		const prox = acordes[(i + 1) % acordes.length];
		let q: Acorde['qualidade'] | undefined;
		if (x.qualidade === 'maior') {
			if (g === 0) q = c.a() < 0.5 ? 'maj9' : 'sexta';
			else if (g === 5 && c.t.modo === 'maior') q = 'maj7s11';
			else if (g === 7 || g === 10) q = 'dom9';
			else q = 'maj7';
		} else if (x.qualidade === 'menor') {
			q = c.a() < 0.4 ? 'min9' : 'min7';
		} else if (x.qualidade === 'dom7') {
			if (tem(x, 'substituicao-tritono')) q = 'dom7s11';
			else if (ehMenor(prox.qualidade)) q = 'dom7b9';
			else q = c.a() < 0.5 ? 'dom13' : 'dom9';
		}
		if (!q) return x;
		const novo = marcar({ ...x, qualidade: q }, 'extensoes');
		c.registrar('extensoes', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});

/** Escolhe a inversão de cada acorde que faz o baixo caminhar por grau conjunto, para baixo. */
const baixoDescendente: Aplicar = (acordes, c) => {
	let anterior = acordes[0]?.baixo ?? acordes[0]?.raiz ?? 0;
	return acordes.map((x, i) => {
		if (i === 0) return x;
		const candidatos = [...new Set(QUALIDADES[x.qualidade].intervalos.slice(0, 4).map((n) => mod12(x.raiz + n)))];
		const custo = (pc: number) => {
			const d = mod12(anterior - pc);
			const passo = d === 0 ? 3 : d <= 2 ? 0 : d <= 4 ? 2 : d >= 10 ? 1 : 4;
			return passo + (pc === x.raiz ? 0 : 0.4);
		};
		const melhor = candidatos.reduce((m, pc) => (custo(pc) < custo(m) ? pc : m), candidatos[0]);
		anterior = melhor;
		if (melhor === x.raiz) return x;
		const novo = marcar({ ...x, baixo: melhor }, 'baixo-descendente');
		c.registrar('baixo-descendente', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});
};

/** Todos os acordes sobre a tônica no baixo. */
const pedal: Aplicar = (acordes, c) =>
	acordes.map((x) => {
		if (x.raiz === c.t.tonica) return x;
		const novo = marcar({ ...x, baixo: c.t.tonica }, 'pedal');
		c.registrar('pedal', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});

const APLICAR: Record<TecnicaId, Aplicar> = {
	backdoor,
	'ii-v': iiV,
	'dominantes-secundarios': dominantesSecundarios,
	'diminuto-passagem': diminutoPassagem,
	'emprestimo-modal': emprestimoModal,
	'substituicao-tritono': substituicaoTritono,
	'dominante-alterado': dominanteAlterado,
	extensoes,
	'baixo-descendente': baixoDescendente,
	pedal
};

// Primeiro o que muda a estrutura, depois as trocas, por fim extensões e baixo.
const ORDEM: readonly TecnicaId[] = [
	'backdoor',
	'ii-v',
	'dominantes-secundarios',
	'diminuto-passagem',
	'emprestimo-modal',
	'substituicao-tritono',
	'dominante-alterado',
	'extensoes',
	'baixo-descendente',
	'pedal'
];

/**
 * Aplica as técnicas na ordem certa, qualquer que seja a ordem pedida.
 * Baixo descendente e pedal brigam pelo baixo: com os dois, vale o descendente.
 */
export function reharmonizar(p: Progressao, tecnicas: readonly TecnicaId[], aleatorio: Aleatorio): Resultado {
	const ativas = new Set(tecnicas);
	if (ativas.has('baixo-descendente')) ativas.delete('pedal');
	const usos: Uso[] = [];
	const contexto: Contexto = {
		t: p.tonalidade,
		a: aleatorio,
		registrar: (tecnica, compasso, antes, depois) => usos.push({ tecnica, compasso, antes, depois })
	};
	let acordes = p.acordes.map((x) => ({ ...x, tecnicas: [...x.tecnicas] }));
	for (const id of ORDEM) if (ativas.has(id)) acordes = APLICAR[id](acordes, contexto);
	return { progressao: { tonalidade: p.tonalidade, acordes }, usos };
}
