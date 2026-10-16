<script lang="ts">
	import { copiar } from '$lib/presenter/baixar';
	import { t } from '$lib/presenter/i18n/i18n';

	let {
		texto,
		rotulo = t('tools.copy'),
		disabled = false
	}: { texto: string; rotulo?: string; disabled?: boolean } = $props();

	let copiado = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function aoClicar() {
		if (!(await copiar(texto))) return;
		copiado = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copiado = false), 1500);
	}
</script>

<button type="button" class="secundario" onclick={aoClicar} {disabled} aria-live="polite">
	{copiado ? t('tools.copied') : rotulo}
</button>
