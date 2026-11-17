import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { FONT_FILES } from './font.ts';
import { SETTINGS_KEY } from './storage.ts';
import { buildThemeInitScript } from './themeInit.ts';

interface Run {
  readonly dataset: Record<string, string>;
  readonly colorScheme: string;
  readonly links: Record<string, string>[];
}

function run(
  stored: string | null,
  prefersDark: boolean,
  overrides: { getItem?: () => string | null; appendChild?: () => void } = {},
): Run {
  const dataset: Record<string, string> = {};
  const style = { colorScheme: '' };
  const links: Record<string, string>[] = [];
  const sandbox = {
    localStorage: { getItem: overrides.getItem ?? (() => stored) },
    window: { matchMedia: () => ({ matches: prefersDark }) },
    document: {
      documentElement: { dataset, style },
      createElement: () => ({}),
      head: {
        appendChild:
          overrides.appendChild ??
          ((link: Record<string, string>) => {
            links.push(link);
          }),
      },
    },
  };
  runInNewContext(buildThemeInitScript(), sandbox);
  return { dataset, colorScheme: style.colorScheme, links };
}

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

  it('knows every font and the file to preload', () => {
    for (const font of ['standard', 'handwriting']) {
      expect(script).toContain(`"${font}"`);
    }
    expect(script).toContain(JSON.stringify(FONT_FILES.handwriting));
  });

  it('honours a custom settings key', () => {
    expect(buildThemeInitScript('elsewhere')).toContain('"elsewhere"');
  });

  it('is wrapped in try/catch and self-invokes', () => {
    expect(script.startsWith('(function(){')).toBe(true);
    expect(script.endsWith('})();')).toBe(true);
    expect(script).toContain('catch');
  });

  it('behaves like resolveConcreteTheme when evaluated with a stored theme', () => {
    expect(run('{"theme":"solarized-dark"}', false).dataset.theme).toBe('solarized-dark');
    expect(run('{"theme":"system"}', true).dataset.theme).toBe('dark');
    expect(run('{"theme":"neon"}', false).dataset.theme).toBe('light');
    expect(run(null, true).dataset.theme).toBe('dark');
    expect(run(null, false).dataset.theme).toBe('light');
    expect(run('{broken', true).dataset.theme).toBe('light');
  });

  it('sets the matching color scheme', () => {
    expect(run('{"theme":"solarized-dark"}', false).colorScheme).toBe('dark');
    expect(run('{"theme":"solarized-light"}', true).colorScheme).toBe('light');
  });

  it('falls back to light and the standard font when storage throws', () => {
    const result = run(null, true, {
      getItem: () => {
        throw new Error('denied');
      },
    });
    expect(result.dataset).toEqual({ theme: 'light', font: 'standard' });
    expect(result.colorScheme).toBe('light');
    expect(result.links).toEqual([]);
  });

  it('applies the stored font next to the stored theme', () => {
    const result = run('{"theme":"dark","font":"handwriting"}', false);
    expect(result.dataset).toEqual({ theme: 'dark', font: 'handwriting' });
  });

  it('uses the standard font when none or an unknown one is stored', () => {
    for (const stored of [null, '{"theme":"dark"}', '{"font":"comic"}', '{"font":7}', '[]', '7']) {
      expect(run(stored, false).dataset.font).toBe('standard');
    }
  });

  it('keeps the stored font even when the theme is unknown', () => {
    expect(run('{"theme":"neon","font":"handwriting"}', true).dataset).toEqual({
      theme: 'dark',
      font: 'handwriting',
    });
  });

  it('preloads the handwriting file before the stylesheet asks for it', () => {
    expect(run('{"font":"handwriting"}', false).links).toEqual([
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        href: FONT_FILES.handwriting,
      },
    ]);
  });

  it('preloads nothing for the standard font', () => {
    expect(run('{"font":"standard"}', false).links).toEqual([]);
  });

  it('still applies the font when the preload cannot be added', () => {
    const result = run('{"font":"handwriting"}', false, {
      appendChild: () => {
        throw new Error('no head');
      },
    });
    expect(result.dataset.font).toBe('handwriting');
  });
});
