// Downloads gerados no navegador, sem passar por servidor.

export function baixar(nome: string, conteudo: Blob) {
	const url = URL.createObjectURL(conteudo);
	const a = document.createElement('a');
	a.href = url;
	a.download = nome;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function baixarSvg(nome: string, svg: string) {
	baixar(nome, new Blob([svg], { type: 'image/svg+xml' }));
}

/** Desenha o SVG num canvas do tamanho pedido e devolve o PNG. */
async function svgParaPng(svg: string, largura: number, altura: number): Promise<Blob> {
	const img = new Image();
	img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await img.decode();
	const canvas = document.createElement('canvas');
	canvas.width = largura;
	canvas.height = altura;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(img, 0, 0, largura, altura);
	const png = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
	if (!png) throw new Error('canvas sem PNG');
	return png;
}

export async function baixarPng(nome: string, svg: string, largura: number, altura: number) {
	baixar(nome, await svgParaPng(svg, largura, altura));
}

/**
 * Copia a imagem em PNG para colar em chat, documento ou e-mail.
 * O Safari só aceita se o `ClipboardItem` for criado no próprio clique, com
 * a promessa do PNG dentro, por isso o PNG não é gerado antes.
 */
export async function copiarPng(svg: string, largura: number, altura: number): Promise<boolean> {
	try {
		const item = new ClipboardItem({ 'image/png': svgParaPng(svg, largura, altura) });
		await navigator.clipboard.write([item]);
		return true;
	} catch {
		return false;
	}
}

export async function copiar(texto: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(texto);
		return true;
	} catch {
		return false;
	}
}

/** Texto da área de transferência, ou `undefined` se o navegador negar. */
export async function colar(): Promise<string | undefined> {
	try {
		return await navigator.clipboard.readText();
	} catch {
		return undefined;
	}
}
