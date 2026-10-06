import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../lib/config.ts';
import type { MessageValue } from '../format.ts';
import { missingKeys } from '../translator.ts';
import { en } from './en.ts';
import { catalogs } from './index.ts';

const placeholders = (value: MessageValue): string[] => {
  const templates = typeof value === 'string' ? [value] : Object.values(value);
  return [
    ...new Set(templates.flatMap((text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))),
  ]
    .filter((name): name is string => name !== undefined)
    .sort();
};

describe('message catalogs', () => {
  it('has a catalog for every configured locale', () => {
    for (const locale of siteConfig.locales) {
      expect(catalogs[locale.code]).toBeDefined();
    }
  });

  it('only uses keys the default catalog defines', () => {
    for (const catalog of Object.values(catalogs)) {
      for (const key of Object.keys(catalog)) {
        expect(Object.hasOwn(en, key)).toBe(true);
      }
    }
  });

  it('keeps every translation to the same placeholders as English', () => {
    for (const catalog of Object.values(catalogs)) {
      for (const [key, value] of Object.entries(catalog)) {
        expect([key, placeholders(value)]).toEqual([key, placeholders(en[key as keyof typeof en])]);
      }
    }
  });

  it('ships the Spanish catalog complete', () => {
    expect(missingKeys(catalogs, 'en', 'es')).toEqual([]);
  });
});
