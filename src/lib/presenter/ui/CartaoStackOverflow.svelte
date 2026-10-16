<script lang="ts">
	import type { PerfilStackOverflow } from '$lib/domain/models';
	import { t } from '$lib/presenter/i18n/i18n';
	import { novaAba } from '$lib/presenter/links';
	import Icon from './Icon.svelte';

	let { perfil, href }: { perfil: PerfilStackOverflow; href: string } = $props();

	const medalhas = $derived([
		{ classe: 'ouro', chave: 'about.so.gold', count: perfil.medalhas.ouro },
		{ classe: 'prata', chave: 'about.so.silver', count: perfil.medalhas.prata },
		{ classe: 'bronze', chave: 'about.so.bronze', count: perfil.medalhas.bronze }
	]);
</script>

<a class="cartao" {href} {...novaAba('me')}>
	<span class="nome">{t('about.stackoverflow')} <Icon name="externo" size={12} /></span>
	<span class="reputacao">
		<strong>{new Intl.NumberFormat('pt-BR').format(perfil.reputacao)}</strong>
		{t('about.so.reputation')}
	</span>
	<span class="medalhas">
		{#each medalhas as m (m.classe)}
			<span class="medalha" title={t(m.chave, { count: m.count })}>
				<span class={`led ${m.classe}`} aria-hidden="true"></span>
				<span class="oculto">{t(m.chave, { count: m.count })}</span>
				<span aria-hidden="true">{m.count}</span>
			</span>
		{/each}
	</span>
</a>

<style>
	.cartao {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-2);
		border: var(--frame-width) solid var(--color-border);
		color: var(--color-text);
		text-decoration: none;
	}

	.cartao:hover {
		border-color: var(--color-accent);
	}

	.nome {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		text-transform: uppercase;
		color: var(--color-muted);
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.reputacao {
		color: var(--color-muted);
	}

	.reputacao strong {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		color: var(--color-text);
	}

	.medalhas {
		display: flex;
		gap: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	.medalha {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.led {
		width: var(--space-2);
		height: var(--space-2);
	}

	.ouro {
		background: var(--medalha-ouro);
	}
	.prata {
		background: var(--medalha-prata);
	}
	.bronze {
		background: var(--medalha-bronze);
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
