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

function ordenar(valor: unknown): unknown {
	if (Array.isArray(valor)) return valor.map(ordenar);
	if (valor && typeof valor === 'object') {
		return Object.fromEntries(
			Object.keys(valor)
				.sort()
				.map((k) => [k, ordenar((valor as Record<string, unknown>)[k])])
		);
	}
	return valor;
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
	let valor: unknown;
	try {
		valor = JSON.parse(texto);
	} catch (e) {
		const mensagem = e instanceof Error ? e.message : String(e);
		return { ok: false, mensagem, ...linhaEColuna(texto, posicaoDoErro(texto)) };
	}
	if (ordenarChaves) valor = ordenar(valor);
	const espaco = modo === 'minificar' ? undefined : indentacao === 'tab' ? '\t' : indentacao;
	return { ok: true, texto: JSON.stringify(valor, null, espaco) };
}
