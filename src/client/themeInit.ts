import { FONT_FILES } from './font.ts';
import { DEFAULT_FONT, FONTS, SETTINGS_KEY, THEMES } from './storage.ts';

const CONCRETE_THEMES = THEMES.filter((theme) => theme !== 'system');

export function buildThemeInitScript(settingsKey: string = SETTINGS_KEY): string {
  const key = JSON.stringify(settingsKey);
  const concrete = JSON.stringify(CONCRETE_THEMES);
  const dark = JSON.stringify(['dark', 'solarized-dark']);
  const fonts = JSON.stringify(FONTS);
  const files = JSON.stringify(FONT_FILES);
  const fallbackFont = JSON.stringify(DEFAULT_FONT);
  return (
    `(function(){var root=document.documentElement;var theme="light";var font=${fallbackFont};try{` +
    `var raw=localStorage.getItem(${key});theme="system";` +
    'if(raw){var parsed=JSON.parse(raw);if(parsed&&typeof parsed==="object"){' +
    'if(typeof parsed.theme==="string"){theme=parsed.theme;}' +
    `if(${fonts}.indexOf(parsed.font)>-1){font=parsed.font;}}}` +
    `if(${concrete}.indexOf(theme)===-1){theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}` +
    '}catch(error){theme="light";}' +
    'root.dataset.theme=theme;' +
    `root.style.colorScheme=${dark}.indexOf(theme)>-1?"dark":"light";` +
    'root.dataset.font=font;' +
    `var file=${files}[font];` +
    'if(file){try{var link=document.createElement("link");link.rel="preload";link.as="font";link.type="font/woff2";link.crossOrigin="anonymous";link.href=file;document.head.appendChild(link);}catch(error){}}' +
    '})();'
  );
}
