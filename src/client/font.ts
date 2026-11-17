import { DEFAULT_FONT, type FontName, type SettingsStore } from './storage.ts';

export const FONT_FILES: Readonly<Partial<Record<FontName, string>>> = {
  handwriting: '/fonts/regular.woff2',
};

export interface FontHost {
  applyFont(font: FontName): void;
}

interface FontControllerDeps {
  readonly settings: SettingsStore;
  readonly host: FontHost;
}

export class FontController {
  readonly #settings: SettingsStore;
  readonly #host: FontHost;

  constructor(deps: FontControllerDeps) {
    this.#settings = deps.settings;
    this.#host = deps.host;
  }

  get font(): FontName {
    return this.#settings.read().font ?? DEFAULT_FONT;
  }

  start(): void {
    this.#host.applyFont(this.font);
  }

  setFont(next: FontName): void {
    this.#settings.write({ font: next });
    this.#host.applyFont(next);
  }
}
