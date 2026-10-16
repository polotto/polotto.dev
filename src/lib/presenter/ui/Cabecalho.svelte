<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import Icon from './Icon.svelte';
	import Mascote from './Mascote.svelte';

	let { atual = '' }: { atual?: string } = $props();

	const itens = [
		{ href: '/artigos', chave: 'nav.articles' },
		{ href: '/projetos', chave: 'nav.projects' },
		{ href: '/ferramentas', chave: 'nav.tools' },
		{ href: '/sobre', chave: 'nav.about' }
	];
</script>

<a class="skip-link" href="#conteudo">{t('nav.skip')}</a>
<header class="cabecalho">
	<div class="wrap">
		<a class="marca" href="/">
			<Mascote tamanho={2} />
			<span>{t('site.name')}</span>
		</a>
		<nav aria-label={t('nav.label')}>
			<ul>
				{#each itens as item (item.href)}
					<li>
						<a href={item.href} aria-current={atual === item.href || atual.startsWith(`${item.href}/`) ? 'page' : undefined}>
							<span class="cursor"><Icon name="seta-direita" size={12} /></span>
							{t(item.chave)}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	.cabecalho {
		border-bottom: var(--frame-width) solid var(--color-border);
		background: var(--color-surface);
	}

	.wrap {
		max-width: var(--page-width);
		margin: 0 auto;
		padding: var(--space-4);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-5);
		align-items: center;
		justify-content: space-between;
	}

	.marca {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
		font-family: var(--font-display);
		font-size: var(--text-md);
		color: var(--color-text);
		text-decoration: none;
		letter-spacing: var(--display-tracking);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	nav a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		text-transform: var(--display-transform);
		color: var(--color-text);
		text-decoration: none;
		padding: var(--space-1) 0;
	}

	.cursor {
		visibility: hidden;
		color: var(--color-accent);
	}

	nav a:hover .cursor,
	nav a:focus-visible .cursor,
	nav a[aria-current='page'] .cursor {
		visibility: visible;
	}
</style>
