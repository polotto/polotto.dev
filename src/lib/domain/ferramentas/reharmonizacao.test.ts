import { describe, expect, it } from 'vitest';
import { cifraEmTexto, criarAleatorio, novoAcorde, sortearProgressao, type Progressao } from './acordes';
import { reharmonizar, TECNICAS, type TecnicaId } from './reharmonizacao';

const sempre = () => 0;

/** Procura a semente que sorteia a progressão em C maior com a cifra pedida. */
const emC = (cifras: string): Progressao => {
	for (let semente = 0; semente < 500; semente++) {
		const p = sortearProgressao(criarAleatorio(semente), { tonica: 0, modo: 'maior', compassos: 4 });
		if (cifraEmTexto(p) === cifras) return p;
	}
	throw new Error(`nenhum sorteio deu ${cifras}`);
};

const texto = (p: Progressao, tecnicas: TecnicaId[]) => cifraEmTexto(reharmonizar(p, tecnicas, sempre).progressao);

describe('reharmonização', () => {
	const base = emC('| C | Am | Dm | G7 |');
	const iviv = emC('| C | F | G7 | C |');

	it('parte das progressões esperadas', () => {
		expect(cifraEmTexto(base)).toBe('| C | Am | Dm | G7 |');
		expect(cifraEmTexto(iviv)).toBe('| C | F | G7 | C |');
	});

	it('extensões: sétimas, nonas e décimas terceiras', () => {
		expect(texto(base, ['extensoes'])).toBe('| C7M(9) | Am9 | Dm9 | G13 |');
	});

	it('ii-V de aproximação divide o compasso anterior', () => {
		expect(texto(base, ['ii-v'])).toBe('| C Bm7(b5) E7 | Am Em7(b5) A7 | Dm | G7 |');
	});

	it('dominante secundário antes do acorde de destino', () => {
		expect(texto(base, ['dominantes-secundarios'])).toBe('| C E7 | Am | Dm | G7 |');
	});

	it('substituição de trítono', () => {
		expect(texto(base, ['substituicao-tritono'])).toBe('| C | Am | Dm | Db7 |');
	});

	it('backdoor troca V7 por iv7 e bVII7 antes da tônica', () => {
		expect(texto(iviv, ['backdoor'])).toBe('| C | F | Fm7 Bb7 | C |');
	});

	it('diminuto de passagem entre acordes a um tom', () => {
		expect(texto(iviv, ['diminuto-passagem'])).toBe('| C | F F#dim | G7 | C |');
	});

	it('diminuto também aproxima de um acorde a uma terça maior', () => {
		const samurai: Progressao = {
			tonalidade: { tonica: 4, modo: 'maior' },
			acordes: [novoAcorde(4, 'maj7', 0), novoAcorde(8, 'min7', 1)]
		};
		expect(cifraEmTexto(reharmonizar(samurai, ['diminuto-passagem'], sempre).progressao)).toBe('| E7M Gdim | G#m7 |');
	});

	it('suspensão divide o dominante em 7(sus4) e 7', () => {
		expect(texto(base, ['suspensao'])).toBe('| C | Am | Dm | G7(sus4) G7 |');
	});

	it('empréstimo modal: IV vira iv com sexta', () => {
		expect(texto(iviv, ['emprestimo-modal'])).toContain('Fm6');
	});

	it('dominante alterado usa 7(b9) para acorde menor e 7(#9,b13) para os demais', () => {
		expect(texto(iviv, ['dominante-alterado'])).toBe('| C | F | G7(#9,b13) | C |');
		const menor = sortearProgressao(sempre, { tonica: 9, modo: 'menor', compassos: 4 });
		expect(cifraEmTexto(menor)).toBe('| Am | Dm | E7 | Am |');
		expect(texto(menor, ['dominante-alterado'])).toBe('| Am | Dm | E7(b9) | Am |');
	});

	it('baixo descendente usa inversões que andam por grau conjunto', () => {
		expect(texto(base, ['baixo-descendente'])).toBe('| C | Am | Dm/F | G7 |');
	});

	it('pedal põe a tônica no baixo dos outros acordes', () => {
		expect(texto(base, ['pedal'])).toBe('| C | Am/C | Dm/C | G7/C |');
	});

	it('com baixo descendente e pedal juntos, vale o descendente', () => {
		expect(texto(base, ['pedal', 'baixo-descendente'])).toBe(texto(base, ['baixo-descendente']));
	});

	it('baixo ascendente usa inversões que sobem por grau conjunto', () => {
		const t = texto(base, ['baixo-ascendente']);
		expect(t).not.toBe(texto(base, []));
		expect(t.startsWith('| C |')).toBe(true);
	});

	it('baixo misto: vale só um baixo, e os sorteios usam os três tipos que mexem nos acordes', () => {
		expect(texto(base, ['pedal', 'baixo-misto'])).toBe(texto(base, ['baixo-misto']));
		const grande = sortearProgressao(sempre, { tonica: 0, modo: 'maior', compassos: 8 });
		const tipos = new Set<string>();
		for (let semente = 1; semente <= 40; semente++) {
			const r = reharmonizar(grande, ['baixo-misto'], criarAleatorio(semente));
			const usados = new Set(r.usos.map((u) => u.tecnica));
			for (const u of usados) tipos.add(u);
		}
		expect([...tipos].sort()).toEqual(['baixo-ascendente', 'baixo-descendente', 'pedal']);
	});

	it('não mexe na progressão original e conta o que fez', () => {
		const antes = cifraEmTexto(base);
		const r = reharmonizar(base, ['extensoes', 'substituicao-tritono'], sempre);
		expect(cifraEmTexto(base)).toBe(antes);
		expect(r.usos.some((u) => u.tecnica === 'substituicao-tritono' && u.antes === 'G7' && u.depois === 'Db7')).toBe(true);
		expect(r.progressao.acordes[3].tecnicas).toEqual(['substituicao-tritono', 'extensoes']);
	});

	it('a ordem pedida não muda o resultado', () => {
		const a = reharmonizar(base, ['extensoes', 'ii-v', 'pedal'], criarAleatorio(5));
		const b = reharmonizar(base, ['pedal', 'ii-v', 'extensoes'], criarAleatorio(5));
		expect(cifraEmTexto(a.progressao)).toBe(cifraEmTexto(b.progressao));
	});

	it('todo dominante inserido resolve uma quinta abaixo no acorde seguinte', () => {
		const tecnicas: TecnicaId[] = ['emprestimo-modal', 'backdoor', 'ii-v', 'dominantes-secundarios', 'diminuto-passagem'];
		for (let semente = 0; semente < 300; semente++) {
			const a = criarAleatorio(semente);
			const { progressao } = reharmonizar(sortearProgressao(a), tecnicas, a);
			const { acordes } = progressao;
			acordes.forEach((x, i) => {
				const prox = acordes[i + 1];
				if (!prox) return;
				const inserido = x.tecnicas.includes('ii-v') || x.tecnicas.includes('dominantes-secundarios');
				if (inserido && x.qualidade === 'dom7') expect((x.raiz - 7 + 12) % 12, `semente ${semente}`).toBe(prox.raiz);
				if (x.tecnicas.includes('ii-v') && x.qualidade !== 'dom7') expect((x.raiz + 5) % 12, `semente ${semente}`).toBe(acordes[i + 1].raiz);
			});
		}
	});

	it('com ii-V e empréstimo juntos, o dominante resolve no acorde emprestado', () => {
		const emprestado = reharmonizar(base, ['ii-v', 'emprestimo-modal'], sempre).progressao;
		// Am vira Ab7M (bVI) e o ii-V entra para chegar nele, não no Am que saiu.
		expect(cifraEmTexto(emprestado)).toContain('Bbm7 Eb7 | Ab7M');
	});

	it('sem técnica, devolve a mesma progressão', () => {
		expect(texto(base, [])).toBe(cifraEmTexto(base));
	});

	it('com qualquer combinação, cada compasso continua com 4 tempos', () => {
		for (let semente = 0; semente < 120; semente++) {
			const a = criarAleatorio(semente);
			const p = sortearProgressao(a);
			const tecnicas = TECNICAS.filter(() => a() < 0.6);
			const { progressao } = reharmonizar(p, tecnicas, a);
			const porCompasso = new Map<number, number>();
			for (const x of progressao.acordes) {
				expect(x.tempos).toBeGreaterThan(0);
				porCompasso.set(x.compasso, (porCompasso.get(x.compasso) ?? 0) + x.tempos);
			}
			expect(porCompasso.size).toBe(p.acordes.length);
			for (const total of porCompasso.values()) expect(total).toBe(4);
		}
	});
});
