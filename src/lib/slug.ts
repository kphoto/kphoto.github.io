/**
 * Turns arbitrary text into a URL- and id-safe slug: lower-case ASCII letters,
 * digits and single hyphens. Diacritics are folded to their base characters.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'untitled' : slug;
}
