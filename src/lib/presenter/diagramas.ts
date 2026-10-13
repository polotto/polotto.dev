// Desenha os blocos mermaid do corpo do artigo, só no navegador. O Mermaid
// carrega sob demanda: página sem diagrama não baixa nada. As cores saem dos
// tokens do tema, então o diagrama é redesenhado quando o modo muda.

const SELETOR = 'pre.mermaid';

function token(estilo: CSSStyleDeclaration, nome: string): string {
	return estilo.getPropertyValue(nome).trim();
}

function variaveisDoTema(claro: boolean) {
	const estilo = getComputedStyle(document.documentElement);
	return {
		darkMode: !claro,
		background: token(estilo, '--color-surface'),
		fontFamily: token(estilo, '--font-body'),
		fontSize: '15px',
		primaryColor: token(estilo, '--color-surface-2'),
		primaryTextColor: token(estilo, '--color-text'),
		primaryBorderColor: token(estilo, '--color-border'),
		secondaryColor: token(estilo, '--color-surface'),
		tertiaryColor: token(estilo, '--color-bg'),
		lineColor: token(estilo, '--color-accent'),
		textColor: token(estilo, '--color-text'),
		edgeLabelBackground: token(estilo, '--color-surface')
	};
}

export function desenharDiagramas(raiz: HTMLElement): () => void {
	const blocos = Array.from(raiz.querySelectorAll<HTMLElement>(SELETOR));
	if (blocos.length === 0) return () => {};

	const fontes = blocos.map((bloco) => bloco.textContent ?? '');
	let ativo = true;

	async function desenhar() {
		const { default: mermaid } = await import('mermaid');
		if (!ativo) return;
		blocos.forEach((bloco, i) => {
			bloco.removeAttribute('data-processed');
			bloco.textContent = fontes[i];
		});
		mermaid.initialize({
			startOnLoad: false,
			securityLevel: 'strict',
			theme: 'base',
			themeVariables: variaveisDoTema(modo.matches)
		});
		await mermaid.run({ nodes: blocos, suppressErrors: true });
	}

	const modo = matchMedia('(prefers-color-scheme: light)');
	const aoMudarModo = () => void desenhar();
	modo.addEventListener('change', aoMudarModo);
	void desenhar();

	return () => {
		ativo = false;
		modo.removeEventListener('change', aoMudarModo);
	};
}
