const HTML_REPLACEMENTS: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_REPLACEMENTS[character] ?? character);
}

export function escapeAttribute(text: string): string {
  return escapeHtml(text);
}
