import { isLocaleCode } from '../i18n/locales.ts';

export const SETTINGS_KEY = 'kphoto:settings:v1';

export const THEMES = ['system', 'light', 'dark', 'solarized-light', 'solarized-dark'] as const;

export type ThemeName = (typeof THEMES)[number];

export interface Settings {
  readonly theme: ThemeName;
  readonly locale?: string;
  readonly playbackRate?: number;
}

export const MIN_PLAYBACK_RATE = 0.25;

export const MAX_PLAYBACK_RATE = 4;

export const DEFAULT_SETTINGS: Settings = { theme: 'system' };

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isPlaybackRate(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_PLAYBACK_RATE &&
    value <= MAX_PLAYBACK_RATE
  );
}

export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

function parseSettings(raw: string): Settings {
  const parsed: unknown = JSON.parse(raw);
  if (parsed === null || typeof parsed !== 'object') {
    return DEFAULT_SETTINGS;
  }
  const theme: unknown = 'theme' in parsed ? parsed.theme : undefined;
  const locale: unknown = 'locale' in parsed ? parsed.locale : undefined;
  const playbackRate: unknown = 'playbackRate' in parsed ? parsed.playbackRate : undefined;
  return {
    theme: isThemeName(theme) ? theme : DEFAULT_SETTINGS.theme,
    ...(isLocaleCode(locale) ? { locale } : {}),
    ...(isPlaybackRate(playbackRate) ? { playbackRate } : {}),
  };
}

export class SettingsStore {
  readonly #store: KeyValueStore;

  constructor(store: KeyValueStore) {
    this.#store = store;
  }

  read(): Settings {
    try {
      const raw = this.#store.get(SETTINGS_KEY);
      return raw === null ? DEFAULT_SETTINGS : parseSettings(raw);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  write(update: Partial<Settings>): Settings {
    const next: Settings = { ...this.read(), ...update };
    try {
      this.#store.set(SETTINGS_KEY, JSON.stringify(next));
    } catch {}
    return next;
  }
}
