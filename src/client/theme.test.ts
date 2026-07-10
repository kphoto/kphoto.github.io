import { describe, expect, it } from 'vitest';
import { SettingsStore, type KeyValueStore, type ThemeName } from './storage';
import {
  isDarkTheme,
  resolveConcreteTheme,
  ThemeController,
  type ColorSchemeMedia,
  type ConcreteTheme,
  type ThemeHost,
} from './theme';

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => {
      data.set(key, value);
    },
  };
}

function fakeMedia(initialDark: boolean): ColorSchemeMedia & { flip: (dark: boolean) => void } {
  let dark = initialDark;
  const listeners: (() => void)[] = [];
  return {
    prefersDark: () => dark,
    onChange: (listener) => {
      listeners.push(listener);
    },
    flip: (next) => {
      dark = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

function recordingHost(): ThemeHost & { applied: [ConcreteTheme, ThemeName][] } {
  const applied: [ConcreteTheme, ThemeName][] = [];
  return {
    applied,
    applyTheme: (concrete, choice) => {
      applied.push([concrete, choice]);
    },
  };
}

describe('resolveConcreteTheme', () => {
  it('passes concrete choices through', () => {
    expect(resolveConcreteTheme('solarized-light', true)).toBe('solarized-light');
  });

  it('resolves system from the OS preference', () => {
    expect(resolveConcreteTheme('system', true)).toBe('dark');
    expect(resolveConcreteTheme('system', false)).toBe('light');
  });
});

describe('isDarkTheme', () => {
  it('classifies the two dark themes', () => {
    expect(isDarkTheme('dark')).toBe(true);
    expect(isDarkTheme('solarized-dark')).toBe(true);
    expect(isDarkTheme('light')).toBe(false);
    expect(isDarkTheme('solarized-light')).toBe(false);
  });
});

describe('ThemeController', () => {
  function build(initialDark = false) {
    const host = recordingHost();
    const media = fakeMedia(initialDark);
    const controller = new ThemeController({
      settings: new SettingsStore(memoryStore()),
      host,
      media,
    });
    return { controller, host, media };
  }

  it('applies the resolved system theme on start', () => {
    const { controller, host } = build(true);
    controller.start();
    expect(host.applied).toEqual([['dark', 'system']]);
  });

  it('persists and applies an explicit choice', () => {
    const { controller, host } = build(false);
    controller.start();
    controller.setTheme('solarized-dark');
    expect(controller.theme).toBe('solarized-dark');
    expect(host.applied.at(-1)).toEqual(['solarized-dark', 'solarized-dark']);
  });

  it('follows OS changes while the choice is system', () => {
    const { controller, host, media } = build(false);
    controller.start();
    media.flip(true);
    expect(host.applied.at(-1)).toEqual(['dark', 'system']);
  });

  it('ignores OS changes once an explicit theme is chosen', () => {
    const { controller, host, media } = build(false);
    controller.start();
    controller.setTheme('light');
    const before = host.applied.length;
    media.flip(true);
    expect(host.applied.length).toBe(before);
  });
});
