import { parseIsoDate } from '../lib/dates.ts';
import { escapeAttribute, escapeHtml } from '../lib/html.ts';
import {
  formatMessage,
  formatNumber,
  interpolate,
  selectTemplate,
  type MessageParams,
  type MessageValue,
} from './format.ts';
import type { LocaleDefinition, LocaleSettings } from './locales.ts';
import type { Catalog, Catalogs, MessageKey } from './messages/index.ts';
import { isSafeHtml, type SafeHtml } from './safeHtml.ts';

export type HtmlParams = Readonly<Record<string, string | number | SafeHtml>>;

export interface ResolvedMessage {
  readonly value: MessageValue;
  readonly locale: string;
}

export interface Translator {
  readonly locale: LocaleDefinition;
  readonly defaultLocale: string;
  resolve(key: MessageKey): ResolvedMessage;
  text(key: MessageKey, params?: MessageParams): string;
  html(key: MessageKey, params?: HtmlParams): string;
  number(value: number): string;
  date(isoDate: string): string;
  localeName(code: string): string;
}

export function createTranslator(
  settings: LocaleSettings,
  catalogs: Catalogs,
  code: string,
): Translator {
  const locale = settings.locales.find((candidate) => candidate.code === code);
  if (!locale) {
    throw new Error(`unknown locale "${code}"`);
  }
  const own: Partial<Catalog> = catalogs[code] ?? {};
  const fallback: Catalog = catalogs[settings.defaultLocale] as Catalog;
  const languageNames = new Intl.DisplayNames([code], { type: 'language', fallback: 'none' });
  const dateFormat = new Intl.DateTimeFormat(code, { dateStyle: 'long', timeZone: 'UTC' });

  const resolve = (key: MessageKey): ResolvedMessage => {
    const value = own[key];
    return value === undefined
      ? { value: fallback[key], locale: settings.defaultLocale }
      : { value, locale: code };
  };

  return {
    locale,
    defaultLocale: settings.defaultLocale,
    resolve,
    text(key, params) {
      const resolved = resolve(key);
      return formatMessage(resolved.locale, resolved.value, params);
    },
    html(key, params = {}) {
      const resolved = resolve(key);
      const count = params.count;
      const template = selectTemplate(
        resolved.locale,
        resolved.value,
        typeof count === 'number' ? count : undefined,
      );
      const values: Record<string, string> = {};
      for (const [name, param] of Object.entries(params)) {
        values[name] = isSafeHtml(param)
          ? param.safeHtml
          : typeof param === 'number'
            ? formatNumber(resolved.locale, param)
            : escapeHtml(param);
      }
      const html = interpolate(escapeHtml(template), values);
      return resolved.locale === code
        ? html
        : `<span lang="${escapeAttribute(resolved.locale)}">${html}</span>`;
    },
    number(value) {
      return formatNumber(code, value);
    },
    date(isoDate) {
      const { year, month, day } = parseIsoDate(isoDate);
      return dateFormat.format(Date.UTC(year, month - 1, day));
    },
    localeName(target) {
      return (
        languageNames.of(target) ??
        settings.locales.find((candidate) => candidate.code === target)?.name ??
        target
      );
    },
  };
}

export function missingKeys(catalogs: Catalogs, defaultLocale: string, code: string): MessageKey[] {
  const base = catalogs[defaultLocale] ?? {};
  const own = catalogs[code] ?? {};
  return (Object.keys(base) as MessageKey[]).filter((key) => own[key] === undefined);
}
