// Linha melódica sobre a harmonia: nos tempos fortes, notas do acorde; nos
// fracos, a escala do acorde andando por grau conjunto; no fim de cada
// acorde, uma nota que aproxima do próximo.

import { grau, mod12, QUALIDADES, sortearItem, type Acorde, type Aleatorio, type Progressao, type Tonalidade } from './acordes';

/** Nota MIDI, início e duração em tempos desde o começo da progressão. */
export type NotaMelodia = { midi: number; inicio: number; duracao: number; acorde: number };

const MIN = 60;
const MAX = 79;

const JONICO = [0, 2, 4, 5, 7, 9, 11];
const LIDIO = [0, 2, 4, 6, 7, 9, 11];
const DORICO = [0, 2, 3, 5, 7, 9, 10];
const EOLIO = [0, 2, 3, 5, 7, 8, 10];
const MIXOLIDIO = [0, 2, 4, 5, 7, 9, 10];

/** Escala que combina com o acorde, em semitons a partir da fundamental. */
export function escalaDoAcorde(a: Acorde, t: Tonalidade): number[] {
	switch (a.qualidade) {
		case 'maior':
		case 'maj7':
			return grau(a, t) === 5 && t.modo === 'maior' ? LIDIO : JONICO;
		case 'sexta':
		case 'maj9':
			return JONICO;
		case 'maj7s11':
			return LIDIO;
		case 'menor':
		case 'min7':
		case 'min9':
			return t.modo === 'menor' && grau(a, t) === 0 ? EOLIO : DORICO;
		case 'min6':
			return DORICO;
		case 'mmaj7':
			return [0, 2, 3, 5, 7, 9, 11];
		case 'm7b5':
			return [0, 2, 3, 5, 6, 8, 10];
		case 'dim7':
			return [0, 2, 3, 5, 6, 8, 9, 11];
		case 'dom7':
		case 'dom9':
		case 'dom13':
			return MIXOLIDIO;
		case 'dom7s11':
			return [0, 2, 4, 6, 7, 9, 10];
		case 'dom7b9':
			return [0, 1, 3, 4, 6, 7, 9, 10];
		case 'dom7alt':
			return [0, 1, 3, 4, 6, 8, 10];
	}
}

const PADROES_DE_4: readonly (readonly number[])[] = [
	[1, 1, 1, 1],
	[1.5, 0.5, 1, 1],
	[2, 1, 1],
	[1, 0.5, 0.5, 2],
	[0.5, 0.5, 1, 2],
	[1.5, 1.5, 1]
];

/** Ritmo de um acorde de `tempos` tempos, derivado do padrão escolhido para o compasso. */
function ritmo(tempos: number, padrao: readonly number[], ultimo: boolean): readonly number[] {
	if (ultimo) return tempos >= 3 ? [2, tempos - 2] : [tempos];
	if (tempos === 4) return padrao;
	if (tempos === 3) return padrao.length > 3 ? [1, 1, 1] : [2, 1];
	if (tempos === 2) return padrao.length > 3 ? [1.5, 0.5] : [1, 1];
	return [tempos];
}

function notasNaFaixa(raiz: number, intervalos: readonly number[]): number[] {
	const pcs = new Set(intervalos.map((i) => mod12(raiz + i)));
	const notas: number[] = [];
	for (let n = MIN; n <= MAX; n++) if (pcs.has(mod12(n))) notas.push(n);
	return notas;
}

const maisPerto = (notas: number[], alvo: number) =>
	notas.reduce((m, n) => (Math.abs(n - alvo) < Math.abs(m - alvo) ? n : m), notas[0]);

export function gerarMelodia(p: Progressao, a: Aleatorio): NotaMelodia[] {
	const padraoPar = sortearItem(PADROES_DE_4, a);
	const padraoImpar = sortearItem(PADROES_DE_4, a);
	const notas: NotaMelodia[] = [];
	let relogio = 0;
	let anterior = 0;
	let direcao = a() < 0.5 ? 1 : -1;

	p.acordes.forEach((acorde, i) => {
		const ultimoAcorde = i === p.acordes.length - 1;
		const proximo = p.acordes[i + 1];
		const tons = notasNaFaixa(acorde.raiz, QUALIDADES[acorde.qualidade].intervalos);
		const escala = notasNaFaixa(acorde.raiz, escalaDoAcorde(acorde, p.tonalidade));
		const duracoes = ritmo(acorde.tempos, acorde.compasso % 2 === 0 ? padraoPar : padraoImpar, ultimoAcorde);
		let pos = 0;

		duracoes.forEach((duracao, k) => {
			const ultimaDoAcorde = k === duracoes.length - 1;
			const forte = pos % 2 === 0;
			let midi: number;

			if (i === 0 && k === 0) {
				const proximas = [...tons].sort((x, y) => Math.abs(x - 67) - Math.abs(y - 67)).slice(0, 3);
				midi = sortearItem(proximas, a);
			} else if (ultimoAcorde && ultimaDoAcorde) {
				// Termina na fundamental ou na terça.
				const repouso = notasNaFaixa(acorde.raiz, QUALIDADES[acorde.qualidade].intervalos.slice(0, 2));
				midi = maisPerto(repouso, anterior);
			} else if (forte) {
				const proximas = [...tons].sort((x, y) => Math.abs(x - anterior) - Math.abs(y - anterior));
				const perto = proximas.filter((n) => Math.abs(n - anterior) <= 5).slice(0, 2);
				midi = perto.length > 0 ? sortearItem(perto, a) : proximas[0];
			} else if (ultimaDoAcorde && proximo) {
				const tonsDoProximo = notasNaFaixa(proximo.raiz, QUALIDADES[proximo.qualidade].intervalos);
				const alvo = maisPerto(tonsDoProximo, anterior);
				const aproximacao = escala.filter((n) => Math.abs(n - alvo) >= 1 && Math.abs(n - alvo) <= 2);
				midi = aproximacao.length > 0 ? maisPerto(aproximacao, anterior) : maisPerto(escala, anterior);
			} else {
				const indice = escala.indexOf(maisPerto(escala, anterior));
				if (a() < 0.2) {
					midi = escala[indice];
				} else {
					if (a() < 0.25) direcao = -direcao;
					let seguinte = indice + direcao;
					if (seguinte < 0 || seguinte >= escala.length) {
						direcao = -direcao;
						seguinte = indice + direcao;
					}
					midi = escala[Math.min(Math.max(seguinte, 0), escala.length - 1)];
				}
			}

			if (i > 0 || k > 0) direcao = midi > anterior ? 1 : midi < anterior ? -1 : direcao;
			if (midi >= 76) direcao = -1;
			if (midi <= 62) direcao = 1;

			notas.push({ midi, inicio: relogio, duracao, acorde: i });
			anterior = midi;
			relogio += duracao;
			pos += duracao;
		});
	});
	return notas;
}
