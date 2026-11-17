import { THEMES, type ThemeName } from '../client/storage.ts';
import type { MessageKey } from '../i18n/messages/index.ts';
import type { Translator } from '../i18n/translator.ts';
import { renderSettingSelect } from './settingSelect.ts';

export const THEME_LABEL_KEYS: Readonly<Record<ThemeName, MessageKey>> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
  'solarized-light': 'theme.solarizedLight',
  'solarized-dark': 'theme.solarizedDark',
};

export function renderThemePicker(t: Translator): string {
  return renderSettingSelect({
    tag: 'kp-theme-picker',
    id: 'theme-select',
    labelHtml: t.html('theme.label'),
    options: THEMES.map((theme) => ({ value: theme, label: t.text(THEME_LABEL_KEYS[theme]) })),
  });
}
