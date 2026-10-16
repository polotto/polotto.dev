<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { BUTTONDOWN_USUARIO } from '$lib/presenter/site';
	import Icon from './Icon.svelte';

	// Formulário HTML puro: o Buttondown recebe o e-mail e manda a confirmação.
	// Abre em nova aba para o leitor não sair do artigo.
	const acao = `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USUARIO}`;
</script>

{#if BUTTONDOWN_USUARIO}
	<section class="inscricao" aria-labelledby="inscricao-titulo">
		<h2 id="inscricao-titulo">{t('subscribe.title')}</h2>
		<p class="texto">{t('subscribe.text')}</p>
		<form action={acao} method="post" target="_blank">
			<label for="inscricao-email" class="oculto">{t('subscribe.label')}</label>
			<input
				id="inscricao-email"
				type="email"
				name="email"
				required
				autocomplete="email"
				placeholder={t('subscribe.placeholder')}
			/>
			<input type="hidden" name="embed" value="1" />
			<button type="submit">{t('subscribe.button')}</button>
		</form>
		<p class="rss">
			<a href="/rss.xml"><Icon name="rss" size={12} /> {t('subscribe.rss')}</a>
		</p>
	</section>
{/if}

<style>
	.inscricao {
		max-width: var(--measure);
		margin-top: var(--space-8);
		padding: var(--space-5);
		background: var(--color-surface);
		border: var(--frame-width) solid var(--color-border);
	}

	h2 {
		font-size: var(--text-md);
		margin: 0 0 var(--space-2);
	}

	.texto {
		margin: 0 0 var(--space-4);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	form {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	input[type='email'] {
		flex: 1 1 var(--input-min);
		min-width: 0;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		color: var(--color-text);
		background: var(--color-bg);
		border: var(--frame-width) solid var(--color-border);
	}

	input[type='email']:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	button {
		padding: var(--space-2) var(--space-4);
		font: inherit;
		font-family: var(--font-mono);
		color: var(--color-accent-text);
		background: var(--color-accent);
		border: var(--frame-width) solid var(--color-border);
		cursor: pointer;
	}

	button:hover {
		filter: brightness(1.1);
	}

	.rss {
		margin: var(--space-3) 0 0;
		font-size: var(--text-xs);
	}

	.rss a {
		color: var(--color-muted);
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.oculto {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
