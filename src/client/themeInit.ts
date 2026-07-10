import { SETTINGS_KEY, THEMES } from './storage';

const CONCRETE_THEMES = THEMES.filter((theme) => theme !== 'system');

/**
 * Builds the tiny pre-paint script inlined into <head>. It applies the stored
 * theme before the first frame so there is never a flash of the wrong theme.
 * The logic mirrors `resolveConcreteTheme`; keep the two in sync.
 */
export function buildThemeInitScript(settingsKey: string = SETTINGS_KEY): string {
  const key = JSON.stringify(settingsKey);
  const concrete = JSON.stringify(CONCRETE_THEMES);
  const dark = JSON.stringify(['dark', 'solarized-dark']);
  return (
    '(function(){var root=document.documentElement;try{' +
    `var raw=localStorage.getItem(${key});var theme='system';` +
    'if(raw){var parsed=JSON.parse(raw);if(parsed&&typeof parsed.theme==="string"){theme=parsed.theme;}}' +
    `if(${concrete}.indexOf(theme)===-1){theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}` +
    'root.dataset.theme=theme;' +
    `root.style.colorScheme=${dark}.indexOf(theme)>-1?"dark":"light";` +
    '}catch(error){root.dataset.theme="light";root.style.colorScheme="light";}})();'
  );
}
