<script lang="ts">
	import { t } from '$lib/presenter/i18n/i18n';
	import { jsonLdSite } from '$lib/presenter/seo';
	import CartaoArtigo from '$lib/presenter/ui/CartaoArtigo.svelte';
	import CartaoProjeto from '$lib/presenter/ui/CartaoProjeto.svelte';
	import Icon from '$lib/presenter/ui/Icon.svelte';
	import Inscricao from '$lib/presenter/ui/Inscricao.svelte';
	import Mascote from '$lib/presenter/ui/Mascote.svelte';
	import Seo from '$lib/presenter/ui/Seo.svelte';
	import { novaAba } from '$lib/presenter/links';
	import { AUTOR } from '$lib/presenter/site';

	let { data } = $props();

	const recente = $derived(data.artigos[0]?.artigo);
	const perfis = [
		{ href: AUTOR.perfis.github, chave: 'about.github' },
		{ href: AUTOR.perfis.linkedin, chave: 'about.linkedin' },
		{ href: AUTOR.perfis.stackoverflow, chave: 'about.stackoverflow' }
	];
</script>

<Seo descricao={t('site.description')} caminho="/" jsonLd={[jsonLdSite()]} />

<section class="hero">
	<div class="mascote"><Mascote tamanho={10} /></div>
	<div class="apresentacao">
		<h1>{t('home.title')}</h1>
		<p class="tagline">{t('home.tagline')}</p>
		<p class="intro">{t('home.intro')}</p>
		<div class="acoes">
			{#if recente}
				<a class="botao" href={`/artigos/${recente.slug}`}>
					{t('home.cta.latest')} <Icon name="seta-direita" size={12} />
				</a>
			{/if}
			<a class="secundario" href="/sobre">{t('home.cta.about')}</a>
		</div>
		<ul class="perfis" aria-label={t('home.profiles')}>
			{#each perfis as perfil (perfil.href)}
				<li>
					<a href={perfil.href} {...novaAba('me')}>
						{t(perfil.chave)} <Icon name="externo" size={12} />
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="bloco">
	<h2>{t('home.recent')}</h2>
	{#if data.artigos.length}
		<div class="lista">
			{#each data.artigos as item (item.artigo.slug)}
				<CartaoArtigo artigo={item.artigo} minutos={item.minutos} nomeSerie={item.nomeSerie} />
			{/each}
		</div>
		{#if data.temMais}
			<p class="mais">
				<a href="/artigos">{t('home.allArticles')} <Icon name="seta-direita" size={12} /></a>
			</p>
		{/if}
	{:else}
		<p class="vazio">{t('home.empty')}</p>
	{/if}
</section>

{#if data.projetos.length}
	<section class="bloco">
		<h2>{t('home.projects')}</h2>
		<div class="grade">
			{#each data.projetos as projeto (projeto.slug)}
				<CartaoProjeto {projeto} />
			{/each}
		</div>
		<p class="mais">
			<a href="/projetos">{t('home.allProjects')} <Icon name="seta-direita" size={12} /></a>
		</p>
	</section>
{/if}

<Inscricao />

<style>
	.hero {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6) var(--space-7);
		align-items: center;
		padding: var(--space-4) 0 var(--space-8);
	}

	.apresentacao {
		flex: 1 1 var(--column-min);
		max-width: var(--measure);
	}

	h1 {
		margin: 0 0 var(--space-3);
	}

	.tagline {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-3);
	}

	.intro {
		color: var(--color-muted);
		margin: 0 0 var(--space-5);
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: center;
	}

	.botao {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		color: var(--color-accent-text);
		background: var(--color-accent);
		border: var(--frame-width) solid var(--color-border);
		box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--color-shadow);
		text-decoration: none;
		transition: transform var(--duration) steps(2), box-shadow var(--duration) steps(2);
	}

	.botao:hover {
		transform: translate(-2px, -2px);
		box-shadow: calc(var(--shadow-offset) + 2px) calc(var(--shadow-offset) + 2px) 0
			var(--color-shadow);
	}

	.secundario {
		font-size: var(--text-sm);
	}

	.perfis {
		list-style: none;
		padding: 0;
		margin: var(--space-5) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		font-size: var(--text-sm);
	}

	.perfis a {
		color: var(--color-muted);
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.perfis a:hover {
		color: var(--color-link);
	}

	.bloco + .bloco {
		margin-top: var(--space-8);
	}

	.lista {
		display: grid;
		gap: var(--space-5);
		max-width: var(--content-width);
	}

	.grade {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
	}

	.mais a {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}

	.vazio {
		color: var(--color-muted);
	}
</style>
