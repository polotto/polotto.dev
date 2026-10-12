#!/usr/bin/env node
// Falha se `content/` veio do vault de exemplo (`npm run sync:exemplo`).
// Roda no CI antes do deploy, para nunca publicar artigo de mentira.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARQUIVO_ORIGEM } from './sync.mjs';

export function checarConteudo(pastaConteudo) {
	const arquivo = join(pastaConteudo, ARQUIVO_ORIGEM);
	if (!existsSync(arquivo)) return 'content/ sem marca de origem: rode `npm run sync`';
	const origem = readFileSync(arquivo, 'utf8').trim();
	if (origem !== 'vault') return `content/ veio do vault de ${origem}: rode \`npm run sync\` antes de commitar`;
	return undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const erro = checarConteudo(resolve(dirname(fileURLToPath(import.meta.url)), '..', 'content'));
	if (erro) {
		console.error(erro);
		process.exit(1);
	}
	console.log('content/ ok: veio do vault real');
}
