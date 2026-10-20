// Voicing: em que notas do piano cada acorde cai. A mão esquerda toca o baixo,
// a direita toca o acorde, escolhendo a inversão que se move menos.

import { mod12, QUALIDADES, type Acorde, type Progressao } from './acordes';

/** Notas MIDI (60 = dó central). */
export type Voicing = { baixo: number; mao: number[] };

const BAIXO_MIN = 36;
const BAIXO_MAX = 52;
const MAO_MIN = 52;
const MAO_MAX = 79;
const CENTRO_INICIAL = 64;

/**
 * Classes de altura da mão direita. Acorde com cinco notas ou mais perde a
 * quinta e, quando o baixo já toca a fundamental, a fundamental também.
 */
export function notasMaoDireita(a: Acorde): number[] {
	let intervalos: number[] = [...QUALIDADES[a.qualidade].intervalos];
	if (intervalos.length >= 5) intervalos = intervalos.filter((i) => i % 12 !== 7);
	if (intervalos.length >= 5 && (a.baixo === undefined || a.baixo === a.raiz)) intervalos = intervalos.filter((i) => i !== 0);
	return intervalos.map((i) => mod12(a.raiz + i));
}

const media = (notas: number[]) => notas.reduce((s, n) => s + n, 0) / notas.length;

export function voicingDoAcorde(a: Acorde, anterior?: Voicing): Voicing {
	const pcs = notasMaoDireita(a);
	const alvo = anterior ? media(anterior.mao) : CENTRO_INICIAL;
	let mao: number[] = [];
	let melhor = Infinity;
	for (let r = 0; r < pcs.length; r++) {
		const ordem = [...pcs.slice(r), ...pcs.slice(0, r)];
		for (let inicio = MAO_MIN; inicio <= 64; inicio++) {
			const notas = [inicio + mod12(ordem[0] - inicio)];
			for (let k = 1; k < ordem.length; k++) {
				const piso = notas[k - 1] + 1;
				notas.push(piso + mod12(ordem[k] - piso));
			}
			const topo = notas[notas.length - 1];
			if (topo > MAO_MAX) continue;
			const custo = Math.abs(media(notas) - alvo) + 0.2 * (topo - notas[0]);
			if (custo < melhor) {
				melhor = custo;
				mao = notas;
			}
		}
	}

	const pcBaixo = a.baixo ?? a.raiz;
	const primeiro = BAIXO_MIN + mod12(pcBaixo - BAIXO_MIN);
	const opcoes = [primeiro, primeiro + 12].filter((n) => n <= BAIXO_MAX);
	const baixo = anterior
		? opcoes.reduce((m, n) => (Math.abs(n - anterior.baixo) < Math.abs(m - anterior.baixo) ? n : m), opcoes[0])
		: primeiro;
	return { baixo, mao };
}

export function voicings(p: Progressao): Voicing[] {
	const saida: Voicing[] = [];
	for (const a of p.acordes) saida.push(voicingDoAcorde(a, saida[saida.length - 1]));
	return saida;
}
