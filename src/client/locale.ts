import { isLocaleCode } from '../i18n/locales.ts';

export interface SuggestionInput {
  readonly pageLocale: string;
  readonly available: readonly string[];
  readonly preferred: string | undefined;
  readonly browserLanguages: readonly string[];
}

export function matchBrowserLanguage(
  available: readonly string[],
  browserLanguages: readonly string[],
): string | undefined {
  for (const tag of browserLanguages) {
    const lower = tag.toLowerCase();
    const exact = available.find((code) => code === lower);
    if (exact !== undefined) {
      return exact;
    }
    const primary = lower.split('-')[0] ?? '';
    const loose = available.find((code) => code === primary || code.split('-')[0] === primary);
    if (loose !== undefined) {
      return loose;
    }
  }
  return undefined;
}

export function chooseSuggestion(input: SuggestionInput): string | undefined {
  const wanted =
    input.preferred !== undefined && isLocaleCode(input.preferred)
      ? input.preferred
      : matchBrowserLanguage([input.pageLocale, ...input.available], input.browserLanguages);
  if (wanted === undefined || wanted === input.pageLocale) {
    return undefined;
  }
  return input.available.includes(wanted) ? wanted : undefined;
}
