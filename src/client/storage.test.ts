import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  isPlaybackRate,
  isThemeName,
  MAX_PLAYBACK_RATE,
  MIN_PLAYBACK_RATE,
  SETTINGS_KEY,
  SettingsStore,
  type KeyValueStore,
} from './storage.ts';

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

describe('isPlaybackRate', () => {
  it('accepts every speed a native player offers', () => {
    for (const rate of [MIN_PLAYBACK_RATE, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, MAX_PLAYBACK_RATE]) {
      expect(isPlaybackRate(rate)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    for (const value of [0, -1, 0.2, 4.5, Number.NaN, Infinity, '1.5', null, undefined]) {
      expect(isPlaybackRate(value)).toBe(false);
    }
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

  it('remembers a language choice next to the theme', () => {
    const store = new SettingsStore(memoryStore());
    store.write({ theme: 'dark' });
    store.write({ locale: 'es' });
    expect(store.read()).toEqual({ theme: 'dark', locale: 'es' });
  });

  it('drops an invalid stored language but keeps the theme', () => {
    const backing = memoryStore();
    backing.set(SETTINGS_KEY, JSON.stringify({ theme: 'light', locale: 'Español' }));
    expect(new SettingsStore(backing).read()).toEqual({ theme: 'light' });
  });

  it('keeps a valid language when the theme is unknown', () => {
    const backing = memoryStore();
    backing.set(SETTINGS_KEY, JSON.stringify({ theme: 'neon', locale: 'es' }));
    expect(new SettingsStore(backing).read()).toEqual({ theme: 'system', locale: 'es' });
  });

  it('remembers a listening speed next to the other settings', () => {
    const store = new SettingsStore(memoryStore());
    store.write({ theme: 'dark', locale: 'es' });
    store.write({ playbackRate: 1.5 });
    expect(store.read()).toEqual({ theme: 'dark', locale: 'es', playbackRate: 1.5 });
  });

  it('drops an out-of-range or foreign stored speed but keeps the rest', () => {
    for (const playbackRate of [16, 0, '2', null]) {
      const backing = memoryStore();
      backing.set(SETTINGS_KEY, JSON.stringify({ theme: 'light', playbackRate }));
      expect(new SettingsStore(backing).read()).toEqual({ theme: 'light' });
    }
  });
});
