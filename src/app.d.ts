// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {}

	interface Window {
		goatcounter?: { count: (opcoes: { path: string }) => void };
	}
}

export {};
