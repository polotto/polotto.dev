// Gerador pseudoaleatório com semente (mulberry32): mesma semente, mesma sequência.

export type Aleatorio = () => number;

export function criarAleatorio(semente: number): Aleatorio {
	let s = semente >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
