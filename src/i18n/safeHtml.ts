export interface SafeHtml {
  readonly safeHtml: string;
}

export function rawHtml(html: string): SafeHtml {
  return { safeHtml: html };
}

export function isSafeHtml(value: unknown): value is SafeHtml {
  return typeof value === 'object' && value !== null && 'safeHtml' in value;
}
