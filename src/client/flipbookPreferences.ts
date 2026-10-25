import {
  DEFAULT_RENDERER,
  FLIPBOOK_ORIGINAL_FPS,
  isFlipbookRenderer,
  isFps,
  type FlipbookRenderer,
} from '../lib/flipbook.ts';
import type { KeyValueStore } from './storage.ts';

export const FLIPBOOK_KEY = 'kphoto:flipbook:v1';

export interface FlipbookPreferences {
  readonly fps?: number;
  readonly renderer?: FlipbookRenderer;
  readonly autoplay?: boolean;
}

export interface FlipbookStart {
  readonly fps: number;
  readonly renderer: FlipbookRenderer;
  readonly playing: boolean;
}

function parsePreferences(raw: string): FlipbookPreferences {
  const parsed: unknown = JSON.parse(raw);
  if (parsed === null || typeof parsed !== 'object') {
    return {};
  }
  const fps: unknown = 'fps' in parsed ? parsed.fps : undefined;
  const renderer: unknown = 'renderer' in parsed ? parsed.renderer : undefined;
  const autoplay: unknown = 'autoplay' in parsed ? parsed.autoplay : undefined;
  return {
    ...(isFps(fps) ? { fps } : {}),
    ...(isFlipbookRenderer(renderer) ? { renderer } : {}),
    ...(typeof autoplay === 'boolean' ? { autoplay } : {}),
  };
}

export class FlipbookPreferenceStore {
  readonly #store: KeyValueStore;

  constructor(store: KeyValueStore) {
    this.#store = store;
  }

  read(): FlipbookPreferences {
    try {
      const raw = this.#store.get(FLIPBOOK_KEY);
      return raw === null ? {} : parsePreferences(raw);
    } catch {
      return {};
    }
  }

  write(update: FlipbookPreferences): FlipbookPreferences {
    const next: FlipbookPreferences = { ...this.read(), ...update };
    try {
      this.#store.set(FLIPBOOK_KEY, JSON.stringify(next));
    } catch {}
    return next;
  }
}

export function startingState(
  preferences: FlipbookPreferences,
  prefersReducedMotion: boolean,
): FlipbookStart {
  return {
    fps: preferences.fps ?? FLIPBOOK_ORIGINAL_FPS,
    renderer: preferences.renderer ?? DEFAULT_RENDERER,
    playing: preferences.autoplay ?? !prefersReducedMotion,
  };
}
