import type { SettingsStore, ThemeName } from './storage';

/** A theme that can actually be painted; `system` resolves to one of these. */
export type ConcreteTheme = Exclude<ThemeName, 'system'>;

export function resolveConcreteTheme(choice: ThemeName, prefersDark: boolean): ConcreteTheme {
  if (choice === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return choice;
}

export function isDarkTheme(theme: ConcreteTheme): boolean {
  return theme === 'dark' || theme === 'solarized-dark';
}

/** Where the resolved theme gets applied (the real host is `<html>`). */
export interface ThemeHost {
  applyTheme(concrete: ConcreteTheme, choice: ThemeName): void;
}

/** OS colour-scheme signal, injected so tests can flip it freely. */
export interface ColorSchemeMedia {
  prefersDark(): boolean;
  onChange(listener: () => void): void;
}

interface ThemeControllerDeps {
  readonly settings: SettingsStore;
  readonly host: ThemeHost;
  readonly media: ColorSchemeMedia;
}

/**
 * Owns the theme lifecycle: applies the persisted choice, persists changes,
 * and follows the OS while the choice is `system`.
 */
export class ThemeController {
  readonly #settings: SettingsStore;
  readonly #host: ThemeHost;
  readonly #media: ColorSchemeMedia;

  constructor(deps: ThemeControllerDeps) {
    this.#settings = deps.settings;
    this.#host = deps.host;
    this.#media = deps.media;
  }

  get theme(): ThemeName {
    return this.#settings.read().theme;
  }

  start(): void {
    this.#apply();
    this.#media.onChange(() => {
      if (this.theme === 'system') {
        this.#apply();
      }
    });
  }

  setTheme(next: ThemeName): void {
    this.#settings.write({ theme: next });
    this.#apply();
  }

  #apply(): void {
    const choice = this.theme;
    this.#host.applyTheme(resolveConcreteTheme(choice, this.#media.prefersDark()), choice);
  }
}
