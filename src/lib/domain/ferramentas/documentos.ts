// CPF e CNPJ: gerar, validar e formatar.
//
// Desde julho de 2026 o CNPJ pode ser alfanumérico (IN RFB 2.229/2024): as
// 12 primeiras posições aceitam letra maiúscula e os 2 dígitos verificadores
// continuam números. O cálculo é o mesmo módulo 11, com o valor de cada
// caractere igual ao código ASCII menos 48 (0 a 9 continuam 0 a 9, A vale 17).

export type TipoDocumento = 'cpf' | 'cnpj';

export type Validacao =
	| { valido: true; tipo: TipoDocumento; formatado: string }
	| { valido: false; motivo: 'vazio' | 'tamanho' | 'caractere' | 'repetido' | 'digito' };

type Sorteio = () => number;

const valor = (c: string) => c.charCodeAt(0) - 48;

function digito(base: string, pesos: number[]): number {
	const soma = [...base].reduce((total, c, i) => total + valor(c) * pesos[i], 0);
	const resto = soma % 11;
	return resto < 2 ? 0 : 11 - resto;
}

const PESOS_CPF = (n: number) => Array.from({ length: n }, (_, i) => n + 1 - i);
const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_2 = [6, ...PESOS_CNPJ_1];

function digitosCpf(base: string): string {
	const d1 = digito(base, PESOS_CPF(9));
	const d2 = digito(base + d1, PESOS_CPF(10));
	return `${d1}${d2}`;
}

function digitosCnpj(base: string): string {
	const d1 = digito(base, PESOS_CNPJ_1);
	const d2 = digito(base + d1, PESOS_CNPJ_2);
	return `${d1}${d2}`;
}

/** Tira máscara e espaço. Letra vira maiúscula (CNPJ alfanumérico). */
export function limpar(texto: string): string {
	return texto.replace(/[\s.\-/]/g, '').toUpperCase();
}

export function formatar(tipo: TipoDocumento, limpo: string): string {
	return tipo === 'cpf'
		? limpo.replace(/^(.{3})(.{3})(.{3})(.{2})$/, '$1.$2.$3-$4')
		: limpo.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, '$1.$2.$3/$4-$5');
}

/** Descobre pelo tamanho se é CPF (11) ou CNPJ (14) e confere os dígitos. */
export function validar(texto: string): Validacao {
	const limpo = limpar(texto);
	if (!limpo) return { valido: false, motivo: 'vazio' };
	const tipo: TipoDocumento | undefined =
		limpo.length === 11 ? 'cpf' : limpo.length === 14 ? 'cnpj' : undefined;
	if (!tipo) return { valido: false, motivo: 'tamanho' };
	const formato = tipo === 'cpf' ? /^\d{11}$/ : /^[0-9A-Z]{12}\d{2}$/;
	if (!formato.test(limpo)) return { valido: false, motivo: 'caractere' };
	// Todos iguais passa no módulo 11, mas a Receita não emite.
	if (/^(.)\1+$/.test(limpo)) return { valido: false, motivo: 'repetido' };
	const base = limpo.slice(0, -2);
	const esperado = tipo === 'cpf' ? digitosCpf(base) : digitosCnpj(base);
	if (limpo.slice(-2) !== esperado) return { valido: false, motivo: 'digito' };
	return { valido: true, tipo, formatado: formatar(tipo, limpo) };
}

const NUMEROS = '0123456789';
const ALFANUMERICOS = NUMEROS + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function sortear(alfabeto: string, n: number, sorteio: Sorteio): string {
	return Array.from({ length: n }, () => alfabeto[Math.floor(sorteio() * alfabeto.length)]).join('');
}

export type OpcoesGeracao = {
	tipo: TipoDocumento;
	/** Só para CNPJ: as 12 primeiras posições podem ter letra. */
	alfanumerico?: boolean;
	sorteio?: Sorteio;
};

/** Gera um documento válido, sem máscara. */
export function gerar({ tipo, alfanumerico = false, sorteio = Math.random }: OpcoesGeracao): string {
	for (;;) {
		if (tipo === 'cpf') {
			const base = sortear(NUMEROS, 9, sorteio);
			if (/^(.)\1+$/.test(base)) continue;
			return base + digitosCpf(base);
		}
		// Filial 0001, como a maioria dos CNPJs de matriz.
		const raiz = sortear(alfanumerico ? ALFANUMERICOS : NUMEROS, 8, sorteio);
		if (/^(.)\1+$/.test(raiz)) continue;
		const base = `${raiz}0001`;
		return base + digitosCnpj(base);
	}
}
