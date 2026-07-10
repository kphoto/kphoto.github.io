const HTML_REPLACEMENTS: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for safe interpolation into HTML element content. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_REPLACEMENTS[character] ?? character);
}

/** Escapes text for safe interpolation into a double-quoted HTML attribute. */
export function escapeAttribute(text: string): string {
  return escapeHtml(text);
}
