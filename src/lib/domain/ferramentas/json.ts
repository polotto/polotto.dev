// Validar, formatar e minificar JSON, com a posição do erro em linha e coluna.

export type Indentacao = 2 | 4 | 'tab';

export type ResultadoJson =
	| { ok: true; texto: string }
	| { ok: false; mensagem: string; linha: number; coluna: number };

export type OpcoesJson = {
	modo: 'formatar' | 'minificar';
	indentacao?: Indentacao;
	ordenarChaves?: boolean;
};

// Árvore que guarda o literal de cada número e de cada texto, como estava no
// original. Passar por JSON.parse e JSON.stringify mudaria o dado: 1.0 viraria
// 1 e um inteiro grande perderia dígitos.
type No =
	| { tipo: 'literal'; texto: string }
	| { tipo: 'lista'; itens: No[] }
	| { tipo: 'objeto'; campos: { chave: string; chaveLida: string; valor: No }[] };

/** Lê um texto que o JSON.parse já aceitou. */
function lerArvore(texto: string): No {
	let i = 0;
	const espacos = () => {
		while (/[ \t\n\r]/.test(texto[i] ?? '')) i++;
	};
	const cadeia = () => {
		const inicio = i++;
		while (texto[i] !== '"') i += texto[i] === '\\' ? 2 : 1;
		return texto.slice(inicio, ++i);
	};
	const valor = (): No => {
		espacos();
		const c = texto[i];
		if (c === '{') {
			i++;
			const campos: { chave: string; chaveLida: string; valor: No }[] = [];
			espacos();
			if (texto[i] === '}') return (i++, { tipo: 'objeto', campos });
			for (;;) {
				espacos();
				const chaveLida = cadeia();
				espacos();
				i++; // :
				campos.push({ chave: JSON.parse(chaveLida) as string, chaveLida, valor: valor() });
				espacos();
				if (texto[i++] === '}') return { tipo: 'objeto', campos };
			}
		}
		if (c === '[') {
			i++;
			const itens: No[] = [];
			espacos();
			if (texto[i] === ']') return (i++, { tipo: 'lista', itens });
			for (;;) {
				itens.push(valor());
				espacos();
				if (texto[i++] === ']') return { tipo: 'lista', itens };
			}
		}
		if (c === '"') return { tipo: 'literal', texto: cadeia() };
		const inicio = i;
		while (i < texto.length && !/[,\]} \t\n\r]/.test(texto[i])) i++;
		return { tipo: 'literal', texto: texto.slice(inicio, i) };
	};
	return valor();
}

function ordenar(no: No): No {
	if (no.tipo === 'lista') return { tipo: 'lista', itens: no.itens.map(ordenar) };
	if (no.tipo === 'objeto') {
		const campos = no.campos.map((c) => ({ ...c, valor: ordenar(c.valor) }));
		campos.sort((x, y) => (x.chave < y.chave ? -1 : x.chave > y.chave ? 1 : 0));
		return { tipo: 'objeto', campos };
	}
	return no;
}

function escrever(no: No, espaco: string | undefined, nivel = 0): string {
	if (no.tipo === 'literal') return no.texto;
	const vazio = no.tipo === 'lista' ? no.itens.length === 0 : no.campos.length === 0;
	const [abre, fecha] = no.tipo === 'lista' ? ['[', ']'] : ['{', '}'];
	if (vazio) return abre + fecha;
	const filhos =
		no.tipo === 'lista'
			? no.itens.map((n) => escrever(n, espaco, nivel + 1))
			: no.campos.map((c) => `${c.chaveLida}:${espaco === undefined ? '' : ' '}${escrever(c.valor, espaco, nivel + 1)}`);
	if (espaco === undefined) return `${abre}${filhos.join(',')}${fecha}`;
	const dentro = espaco.repeat(nivel + 1);
	return `${abre}\n${filhos.map((f) => dentro + f).join(',\n')}\n${espaco.repeat(nivel)}${fecha}`;
}

/** Linha e coluna (a partir de 1) de um índice do texto. */
export function linhaEColuna(texto: string, posicao: number): { linha: number; coluna: number } {
	const antes = texto.slice(0, posicao).split('\n');
	return { linha: antes.length, coluna: antes.at(-1)!.length + 1 };
}

// A mensagem do JSON.parse muda entre navegadores e nem sempre traz a
// posição. Quando o parse falha, este leitor percorre o texto e devolve o
// índice do primeiro caractere que não cabe na gramática do JSON.
export function posicaoDoErro(texto: string): number {
	let i = 0;
	const espacos = () => {
		while (/[ \t\n\r]/.test(texto[i] ?? '')) i++;
	};
	const falha = (): never => {
		throw i;
	};
	const literal = (palavra: string) => {
		for (const c of palavra) if (texto[i++] !== c) (i--, falha());
	};
	const texto_ = () => {
		i++;
		while (i < texto.length && texto[i] !== '"') {
			if (texto[i] < ' ') falha();
			if (texto[i] === '\\') {
				i++;
				if (texto[i] === 'u') {
					for (let k = 1; k <= 4; k++) if (!/[0-9a-fA-F]/.test(texto[i + k] ?? '')) (i += k, falha());
					i += 4;
				} else if (!'"\\/bfnrt'.includes(texto[i] ?? 'x')) falha();
			}
			i++;
		}
		if (texto[i] !== '"') falha();
		i++;
	};
	const numero = () => {
		const m = texto.slice(i).match(/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/);
		if (!m || !m[0] || m[0] === '-') falha();
		i += m![0].length;
	};
	const valor = (): void => {
		espacos();
		const c = texto[i];
		if (c === '{') {
			i++;
			espacos();
			if (texto[i] === '}') return void i++;
			for (;;) {
				espacos();
				if (texto[i] !== '"') falha();
				texto_();
				espacos();
				if (texto[i] !== ':') falha();
				i++;
				valor();
				espacos();
				if (texto[i] === ',') i++;
				else if (texto[i] === '}') return void i++;
				else falha();
			}
		}
		if (c === '[') {
			i++;
			espacos();
			if (texto[i] === ']') return void i++;
			for (;;) {
				valor();
				espacos();
				if (texto[i] === ',') i++;
				else if (texto[i] === ']') return void i++;
				else falha();
			}
		}
		if (c === '"') return texto_();
		if (c === 't') return literal('true');
		if (c === 'f') return literal('false');
		if (c === 'n') return literal('null');
		return numero();
	};
	try {
		valor();
		espacos();
		if (i < texto.length) falha();
	} catch (pos) {
		return Math.min(pos as number, texto.length);
	}
	return texto.length;
}

export function processarJson(texto: string, { modo, indentacao = 2, ordenarChaves = false }: OpcoesJson): ResultadoJson {
	try {
		JSON.parse(texto);
	} catch (e) {
		const mensagem = e instanceof Error ? e.message : String(e);
		return { ok: false, mensagem, ...linhaEColuna(texto, posicaoDoErro(texto)) };
	}
	let arvore = lerArvore(texto);
	if (ordenarChaves) arvore = ordenar(arvore);
	const espaco = modo === 'minificar' ? undefined : indentacao === 'tab' ? '\t' : ' '.repeat(indentacao);
	return { ok: true, texto: escrever(arvore, espaco) };
}
