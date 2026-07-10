import { escapeHtml } from './html';
import { slugify } from './slug';

/**
 * A hand-rolled markdown renderer covering the subset this blog is written in
 * (see docs/adr/0004-zero-runtime-dependencies.md):
 *
 * - ATX headings `#` … `######` with slugified, de-duplicated ids
 * - paragraphs (soft line breaks join with a space)
 * - fenced code blocks with an optional language class
 * - inline code, `**strong**`, `__strong__`, `*emphasis*`, `_emphasis_`
 * - links `[text](url)` and images `![alt](url)` with URL sanitisation
 * - blockquotes (nested), unordered and ordered lists (nested), and `---` rules
 *
 * Raw HTML is escaped, never passed through, so post content cannot inject
 * markup. Tables, reference links and setext headings are intentionally not
 * supported.
 */

export interface MarkdownHeading {
  readonly level: number;
  readonly text: string;
  readonly id: string;
}

export interface RenderedMarkdown {
  readonly html: string;
  readonly headings: readonly MarkdownHeading[];
}

/**
 * Allows http(s) and mailto URLs plus anything relative; every other scheme
 * (javascript:, data:, …) collapses to `#`.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
  if (!scheme) {
    return trimmed;
  }
  const name = (scheme[1] ?? '').toLowerCase();
  return name === 'https' || name === 'http' || name === 'mailto' ? trimmed : '#';
}

/** Applies inline markup to text that has already been HTML-escaped. */
function renderInlineText(escaped: string): string {
  let out = escaped;
  out = out.replace(
    /!\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g,
    (_match, alt: string, src: string) =>
      `<img src="${sanitizeUrl(src)}" alt="${alt}" loading="lazy" />`,
  );
  out = out.replace(
    /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g,
    (_match, label: string, href: string) => `<a href="${sanitizeUrl(href)}">${label}</a>`,
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/(^|[\s(])_([^_]+)_(?=$|[\s).,:;!?])/g, '$1<em>$2</em>');
  return out;
}

/** Renders inline markdown: code spans first, then the remaining markup. */
export function renderInline(text: string): string {
  const parts: string[] = [];
  const codePattern = /`([^`]+)`/g;
  let last = 0;
  let match = codePattern.exec(text);
  while (match !== null) {
    parts.push(renderInlineText(escapeHtml(text.slice(last, match.index))));
    parts.push(`<code>${escapeHtml(match[1] ?? '')}</code>`);
    last = match.index + match[0].length;
    match = codePattern.exec(text);
  }
  parts.push(renderInlineText(escapeHtml(text.slice(last))));
  return parts.join('');
}

class HeadingIds {
  readonly #used = new Map<string, number>();

  next(text: string): string {
    const base = slugify(text);
    const count = this.#used.get(base) ?? 0;
    this.#used.set(base, count + 1);
    return count === 0 ? base : `${base}-${String(count + 1)}`;
  }
}

const HEADING_PATTERN = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE_PATTERN = /^```([A-Za-z0-9+#.-]*)\s*$/;
const RULE_PATTERN = /^ {0,3}(-{3,}|\*{3,}|_{3,})\s*$/;
const QUOTE_PATTERN = /^ {0,3}>/;
const LIST_ITEM_PATTERN = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;

function isBlank(line: string): boolean {
  return line.trim() === '';
}

function indentOf(line: string): number {
  return line.length - line.trimStart().length;
}

function dedent(line: string, spaces: number): string {
  let removed = 0;
  while (removed < spaces && line.startsWith(' ', removed)) {
    removed += 1;
  }
  return line.slice(removed);
}

function startsBlock(line: string): boolean {
  return (
    HEADING_PATTERN.test(line) ||
    FENCE_PATTERN.test(line) ||
    RULE_PATTERN.test(line) ||
    QUOTE_PATTERN.test(line) ||
    LIST_ITEM_PATTERN.test(line)
  );
}

interface ListItemDraft {
  readonly text: string;
  readonly childLines: string[];
}

interface Renderer {
  readonly ids: HeadingIds;
  readonly headings: MarkdownHeading[];
}

function renderList(lines: readonly string[], start: number, renderer: Renderer): [string, number] {
  const first = LIST_ITEM_PATTERN.exec(lines[start] ?? '');
  if (!first) {
    return ['', start + 1];
  }
  const baseIndent = (first[1] ?? '').length;
  const ordered = /^\d/.test(first[2] ?? '');
  const items: ListItemDraft[] = [];
  let index = start;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (isBlank(line)) {
      const next = lines.slice(index + 1).find((candidate) => !isBlank(candidate));
      const continues =
        next !== undefined &&
        (indentOf(next) > baseIndent ||
          (LIST_ITEM_PATTERN.exec(next)?.[1] ?? '').length === baseIndent);
      if (!continues) {
        break;
      }
      const current = items.at(-1);
      if (current && indentOf(next) > baseIndent) {
        current.childLines.push('');
      }
      index += 1;
      continue;
    }
    const itemMatch = LIST_ITEM_PATTERN.exec(line);
    if (itemMatch && (itemMatch[1] ?? '').length === baseIndent) {
      items.push({ text: itemMatch[3] ?? '', childLines: [] });
      index += 1;
      continue;
    }
    if (indentOf(line) > baseIndent) {
      items.at(-1)?.childLines.push(dedent(line, baseIndent + 2));
      index += 1;
      continue;
    }
    break;
  }
  const tag = ordered ? 'ol' : 'ul';
  const body = items
    .map((item) => {
      const children = item.childLines.length > 0 ? renderBlocks(item.childLines, renderer) : '';
      return `<li>${renderInline(item.text)}${children}</li>`;
    })
    .join('');
  return [`<${tag}>${body}</${tag}>`, index];
}

function renderBlocks(lines: readonly string[], renderer: Renderer): string {
  const html: string[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (isBlank(line)) {
      index += 1;
      continue;
    }

    const fence = FENCE_PATTERN.exec(line);
    if (fence) {
      const language = fence[1] ?? '';
      const code: string[] = [];
      index += 1;
      while (index < lines.length && (lines[index] ?? '').trimEnd() !== '```') {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1;
      const classAttribute = language === '' ? '' : ` class="language-${language}"`;
      html.push(`<pre><code${classAttribute}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = HEADING_PATTERN.exec(line);
    if (heading) {
      const level = (heading[1] ?? '#').length;
      const text = heading[2] ?? '';
      const id = renderer.ids.next(text);
      renderer.headings.push({ level, text, id });
      html.push(`<h${String(level)} id="${id}">${renderInline(text)}</h${String(level)}>`);
      index += 1;
      continue;
    }

    if (RULE_PATTERN.test(line)) {
      html.push('<hr />');
      index += 1;
      continue;
    }

    if (QUOTE_PATTERN.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && QUOTE_PATTERN.test(lines[index] ?? '')) {
        quoted.push((lines[index] ?? '').replace(/^ {0,3}> ?/, ''));
        index += 1;
      }
      html.push(`<blockquote>${renderBlocks(quoted, renderer)}</blockquote>`);
      continue;
    }

    if (LIST_ITEM_PATTERN.test(line)) {
      const [listHtml, next] = renderList(lines, index, renderer);
      html.push(listHtml);
      index = next;
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index] ?? '';
      if (isBlank(candidate) || startsBlock(candidate)) {
        break;
      }
      paragraph.push(candidate.trim());
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }
  return html.join('\n');
}

/** Renders a markdown document to HTML and collects its headings. */
export function renderMarkdown(source: string): RenderedMarkdown {
  const renderer: Renderer = { ids: new HeadingIds(), headings: [] };
  const html = renderBlocks(source.split('\n'), renderer);
  return { html, headings: renderer.headings };
}
