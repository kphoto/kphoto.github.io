import { describe, expect, it } from 'vitest';
import { chooseSuggestion, matchBrowserLanguage } from './locale.ts';

describe('matchBrowserLanguage', () => {
  it('matches exactly, then by primary language, in browser order', () => {
    expect(matchBrowserLanguage(['en', 'es'], ['es-MX', 'en'])).toBe('es');
    expect(matchBrowserLanguage(['en', 'pt-br'], ['pt-BR'])).toBe('pt-br');
    expect(matchBrowserLanguage(['en', 'pt-br'], ['pt-PT'])).toBe('pt-br');
    expect(matchBrowserLanguage(['en', 'es'], ['fr', 'de'])).toBeUndefined();
  });
});

describe('chooseSuggestion', () => {
  const base = { pageLocale: 'en', available: ['es'], preferred: undefined, browserLanguages: [] };

  it('suggests the stored choice when this page exists in it', () => {
    expect(chooseSuggestion({ ...base, preferred: 'es' })).toBe('es');
    expect(chooseSuggestion({ ...base, preferred: 'es', available: [] })).toBeUndefined();
  });

  it('stays quiet when the reader already has their language', () => {
    expect(chooseSuggestion({ ...base, preferred: 'en' })).toBeUndefined();
    expect(chooseSuggestion({ ...base, browserLanguages: ['en-US', 'es'] })).toBeUndefined();
  });

  it('falls back to the browser languages without a stored choice', () => {
    expect(chooseSuggestion({ ...base, browserLanguages: ['es-ES'] })).toBe('es');
    expect(chooseSuggestion({ ...base, browserLanguages: ['fr'] })).toBeUndefined();
  });

  it('ignores a corrupt stored choice', () => {
    expect(chooseSuggestion({ ...base, preferred: 'ES!', browserLanguages: ['es'] })).toBe('es');
  });
});
