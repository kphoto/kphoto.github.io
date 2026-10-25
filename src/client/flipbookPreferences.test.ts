import { describe, expect, it } from 'vitest';
import { FLIPBOOK_ORIGINAL_FPS } from '../lib/flipbook.ts';
import { FLIPBOOK_KEY, FlipbookPreferenceStore, startingState } from './flipbookPreferences.ts';
import type { KeyValueStore } from './storage.ts';

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

const throwing: KeyValueStore = {
  get: () => {
    throw new Error('denied');
  },
  set: () => {
    throw new Error('denied');
  },
};

describe('FlipbookPreferenceStore', () => {
  it('reads nothing from an empty store', () => {
    expect(new FlipbookPreferenceStore(memoryStore()).read()).toEqual({});
  });

  it('round-trips every preference under its own key', () => {
    const store = memoryStore();
    const preferences = new FlipbookPreferenceStore(store);
    preferences.write({ fps: 24 });
    preferences.write({ renderer: 'canvas' });
    preferences.write({ autoplay: false });
    expect(preferences.read()).toEqual({ fps: 24, renderer: 'canvas', autoplay: false });
    expect(JSON.parse(store.data.get(FLIPBOOK_KEY) ?? '')).toEqual({
      fps: 24,
      renderer: 'canvas',
      autoplay: false,
    });
  });

  it('drops invalid values but keeps valid ones', () => {
    const store = memoryStore({
      [FLIPBOOK_KEY]: JSON.stringify({ fps: 999, renderer: 'webgl', autoplay: true }),
    });
    expect(new FlipbookPreferenceStore(store).read()).toEqual({ autoplay: true });
  });

  it('ignores corrupt and foreign values', () => {
    for (const raw of ['not json', 'null', '42', '"text"', '[]']) {
      const store = memoryStore({ [FLIPBOOK_KEY]: raw });
      expect(new FlipbookPreferenceStore(store).read()).toEqual({});
    }
  });

  it('survives a store that throws', () => {
    const preferences = new FlipbookPreferenceStore(throwing);
    expect(preferences.read()).toEqual({});
    expect(preferences.write({ fps: 6 })).toEqual({ fps: 6 });
  });
});

describe('startingState', () => {
  it('starts like the original when nothing is stored', () => {
    expect(startingState({}, false)).toEqual({
      fps: FLIPBOOK_ORIGINAL_FPS,
      renderer: 'image',
      playing: true,
    });
  });

  it('starts still when the reader prefers reduced motion', () => {
    expect(startingState({}, true).playing).toBe(false);
  });

  it('lets an explicit choice win over the motion preference', () => {
    expect(startingState({ autoplay: true }, true).playing).toBe(true);
    expect(startingState({ autoplay: false }, false).playing).toBe(false);
  });

  it('uses the stored rate and renderer', () => {
    expect(startingState({ fps: 3, renderer: 'css' }, false)).toEqual({
      fps: 3,
      renderer: 'css',
      playing: true,
    });
  });
});
