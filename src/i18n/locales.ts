export interface LocaleDefinition {
  readonly code: string;
  readonly name: string;
  readonly dir: 'ltr' | 'rtl';
}

export interface LocaleSettings {
  readonly defaultLocale: string;
  readonly locales: readonly LocaleDefinition[];
}

export const LOCALE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/;

export function isLocaleCode(value: unknown): value is string {
  return typeof value === 'string' && LOCALE_CODE_PATTERN.test(value);
}

export function findLocale(settings: LocaleSettings, code: string): LocaleDefinition | undefined {
  return settings.locales.find((locale) => locale.code === code);
}

export function requireLocale(settings: LocaleSettings, code: string): LocaleDefinition {
  const locale = findLocale(settings, code);
  if (!locale) {
    throw new Error(`unknown locale "${code}"`);
  }
  return locale;
}

export function validateLocaleSettings(settings: LocaleSettings): void {
  const codes = settings.locales.map((locale) => locale.code);
  for (const code of codes as readonly unknown[]) {
    if (!isLocaleCode(code)) {
      throw new Error(
        `locale code "${String(code)}" must be lower-case BCP 47, e.g. "en" or "pt-br"`,
      );
    }
  }
  if (new Set(codes).size !== codes.length) {
    throw new Error('locale codes must be unique');
  }
  if (!codes.includes(settings.defaultLocale)) {
    throw new Error(`the default locale "${settings.defaultLocale}" must be listed in locales`);
  }
}

export function localePrefix(settings: LocaleSettings, code: string): string {
  return code === settings.defaultLocale ? '' : `/${code}`;
}

export function localizePath(settings: LocaleSettings, code: string, path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`path "${path}" must be site-absolute`);
  }
  return `${localePrefix(settings, code)}${path}`;
}

export function splitLocalePath(
  settings: LocaleSettings,
  path: string,
): { readonly locale: string; readonly path: string } {
  for (const { code } of settings.locales) {
    if (code === settings.defaultLocale) {
      continue;
    }
    const prefix = `/${code}`;
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return { locale: code, path: path.slice(prefix.length) || '/' };
    }
  }
  return { locale: settings.defaultLocale, path };
}
