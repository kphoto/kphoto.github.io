/** The single localStorage key all persisted settings live under. */
export const SETTINGS_KEY = 'kphoto:settings:v1';

export const THEMES = ['system', 'light', 'dark', 'solarized-light', 'solarized-dark'] as const;

export type ThemeName = (typeof THEMES)[number];

export interface Settings {
  readonly theme: ThemeName;
}

export const DEFAULT_SETTINGS: Settings = { theme: 'system' };

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** Minimal key-value abstraction so tests never need a real localStorage. */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

/**
 * Versioned, validated settings persistence. Corrupt or foreign data falls
 * back to defaults instead of breaking the page.
 */
export class SettingsStore {
  readonly #store: KeyValueStore;

  constructor(store: KeyValueStore) {
    this.#store = store;
  }

  read(): Settings {
    try {
      const raw = this.#store.get(SETTINGS_KEY);
      if (raw === null) {
        return DEFAULT_SETTINGS;
      }
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === 'object' && 'theme' in parsed) {
        const theme: unknown = parsed.theme;
        if (isThemeName(theme)) {
          return { theme };
        }
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  write(update: Partial<Settings>): Settings {
    const next: Settings = { ...this.read(), ...update };
    try {
      this.#store.set(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode, quota); the theme still applies.
    }
    return next;
  }
}
