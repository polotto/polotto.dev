import { describe, expect, it } from 'vitest';
import {
	cifra,
	cifraEmTexto,
	criarAleatorio,
	MOLDES,
	nomeMidi,
	nomeTonalidade,
	notasDoAcorde,
	novoAcorde,
	sortearProgressao,
	usaBemol
} from './acordes';

const C = { tonica: 0, modo: 'maior' } as const;

describe('acordes', () => {
	it('escreve a cifra brasileira', () => {
		expect(cifra(novoAcorde(0, 'maj7', 0), C)).toBe('C7M');
		expect(cifra(novoAcorde(2, 'm7b5', 0), C)).toBe('Dm7(b5)');
		expect(cifra(novoAcorde(7, 'dom7alt', 0), C)).toBe('G7(#9,b13)');
		expect(cifra({ ...novoAcorde(0, 'maior', 0), baixo: 4 }, C)).toBe('C/E');
		expect(cifra({ ...novoAcorde(0, 'maior', 0), baixo: 0 }, C)).toBe('C');
	});

	it('escolhe sustenido ou bemol pela tonalidade', () => {
		expect(usaBemol({ tonica: 5, modo: 'maior' })).toBe(true); // F
		expect(usaBemol({ tonica: 7, modo: 'maior' })).toBe(false); // G
		expect(usaBemol({ tonica: 2, modo: 'menor' })).toBe(true); // Dm (relativa F)
		expect(usaBemol({ tonica: 9, modo: 'menor' })).toBe(false); // Am
		expect(nomeTonalidade({ tonica: 10, modo: 'menor' })).toBe('Bbm'); // relativa Db
		expect(cifra(novoAcorde(10, 'dom7', 0), { tonica: 5, modo: 'maior' })).toBe('Bb7');
		// bII, bIII, bVI e bVII em bemol mesmo em tonalidade de sustenido; diminuto em sustenido.
		expect(cifra(novoAcorde(1, 'dom7', 0), C)).toBe('Db7');
		expect(cifra(novoAcorde(10, 'dom7', 0), C)).toBe('Bb7');
		expect(cifra(novoAcorde(1, 'dim7', 0), C)).toBe('C#dim');
		expect(cifra(novoAcorde(6, 'min7', 0), C)).toBe('F#m7');
	});

	it('nomeia nota MIDI com oitava', () => {
		expect(nomeMidi(60, false)).toBe('C4');
		expect(nomeMidi(69, false)).toBe('A4');
		expect(nomeMidi(61, true)).toBe('Db4');
	});

	it('lista as notas do acorde em classes de altura', () => {
		expect(notasDoAcorde(novoAcorde(7, 'dom13', 0))).toEqual([7, 11, 2, 5, 9, 4]);
		expect(notasDoAcorde(novoAcorde(0, 'maior', 0))).toEqual([0, 4, 7]);
	});

	it('mesma semente, mesma sequência', () => {
		const a = criarAleatorio(42);
		const b = criarAleatorio(42);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
		expect(criarAleatorio(43)()).not.toBe(criarAleatorio(42)());
	});

	it('sorteia progressão na tonalidade pedida', () => {
		const p = sortearProgressao(criarAleatorio(1), { tonica: 0, modo: 'maior', compassos: 4 });
		expect(p.tonalidade).toEqual({ tonica: 0, modo: 'maior' });
		expect(p.acordes).toHaveLength(4);
		expect(p.acordes.map((a) => a.compasso)).toEqual([0, 1, 2, 3]);
		expect(p.acordes.every((a) => a.tempos === 4)).toBe(true);
	});

	it('sorteia o que não foi fixado e sempre devolve uma progressão', () => {
		const a = criarAleatorio(7);
		const modos = new Set<string>();
		for (let i = 0; i < 60; i++) {
			const p = sortearProgressao(a);
			modos.add(p.tonalidade.modo);
			expect([4, 8]).toContain(p.acordes.length);
		}
		expect(modos.size).toBe(2);
	});

	it('o molde começa na tônica ou no grau esperado e o texto sai em compassos', () => {
		const p = sortearProgressao(criarAleatorio(3), { tonica: 0, modo: 'maior', compassos: 4 });
		expect(cifraEmTexto(p)).toMatch(/^\| .+ \| .+ \| .+ \| .+ \|$/);
		const ii = sortearProgressao(() => 0, { tonica: 0, modo: 'maior', compassos: 4 });
		expect(cifraEmTexto(ii)).toBe('| C | Am | Dm | G7 |');
	});

	it('todo molde tem 4 ou 8 compassos e há os dois modos', () => {
		for (const m of MOLDES) expect([4, 8]).toContain(m.graus.length);
		expect(new Set(MOLDES.map((m) => m.modo)).size).toBe(2);
	});
});
