import { browserStore } from './browser.ts';
import { defineFlipbookElement } from './flipbookElement.ts';
import { FontController } from './font.ts';
import { chooseSuggestion } from './locale.ts';
import { defineLiveStatsElements } from './liveStatsElements.ts';
import { defineNarrationElement } from './narrationElement.ts';
import { defineSettingSelect } from './settingSelectElement.ts';
import { isFontName, isThemeName, SettingsStore, type ThemeName } from './storage.ts';
import { isDarkTheme, ThemeController, type ConcreteTheme } from './theme.ts';

const documentHost = {
  applyTheme(concrete: ConcreteTheme): void {
    document.documentElement.dataset.theme = concrete;
    document.documentElement.style.colorScheme = isDarkTheme(concrete) ? 'dark' : 'light';
  },
};

const settings = new SettingsStore(browserStore);

const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

const themeController = new ThemeController({
  settings,
  host: documentHost,
  media: {
    prefersDark: () => colorSchemeQuery.matches,
    onChange: (listener) => {
      colorSchemeQuery.addEventListener('change', listener);
    },
  },
});

themeController.start();

const fontController = new FontController({
  settings,
  host: {
    applyFont(font) {
      document.documentElement.dataset.font = font;
    },
  },
});

fontController.start();

defineSettingSelect('kp-theme-picker', {
  current: () => themeController.theme,
  choose: (value) => {
    if (isThemeName(value)) {
      themeController.setTheme(value);
    }
  },
});

defineSettingSelect('kp-font-picker', {
  current: () => fontController.font,
  choose: (value) => {
    if (isFontName(value)) {
      fontController.setFont(value);
    }
  },
});

class LanguageSwitcherElement extends HTMLElement {
  connectedCallback(): void {
    const root = this.shadowRoot;
    const pageLocale = this.dataset.locale;
    if (!root || pageLocale === undefined) {
      return;
    }
    for (const link of root.querySelectorAll<HTMLAnchorElement>('a[data-locale]')) {
      link.addEventListener('click', () => {
        const locale = link.dataset.locale;
        if (locale !== undefined) {
          settings.write({ locale });
        }
      });
    }
    const suggestions = [...root.querySelectorAll<HTMLElement>('.suggest[data-locale]')];
    const suggested = chooseSuggestion({
      pageLocale,
      available: suggestions.map((element) => element.dataset.locale ?? ''),
      preferred: settings.read().locale,
      browserLanguages: navigator.languages,
    });
    for (const element of suggestions) {
      element.hidden = element.dataset.locale !== suggested;
    }
  }
}

customElements.define('kp-language-switcher', LanguageSwitcherElement);

defineLiveStatsElements();

defineNarrationElement(settings);

defineFlipbookElement();

export type { ThemeName };
