import { isThemeName, SettingsStore, type ThemeName } from './storage';
import { isDarkTheme, ThemeController, type ConcreteTheme } from './theme';

const browserStore = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable; theming still works for this page view.
    }
  },
};

const documentHost = {
  applyTheme(concrete: ConcreteTheme): void {
    document.documentElement.dataset.theme = concrete;
    document.documentElement.style.colorScheme = isDarkTheme(concrete) ? 'dark' : 'light';
  },
};

const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

const themeController = new ThemeController({
  settings: new SettingsStore(browserStore),
  host: documentHost,
  media: {
    prefersDark: () => colorSchemeQuery.matches,
    onChange: (listener) => {
      colorSchemeQuery.addEventListener('change', listener);
    },
  },
});

themeController.start();

/**
 * Upgrades the server-rendered theme picker (declarative shadow DOM) with
 * behaviour: reflect the stored choice and persist changes.
 */
class ThemePickerElement extends HTMLElement {
  connectedCallback(): void {
    const select = this.shadowRoot?.querySelector('select');
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    select.value = themeController.theme;
    select.addEventListener('change', () => {
      const value: string = select.value;
      if (isThemeName(value)) {
        themeController.setTheme(value);
      }
    });
  }
}

customElements.define('kp-theme-picker', ThemePickerElement);

export type { ThemeName };
