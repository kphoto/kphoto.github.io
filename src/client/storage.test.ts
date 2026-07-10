import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  isThemeName,
  SETTINGS_KEY,
  SettingsStore,
  type KeyValueStore,
} from './storage';

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

describe('isThemeName', () => {
  it('accepts every offered theme', () => {
    for (const theme of ['system', 'light', 'dark', 'solarized-light', 'solarized-dark']) {
      expect(isThemeName(theme)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isThemeName('hotdog-stand')).toBe(false);
    expect(isThemeName(42)).toBe(false);
    expect(isThemeName(null)).toBe(false);
  });
});

describe('SettingsStore', () => {
  it('returns defaults when nothing is stored', () => {
    expect(new SettingsStore(memoryStore()).read()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips a written theme', () => {
    const store = new SettingsStore(memoryStore());
    store.write({ theme: 'solarized-dark' });
    expect(store.read().theme).toBe('solarized-dark');
  });

  it('persists under the single versioned key', () => {
    const backing = memoryStore();
    new SettingsStore(backing).write({ theme: 'dark' });
    expect([...backing.data.keys()]).toEqual([SETTINGS_KEY]);
    expect(backing.data.get(SETTINGS_KEY)).toBe('{"theme":"dark"}');
  });

  it('falls back to defaults on corrupt JSON', () => {
    const store = new SettingsStore(memoryStore({ [SETTINGS_KEY]: '{not json' }));
    expect(store.read()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults on an unknown theme value', () => {
    const store = new SettingsStore(memoryStore({ [SETTINGS_KEY]: '{"theme":"neon"}' }));
    expect(store.read()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults on foreign shapes', () => {
    for (const raw of ['42', 'null', '"dark"', '[]']) {
      const store = new SettingsStore(memoryStore({ [SETTINGS_KEY]: raw }));
      expect(store.read()).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('survives a throwing backing store', () => {
    const store = new SettingsStore({
      get: () => {
        throw new Error('denied');
      },
      set: () => {
        throw new Error('denied');
      },
    });
    expect(store.read()).toEqual(DEFAULT_SETTINGS);
    expect(store.write({ theme: 'dark' })).toEqual({ theme: 'dark' });
  });
});
