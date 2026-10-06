export type PluralForms = Readonly<Partial<Record<Intl.LDMLPluralRule, string>>> & {
  readonly other: string;
};

export type MessageValue = string | PluralForms;

export type MessageParams = Readonly<Record<string, string | number>>;

export function isMessageValue(value: unknown): value is MessageValue {
  if (typeof value === 'string') {
    return true;
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const entries = Object.entries(value);
  return (
    entries.some(([form]) => form === 'other') &&
    entries.every(([, text]) => typeof text === 'string')
  );
}

export function selectTemplate(locale: string, value: MessageValue, count?: number): string {
  if (typeof value === 'string') {
    return value;
  }
  if (count === undefined) {
    return value.other;
  }
  const exact = count === 0 ? value.zero : undefined;
  return exact ?? value[new Intl.PluralRules(locale).select(count)] ?? value.other;
}

export function interpolate(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? (values[name] ?? placeholder) : placeholder,
  );
}

export function formatNumber(locale: string, value: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatMessage(
  locale: string,
  value: MessageValue,
  params: MessageParams = {},
): string {
  const count = params.count;
  const template = selectTemplate(locale, value, typeof count === 'number' ? count : undefined);
  const values: Record<string, string> = {};
  for (const [name, param] of Object.entries(params)) {
    values[name] = typeof param === 'number' ? formatNumber(locale, param) : param;
  }
  return interpolate(template, values);
}
