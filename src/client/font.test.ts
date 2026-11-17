import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FontController, FONT_FILES, type FontHost } from './font.ts';
import {
  FONTS,
  SETTINGS_KEY,
  SettingsStore,
  type FontName,
  type KeyValueStore,
} from './storage.ts';

const fromRoot = (path: string): string => fileURLToPath(new URL(`../../${path}`, import.meta.url));

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    data,
    get: (key) => data.get(key) ?? null,
    set: (key, value) => {
      data.set(key, value);
    },
  };
}

function recordingHost(): FontHost & { applied: FontName[] } {
  const applied: FontName[] = [];
  return {
    applied,
    applyFont: (font) => {
      applied.push(font);
    },
  };
}

function build(initial: Record<string, string> = {}) {
  const backing = memoryStore(initial);
  const host = recordingHost();
  const controller = new FontController({ settings: new SettingsStore(backing), host });
  return { backing, host, controller };
}

describe('FontController', () => {
  it('applies the standard font when nothing is stored', () => {
    const { controller, host } = build();
    controller.start();
    expect(controller.font).toBe('standard');
    expect(host.applied).toEqual(['standard']);
  });

  it('applies a stored choice on start', () => {
    const { controller, host } = build({ [SETTINGS_KEY]: '{"theme":"dark","font":"handwriting"}' });
    controller.start();
    expect(host.applied).toEqual(['handwriting']);
  });

  it('ignores an unknown stored font', () => {
    const { controller, host } = build({ [SETTINGS_KEY]: '{"font":"comic-sans"}' });
    controller.start();
    expect(host.applied).toEqual(['standard']);
  });

  it('persists and applies a new choice next to the other settings', () => {
    const { controller, host, backing } = build({ [SETTINGS_KEY]: '{"theme":"dark"}' });
    controller.start();
    controller.setFont('handwriting');
    expect(controller.font).toBe('handwriting');
    expect(host.applied).toEqual(['standard', 'handwriting']);
    expect(backing.data.get(SETTINGS_KEY)).toBe('{"theme":"dark","font":"handwriting"}');
  });

  it('switches back to the standard font', () => {
    const { controller, host } = build({ [SETTINGS_KEY]: '{"font":"handwriting"}' });
    controller.setFont('standard');
    expect(controller.font).toBe('standard');
    expect(host.applied).toEqual(['standard']);
  });

  it('still applies a choice the browser refuses to store', () => {
    const host = recordingHost();
    const controller = new FontController({
      settings: new SettingsStore({
        get: () => null,
        set: () => {
          throw new Error('quota');
        },
      }),
      host,
    });
    controller.setFont('handwriting');
    expect(host.applied).toEqual(['handwriting']);
  });
});

describe('font files', () => {
  const css = readFileSync(fromRoot('src/styles/global.css'), 'utf8');

  it('names a file only for fonts the site offers', () => {
    for (const font of Object.keys(FONT_FILES)) {
      expect(FONTS).toContain(font);
    }
  });

  it.each(Object.entries(FONT_FILES))('ships %s as woff2 in public/', (_font, url) => {
    expect(url).toMatch(/^\/fonts\/[\w-]+\.woff2$/);
    expect(existsSync(fromRoot(`public${url}`))).toBe(true);
  });

  it.each(Object.entries(FONT_FILES))(
    'declares %s in the stylesheet with the same url',
    (_font, url) => {
      expect(css).toContain(`url('${url}') format('woff2')`);
    },
  );

  it('switches the body font with the data-font attribute', () => {
    expect(css).toMatch(/\[data-font='handwriting'\]\s*\{\s*--font-body:/);
  });
});
