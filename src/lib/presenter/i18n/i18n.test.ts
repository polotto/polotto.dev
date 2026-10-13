import { describe, expect, it } from 'vitest';
import { formatDate, t } from './i18n';

describe('i18n', () => {
	it('troca variáveis', () => {
		expect(t('article.partOf', { order: 1, series: 'Migrando o legado' })).toBe(
			'Parte 1 da série Migrando o legado'
		);
	});

	it('escolhe o plural pelo número', () => {
		expect(t('article.readingTime', { count: 1 })).toBe('1 minuto de leitura');
		expect(t('article.readingTime', { count: 12 })).toBe('12 minutos de leitura');
	});

	it('falha alto em chave ausente', () => {
		expect(() => t('nao.existe')).toThrow();
	});

	it('formata data em pt-BR', () => {
		expect(formatDate('2026-10-12')).toBe('12 de outubro de 2026');
	});
});
