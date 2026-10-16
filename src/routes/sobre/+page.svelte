<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdMigalhas } from '$lib/presenter/seo';
	import { novaAba } from '$lib/presenter/links';
	import { AUTOR, urlAbsoluta } from '$lib/presenter/site';
	import CartaoStackOverflow from '$lib/presenter/ui/CartaoStackOverflow.svelte';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Mascote from '$lib/presenter/ui/Mascote.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	let { data } = $props();

	// Com o cartão (reputação e medalhas), o Stack Overflow sai da lista de links.
	const perfis = $derived([
		{ href: AUTOR.perfis.linkedin, chave: 'about.linkedin' },
		{ href: AUTOR.perfis.github, chave: 'about.github' },
		...(data.stackoverflow ? [] : [{ href: AUTOR.perfis.stackoverflow, chave: 'about.stackoverflow' }])
	]);
</script>

<Seo
	titulo={t('about.title')}
	descricao={t('about.description')}
	caminho="/sobre"
	jsonLd={[
		{
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			mainEntity: {
				'@type': 'Person',
				name: AUTOR.nome,
				url: urlAbsoluta('/sobre'),
				sameAs: Object.values(AUTOR.perfis)
			}
		},
		jsonLdMigalhas([
			{ nome: t('nav.home'), caminho: '/' },
			{ nome: t('about.title'), caminho: '/sobre' }
		])
	]}
/>

<div class="sobre">
	<Mascote tamanho={10} />
	<div>
		<h1>{t('about.title')}</h1>
		<p class="bio">{t('about.bio')}</p>
		<h2>{t('about.links')}</h2>
		<ul>
			{#each perfis as perfil (perfil.href)}
				<li>
					<a href={perfil.href} {...novaAba('me')}>
						{t(perfil.chave)} <Icon name="externo" size={12} />
					</a>
				</li>
			{/each}
		</ul>
		{#if data.stackoverflow}
			<div class="stackoverflow">
				<CartaoStackOverflow perfil={data.stackoverflow} href={AUTOR.perfis.stackoverflow} />
			</div>
		{/if}
	</div>
</div>

<style>
	.sobre {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-7);
		align-items: flex-start;
	}

	.sobre > div {
		flex: 1 1 var(--column-min);
		max-width: var(--measure);
	}

	.bio {
		font-size: var(--text-lg);
	}

	h2 {
		margin-top: var(--space-7);
	}

	ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}

	.stackoverflow {
		margin-top: var(--space-5);
		max-width: var(--card-min-wide);
	}

	ul a {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}
</style>
