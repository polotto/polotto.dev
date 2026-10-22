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
	sortearItem,
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
	'suspensao',
	'baixo-descendente',
	'baixo-ascendente',
	'pedal',
	'baixo-misto'
] as const;

export type TecnicaId = (typeof TECNICAS)[number];

/** Técnicas que decidem o baixo. Só uma vale por vez, na ordem de prioridade. */
export const TECNICAS_DE_BAIXO = ['baixo-misto', 'baixo-descendente', 'baixo-ascendente', 'pedal'] as const satisfies readonly TecnicaId[];

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

/** Acorde que aceita um ii-V ou um dominante antes dele: nem dominante nem diminuto. */
const podeSerAlvo = (x: Acorde) => !ehDominante(x.qualidade) && !x.qualidade.startsWith('dim');

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
	const alvo = acordes.flatMap((x, i) => (i > 0 && podeSerAlvo(x) ? [i] : []));
	const sorteados = escolher(alvo, 0.5, c.a);
	const saida: Acorde[] = [];
	acordes.forEach((x, i) => {
		const ultimo = saida[saida.length - 1];
		const vRaiz = mod12(x.raiz + 7);
		if (sorteados.has(i) && ultimo && ultimo.tempos >= 4 && !(ehDominante(ultimo.qualidade) && ultimo.raiz === vRaiz)) {
			const antes = cifra(ultimo, c.t);
			ultimo.tempos -= 2;
			const novos = [
				criar(x.raiz + 2, ehMenor(x.qualidade) ? 'm7b5' : 'min7', ultimo.compasso, 1, 'ii-v'),
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
	const alvo = acordes.flatMap((x, i) => (i > 0 && podeSerAlvo(x) && grau(x, c.t) !== 0 ? [i] : []));
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

/**
 * Diminuto no semitom abaixo do acorde seguinte, quando ele está a um tom ou a
 * uma terça maior do atual: C, C#dim, Dm ou E7M, G°, G#m7.
 */
const diminutoPassagem: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) => {
		const prox = acordes[i + 1];
		if (!prox || x.tempos < 2 || x.qualidade.startsWith('dim')) return [];
		const d = mod12(prox.raiz - x.raiz);
		return d === 2 || d === 4 ? [i] : [];
	});
	const sorteados = escolher(alvo, 0.8, c.a);
	return acordes.flatMap((x, i) => {
		if (!sorteados.has(i)) return [x];
		const antes = cifra(x, c.t);
		const dim = criar(acordes[i + 1].raiz - 1, 'dim7', x.compasso, 1, 'diminuto-passagem');
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
		if (x.qualidade === 'menor' && g === 5) return { ...x, qualidade: 'maior' };
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

/** O dominante de um compasso inteiro começa suspenso (7(sus4)) e resolve na segunda metade. */
const suspensao: Aplicar = (acordes, c) => {
	const alvo = acordes.flatMap((x, i) =>
		ehDominante(x.qualidade) && x.qualidade !== 'dom7sus4' && x.tempos === 4 && !tem(x, 'substituicao-tritono') ? [i] : []
	);
	const sorteados = escolher(alvo, 0.6, c.a);
	return acordes.flatMap((x, i) => {
		if (!sorteados.has(i)) return [x];
		const sus = { ...marcar({ ...x, qualidade: 'dom7sus4' as const }, 'suspensao'), tempos: 2 };
		const resolvido = { ...x, tempos: 2 };
		c.registrar('suspensao', x.compasso, cifra(x, c.t), `${cifra(sus, c.t)} ${cifra(x, c.t)}`);
		return [sus, resolvido];
	});
};

const baixoDe = (x: Acorde) => x.baixo ?? x.raiz;

/**
 * Escolhe a inversão de cada acorde de `[de, ate)` que faz o baixo caminhar por
 * grau conjunto, para baixo ou para cima. O primeiro acorde da peça não muda.
 */
function caminhar(acordes: Acorde[], c: Contexto, id: 'baixo-descendente' | 'baixo-ascendente', de = 0, ate = acordes.length): Acorde[] {
	const desce = id === 'baixo-descendente';
	const saida = [...acordes];
	let anterior = baixoDe(saida[Math.max(de - 1, 0)]);
	for (let i = Math.max(de, 1); i < ate; i++) {
		const x = saida[i];
		// Só fundamental, terça, quinta e sétima (não a #9 do 7(#9,b13)).
		const candidatos = [...new Set(QUALIDADES[x.qualidade].intervalos.filter((n) => [0, 3, 4, 6, 7, 10, 11].includes(n)).map((n) => mod12(x.raiz + n)))];
		const custo = (pc: number) => {
			const d = desce ? mod12(anterior - pc) : mod12(pc - anterior);
			const passo = d === 0 ? 3 : d <= 2 ? 0 : d <= 4 ? 2 : d >= 10 ? 1 : 4;
			return passo + (pc === x.raiz ? 0 : 0.4);
		};
		const melhor = candidatos.reduce((m, pc) => (custo(pc) < custo(m) ? pc : m), candidatos[0]);
		anterior = melhor;
		if (melhor === x.raiz) continue;
		saida[i] = marcar({ ...x, baixo: melhor }, id);
		c.registrar(id, x.compasso, cifra(x, c.t), cifra(saida[i], c.t));
	}
	return saida;
}

const baixoDescendente: Aplicar = (acordes, c) => caminhar(acordes, c, 'baixo-descendente');
const baixoAscendente: Aplicar = (acordes, c) => caminhar(acordes, c, 'baixo-ascendente');

/** Acordes de `[de, ate)` sobre a tônica no baixo. */
function pedalEm(acordes: Acorde[], c: Contexto, de = 0, ate = acordes.length): Acorde[] {
	return acordes.map((x, i) => {
		if (i < de || i >= ate || x.raiz === c.t.tonica) return x;
		const novo = marcar({ ...x, baixo: c.t.tonica }, 'pedal');
		c.registrar('pedal', x.compasso, cifra(x, c.t), cifra(novo, c.t));
		return novo;
	});
}

const pedal: Aplicar = (acordes, c) => pedalEm(acordes, c);

type TipoDeBaixo = 'fundamental' | 'descendente' | 'ascendente' | 'pedal';
const TIPOS_DE_BAIXO: readonly TipoDeBaixo[] = ['fundamental', 'descendente', 'ascendente', 'pedal'];

/**
 * Mistura os tipos de baixo: divide a peça em trechos de um a três compassos e
 * dá a cada trecho um tipo diferente do anterior (fundamental, descendente,
 * ascendente ou pedal).
 */
const baixoMisto: Aplicar = (acordes, c) => {
	const compassos = [...new Set(acordes.map((x) => x.compasso))];
	let saida = acordes;
	let tipoAnterior: TipoDeBaixo | undefined;
	for (let inicio = 0; inicio < compassos.length; ) {
		const tamanho = Math.min(compassos.length - inicio, 1 + inteiro(3, c.a));
		const tipo = sortearItem(TIPOS_DE_BAIXO.filter((x) => x !== tipoAnterior), c.a);
		tipoAnterior = tipo;
		const de = acordes.findIndex((x) => x.compasso === compassos[inicio]);
		const fim = inicio + tamanho;
		const ate = fim < compassos.length ? acordes.findIndex((x) => x.compasso === compassos[fim]) : acordes.length;
		if (tipo === 'descendente') saida = caminhar(saida, c, 'baixo-descendente', de, ate);
		else if (tipo === 'ascendente') saida = caminhar(saida, c, 'baixo-ascendente', de, ate);
		else if (tipo === 'pedal') saida = pedalEm(saida, c, de, ate);
		inicio = fim;
	}
	return saida;
};

const APLICAR: Record<TecnicaId, Aplicar> = {
	backdoor,
	'ii-v': iiV,
	'dominantes-secundarios': dominantesSecundarios,
	'diminuto-passagem': diminutoPassagem,
	'emprestimo-modal': emprestimoModal,
	'substituicao-tritono': substituicaoTritono,
	'dominante-alterado': dominanteAlterado,
	extensoes,
	suspensao,
	'baixo-descendente': baixoDescendente,
	'baixo-ascendente': baixoAscendente,
	pedal,
	'baixo-misto': baixoMisto
};

// O empréstimo modal troca o acorde de destino, então vem antes de tudo que
// insere acordes para chegar nele (backdoor, ii-V, dominantes, diminuto).
// Depois as trocas, por fim extensões e baixo.
const ORDEM: readonly TecnicaId[] = [
	'emprestimo-modal',
	'backdoor',
	'ii-v',
	'dominantes-secundarios',
	'diminuto-passagem',
	'substituicao-tritono',
	'dominante-alterado',
	'extensoes',
	'suspensao',
	'baixo-descendente',
	'baixo-ascendente',
	'pedal',
	'baixo-misto'
];

/**
 * Aplica as técnicas na ordem certa, qualquer que seja a ordem pedida.
 * As técnicas de baixo brigam pelo baixo: vale só a primeira de
 * `TECNICAS_DE_BAIXO` (misto, descendente, ascendente, pedal).
 */
export function reharmonizar(p: Progressao, tecnicas: readonly TecnicaId[], aleatorio: Aleatorio): Resultado {
	const ativas = new Set(tecnicas);
	const baixoEscolhido = TECNICAS_DE_BAIXO.find((id) => ativas.has(id));
	for (const id of TECNICAS_DE_BAIXO) if (id !== baixoEscolhido) ativas.delete(id);
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
