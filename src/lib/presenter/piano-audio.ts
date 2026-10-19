// Piano sintetizado com Web Audio: sem amostra, sem arquivo, sem rede.
// Cada nota soma três parciais com um filtro que abre mais nas notas agudas.

const FRACAO_PARCIAIS = [
	{ tipo: 'triangle', multiplo: 1, ganho: 1 },
	{ tipo: 'sine', multiplo: 2, ganho: 0.35 },
	{ tipo: 'sine', multiplo: 3, ganho: 0.12 }
] as const;

export const frequencia = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export class PianoSintetico {
	private contexto?: AudioContext;
	private saida?: GainNode;

	/** Cria o contexto no primeiro uso (navegador só deixa depois de um gesto). */
	private preparar(): { ctx: AudioContext; saida: GainNode } {
		if (!this.contexto || !this.saida) {
			this.contexto = new AudioContext();
			this.saida = this.contexto.createGain();
			this.saida.gain.value = 0.5;
			this.saida.connect(this.contexto.destination);
		}
		if (this.contexto.state === 'suspended') void this.contexto.resume();
		return { ctx: this.contexto, saida: this.saida };
	}

	/** Relógio do áudio, em segundos. */
	agora(): number {
		return this.preparar().ctx.currentTime;
	}

	/** Toca `midi` a partir de `quando` (segundos do relógio do áudio) por `duracao` segundos. */
	nota(midi: number, quando: number, duracao: number, volume = 0.5) {
		const { ctx, saida } = this.preparar();
		const f = frequencia(midi);
		const fim = quando + Math.max(duracao, 0.08);
		const filtro = ctx.createBiquadFilter();
		filtro.type = 'lowpass';
		filtro.frequency.value = Math.min(2200 + f * 3, 9000);
		const envelope = ctx.createGain();
		// Ataque curto, queda para um nível de sustentação e solta no fim da nota.
		envelope.gain.setValueAtTime(0.0001, quando);
		envelope.gain.linearRampToValueAtTime(volume, quando + 0.008);
		envelope.gain.setTargetAtTime(volume * 0.25, quando + 0.008, 0.5);
		envelope.gain.setTargetAtTime(0, fim, 0.06);
		filtro.connect(envelope).connect(saida);
		for (const p of FRACAO_PARCIAIS) {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = p.tipo;
			osc.frequency.value = f * p.multiplo;
			g.gain.value = p.ganho / FRACAO_PARCIAIS.length;
			osc.connect(g).connect(filtro);
			osc.start(quando);
			osc.stop(fim + 0.6);
		}
	}

	/** Corta o que está tocando e o que foi agendado. */
	parar() {
		if (!this.contexto || !this.saida) return;
		const antiga = this.saida;
		antiga.gain.cancelScheduledValues(this.contexto.currentTime);
		antiga.gain.setTargetAtTime(0, this.contexto.currentTime, 0.02);
		const nova = this.contexto.createGain();
		nova.gain.value = 0.5;
		nova.connect(this.contexto.destination);
		this.saida = nova;
		setTimeout(() => antiga.disconnect(), 300);
	}
}
