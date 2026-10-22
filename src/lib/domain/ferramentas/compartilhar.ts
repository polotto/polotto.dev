// Semente para compartilhar: um código curto com tudo que define a música.
// Quem abre o código recebe a mesma sequência, a mesma reharmonização e a
// mesma melodia, com as mesmas opções.

import type { Modo } from './acordes';
import { TECNICAS, TECNICAS_DE_BAIXO, type TecnicaId } from './reharmonizacao';

export type BaixoEscolhido = 'nenhum' | 'baixo-descendente' | 'pedal' | 'baixo-ascendente' | 'baixo-misto';
export type VersaoEscolhida = 'original' | 'reharmonizada';

export type Configuracao = {
	sementeProgressao: number;
	sementeReharmonizacao: number;
	sementeMelodia: number;
	modo: Modo | 'qualquer';
	tonica: number | 'qualquer';
	compassos: 4 | 8;
	tecnicas: TecnicaId[];
	baixo: BaixoEscolhido;
	versao: VersaoEscolhida;
	bpm: number;
	comMelodia: boolean;
	repetir: boolean;
};

export const BPM_MIN = 50;
export const BPM_MAX = 160;

const VERSAO_DO_CODIGO = '1';
const SEPARADOR = '-';
const MAXIMO_SEMENTE = 2 ** 32 - 1;

// A posição de cada técnica no código nunca muda. Técnica nova entra no fim.
const ORDEM_TECNICAS: readonly TecnicaId[] = [
	'extensoes',
	'ii-v',
	'dominantes-secundarios',
	'substituicao-tritono',
	'emprestimo-modal',
	'diminuto-passagem',
	'backdoor',
	'dominante-alterado',
	'suspensao'
];
// Como as técnicas: a posição nunca muda, opção nova entra no fim.
const BAIXOS: readonly BaixoEscolhido[] = ['nenhum', 'baixo-descendente', 'pedal', 'baixo-ascendente', 'baixo-misto'];
const MODOS = { maior: 'm', menor: 'n', qualquer: 'x' } as const;

/** Toda técnica de acorde livre tem posição no código. */
export const tecnicasSemPosicao = () =>
	TECNICAS.filter((id) => !(TECNICAS_DE_BAIXO as readonly string[]).includes(id) && !ORDEM_TECNICAS.includes(id));

export function codificar(c: Configuracao): string {
	const mascara = ORDEM_TECNICAS.reduce((m, id, i) => (c.tecnicas.includes(id) ? m | (1 << i) : m), 0);
	return [
		VERSAO_DO_CODIGO,
		c.sementeProgressao.toString(36),
		c.sementeReharmonizacao.toString(36),
		c.sementeMelodia.toString(36),
		MODOS[c.modo],
		c.tonica === 'qualquer' ? 'x' : c.tonica.toString(12),
		c.compassos,
		mascara.toString(36),
		BAIXOS.indexOf(c.baixo),
		c.versao === 'original' ? 0 : 1,
		c.bpm.toString(36),
		c.comMelodia ? 1 : 0,
		c.repetir ? 1 : 0
	].join(SEPARADOR);
}

function semente(texto: string): number | undefined {
	if (!/^[0-9a-z]{1,7}$/.test(texto)) return undefined;
	const n = parseInt(texto, 36);
	return n <= MAXIMO_SEMENTE ? n : undefined;
}

/** `undefined` quando o código não é válido. Aceita o link inteiro ou só o código. */
export function decodificar(entrada: string): Configuracao | undefined {
	const bruto = entrada.trim();
	const achado = bruto.match(/(?:[#?&]s=|^)(1(?:-[0-9a-z]+){12})$/i);
	if (!achado) return undefined;
	const [, sp, sr, sm, md, tn, cp, mk, bx, vs, bp, ml, rp] = achado[1].toLowerCase().split(SEPARADOR);

	const sementeProgressao = semente(sp);
	const sementeReharmonizacao = semente(sr);
	const sementeMelodia = semente(sm);
	if (sementeProgressao === undefined || sementeReharmonizacao === undefined || sementeMelodia === undefined) return undefined;

	const modo = (Object.keys(MODOS) as (keyof typeof MODOS)[]).find((k) => MODOS[k] === md);
	if (!modo) return undefined;

	let tonica: number | 'qualquer';
	if (tn === 'x') tonica = 'qualquer';
	else if (/^[0-9ab]$/.test(tn)) tonica = parseInt(tn, 12);
	else return undefined;

	if (cp !== '4' && cp !== '8') return undefined;
	const compassos = cp === '4' ? 4 : 8;

	if (!/^[0-9a-z]{1,4}$/.test(mk)) return undefined;
	const mascara = parseInt(mk, 36);
	if (mascara >= 1 << ORDEM_TECNICAS.length) return undefined;
	const tecnicas = ORDEM_TECNICAS.filter((_, i) => mascara & (1 << i));

	const baixo = BAIXOS[Number(bx)];
	if (!/^[0-4]$/.test(bx) || !baixo) return undefined;

	if (vs !== '0' && vs !== '1') return undefined;
	if (ml !== '0' && ml !== '1') return undefined;
	if (rp !== '0' && rp !== '1') return undefined;

	if (!/^[0-9a-z]{1,3}$/.test(bp)) return undefined;
	const bpm = parseInt(bp, 36);
	if (bpm < BPM_MIN || bpm > BPM_MAX) return undefined;

	return {
		sementeProgressao,
		sementeReharmonizacao,
		sementeMelodia,
		modo,
		tonica,
		compassos,
		tecnicas,
		baixo,
		versao: vs === '0' ? 'original' : 'reharmonizada',
		bpm,
		comMelodia: ml === '1',
		repetir: rp === '1'
	};
}
