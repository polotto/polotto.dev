<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdMigalhas } from '$lib/presenter/seo';
	import { AUTOR, urlAbsoluta } from '$lib/presenter/site';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Mascote from '$lib/presenter/ui/Mascote.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';

	const perfis = [
		{ href: AUTOR.perfis.linkedin, chave: 'about.linkedin' },
		{ href: AUTOR.perfis.github, chave: 'about.github' },
		{ href: AUTOR.perfis.stackoverflow, chave: 'about.stackoverflow' }
	];
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
					<a href={perfil.href} rel="me noopener">
						{t(perfil.chave)} <Icon name="externo" size={12} />
					</a>
				</li>
			{/each}
		</ul>
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
		flex: 1 1 320px;
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

	a {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}
</style>
