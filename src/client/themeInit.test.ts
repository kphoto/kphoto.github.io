import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { SETTINGS_KEY } from './storage.ts';
import { buildThemeInitScript } from './themeInit.ts';

describe('buildThemeInitScript', () => {
  const script = buildThemeInitScript();

  it('reads the shared settings key', () => {
    expect(script).toContain(JSON.stringify(SETTINGS_KEY));
  });

  it('resolves system via prefers-color-scheme', () => {
    expect(script).toContain('prefers-color-scheme: dark');
  });

  it('knows every concrete theme and both dark themes', () => {
    for (const theme of ['light', 'dark', 'solarized-light', 'solarized-dark']) {
      expect(script).toContain(`"${theme}"`);
    }
  });

  it('is wrapped in try/catch and self-invokes', () => {
    expect(script.startsWith('(function(){')).toBe(true);
    expect(script.endsWith('})();')).toBe(true);
    expect(script).toContain('catch');
  });

  it('behaves like resolveConcreteTheme when evaluated with a stored theme', () => {
    const run = (stored: string | null, prefersDark: boolean) => {
      const dataset: Record<string, string> = {};
      const sandbox = {
        localStorage: { getItem: () => stored },
        window: { matchMedia: () => ({ matches: prefersDark }) },
        document: { documentElement: { dataset, style: { colorScheme: '' } } },
      };

      runInNewContext(script, sandbox);
      return dataset;
    };
    expect(run('{"theme":"solarized-dark"}', false).theme).toBe('solarized-dark');
    expect(run('{"theme":"system"}', true).theme).toBe('dark');
    expect(run(null, false).theme).toBe('light');
    expect(run('{broken', true).theme).toBe('light');
  });
});
