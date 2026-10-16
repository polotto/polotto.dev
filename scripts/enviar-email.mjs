#!/usr/bin/env node
// Manda por e-mail, pelo Buttondown, os artigos com `publicado` igual a hoje.
// Roda no `deploy.yml` depois do deploy. Decisão no `BRIEF.md`.
//
// O RSS para e-mail do Buttondown é pago; criar e-mail pela API não é.
// O slug do e-mail é o slug do artigo: se já existe, o artigo já foi enviado.
//
// Uso: BUTTONDOWN_API_KEY=... node scripts/enviar-email.mjs [--simular]

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerNota } from './sync.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOGO = JSON.parse(readFileSync(join(RAIZ, 'src/lib/presenter/i18n/pt-BR.json'), 'utf8'));
const SITE = 'https://polotto.dev';
const API = 'https://api.buttondown.com/v1/emails';
const VERSAO_API = '2026-04-01';

/** Texto do catálogo de i18n, com `{nome}` trocado pelas variáveis. */
function t(chave, vars = {}) {
	const texto = CATALOGO[chave];
	if (texto === undefined) throw new Error(`i18n: chave ausente "${chave}"`);
	return texto.replace(/\{(\w+)\}/g, (_, nome) => String(vars[nome] ?? `{${nome}}`));
}

/** Data de hoje no fuso do blog, `AAAA-MM-DD`. Mesma regra do build. */
export function hojeEmSaoPaulo(agora = new Date()) {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
}

function lerPasta(pasta) {
	if (!existsSync(pasta)) return [];
	return readdirSync(pasta)
		.filter((f) => f.endsWith('.md'))
		.sort()
		.map((f) => lerNota(readFileSync(join(pasta, f), 'utf8')).dados);
}

/** Um e-mail por artigo publicado hoje, já no formato da API. */
export function emailsDoDia(content, hoje) {
	const series = new Map(lerPasta(join(content, 'series')).map((s) => [s.slug, s.titulo]));
	return lerPasta(join(content, 'artigos'))
		.filter((a) => String(a.publicado) === hoje)
		.map((a) => {
			const url = `${SITE}/artigos/${a.slug}`;
			const serie = a.serie && series.get(a.serie);
			const linhas = [
				serie ? `*${t('article.partOf', { order: a.ordem, series: serie })}*` : '',
				a.descricao,
				`[${t('email.read')}](${url})`
			].filter(Boolean);
			return {
				subject: a.titulo,
				slug: a.slug,
				description: a.descricao,
				canonical_url: url,
				body: `<!-- buttondown-editor-mode: plaintext -->${linhas.join('\n\n')}`,
				status: 'about_to_send'
			};
		});
}

async function chamar(caminho, chave, opcoes = {}) {
	const resposta = await fetch(`${API}${caminho}`, {
		...opcoes,
		headers: {
			Authorization: `Token ${chave}`,
			'X-API-Version': VERSAO_API,
			'Content-Type': 'application/json'
		}
	});
	return { status: resposta.status, corpo: await resposta.text() };
}

/** Slugs dos e-mails que já existem no Buttondown, em qualquer status. */
async function slugsExistentes(chave) {
	const slugs = new Set();
	let caminho = '?page_size=100';
	while (caminho) {
		const { status, corpo } = await chamar(caminho, chave);
		if (status !== 200) throw new Error(`listar e-mails: HTTP ${status} ${corpo}`);
		const pagina = JSON.parse(corpo);
		for (const e of pagina.results ?? []) slugs.add(e.slug);
		caminho = pagina.next ? new URL(pagina.next).search : '';
	}
	return slugs;
}

async function main() {
	const simular = process.argv.includes('--simular');
	const hoje = hojeEmSaoPaulo();
	const emails = emailsDoDia(join(RAIZ, 'content'), hoje);
	if (simular) return console.log(JSON.stringify(emails, null, 2));

	// Sem chave, falha: o artigo do dia não seria reenviado depois, então o
	// deploy não pode ficar verde sem mandar o e-mail.
	const chave = process.env.BUTTONDOWN_API_KEY;
	if (!chave) throw new Error('e-mail: sem BUTTONDOWN_API_KEY, nada enviado');

	// Lista mesmo sem artigo do dia: todo deploy confirma que a chave funciona.
	const existentes = await slugsExistentes(chave);
	if (!emails.length) return console.log(`e-mail: chave ok, nenhum artigo de ${hoje}`);
	for (const email of emails) {
		if (existentes.has(email.slug)) {
			console.log(`e-mail: "${email.subject}" já foi enviado`);
			continue;
		}
		const { status, corpo } = await chamar('', chave, { method: 'POST', body: JSON.stringify(email) });
		if (status === 409) console.log(`e-mail: "${email.subject}" já existe no Buttondown`);
		else if (status !== 201) throw new Error(`enviar "${email.subject}": HTTP ${status} ${corpo}`);
		else console.log(`e-mail: "${email.subject}" enviado`);
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((erro) => {
		console.error(erro.message);
		process.exit(1);
	});
}
