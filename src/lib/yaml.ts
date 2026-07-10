/**
 * A deliberately small, hand-rolled YAML parser covering exactly the subset
 * this site's content uses (see docs/adr/0004-zero-runtime-dependencies.md):
 *
 * - mappings with unquoted keys (`title: Good morning!`)
 * - nested mappings through indentation (`socials:` followed by deeper keys)
 * - block lists of scalars (`- introductions`)
 * - scalars: plain strings, single/double quoted strings, integers, floats,
 *   booleans and null (`~`/`null`/empty)
 * - full-line comments starting with `#`
 *
 * Anything outside that subset fails loudly with a line number instead of
 * guessing, which keeps content errors easy to fix.
 */

export type YamlValue = string | number | boolean | null | YamlValue[] | YamlMap;

export interface YamlMap {
  [key: string]: YamlValue;
}

export class YamlParseError extends Error {
  readonly line: number;

  constructor(message: string, line: number) {
    super(`YAML error on line ${String(line)}: ${message}`);
    this.name = 'YamlParseError';
    this.line = line;
  }
}

interface SourceLine {
  readonly indent: number;
  readonly text: string;
  readonly number: number;
}

function toSourceLines(source: string): SourceLine[] {
  const lines: SourceLine[] = [];
  source.split('\n').forEach((raw, index) => {
    const number = index + 1;
    if (/^\s*\t/.test(raw)) {
      throw new YamlParseError('tabs are not allowed for indentation', number);
    }
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      return;
    }
    const indent = raw.length - raw.trimStart().length;
    lines.push({ indent, text: raw.trim(), number });
  });
  return lines;
}

function unescapeDoubleQuoted(content: string, line: number): string {
  let result = '';
  for (let i = 0; i < content.length; i += 1) {
    const character = content[i];
    if (character !== '\\') {
      result += character ?? '';
      continue;
    }
    const next = content[i + 1];
    i += 1;
    switch (next) {
      case '\\':
        result += '\\';
        break;
      case '"':
        result += '"';
        break;
      case 'n':
        result += '\n';
        break;
      case 't':
        result += '\t';
        break;
      default:
        throw new YamlParseError(`unsupported escape sequence "\\${next ?? ''}"`, line);
    }
  }
  return result;
}

function parseScalar(token: string, line: number): YamlValue {
  const value = token.trim();
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || value.length < 2) {
      throw new YamlParseError('unterminated double-quoted string', line);
    }
    return unescapeDoubleQuoted(value.slice(1, -1), line);
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      throw new YamlParseError('unterminated single-quoted string', line);
    }
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (value === '' || value === 'null' || value === '~') {
    return null;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  if (/^-?\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  if (/^-?\d+\.\d+$/.test(value)) {
    return Number.parseFloat(value);
  }
  return value;
}

function isListItem(line: SourceLine): boolean {
  return line.text === '-' || line.text.startsWith('- ');
}

interface ParseResult {
  readonly value: YamlValue;
  readonly next: number;
}

function parseList(lines: readonly SourceLine[], start: number, indent: number): ParseResult {
  const items: YamlValue[] = [];
  let index = start;
  while (index < lines.length) {
    const line = lines[index];
    if (!line || line.indent < indent) {
      break;
    }
    if (line.indent > indent) {
      throw new YamlParseError(
        'nested structures inside list items are not supported by this YAML subset',
        line.number,
      );
    }
    if (!isListItem(line)) {
      throw new YamlParseError('expected a "- " list item', line.number);
    }
    items.push(parseScalar(line.text.slice(1), line.number));
    index += 1;
  }
  return { value: items, next: index };
}

const KEY_PATTERN = /^([^:]+?):(?:\s+(.*))?$/;

function parseMap(lines: readonly SourceLine[], start: number, indent: number): ParseResult {
  const map: YamlMap = {};
  let index = start;
  while (index < lines.length) {
    const line = lines[index];
    if (!line || line.indent < indent) {
      break;
    }
    if (line.indent > indent) {
      throw new YamlParseError('unexpected indentation', line.number);
    }
    if (isListItem(line)) {
      throw new YamlParseError('list items cannot be mixed into a mapping', line.number);
    }
    const match = KEY_PATTERN.exec(line.text);
    if (!match) {
      throw new YamlParseError('expected a "key: value" mapping entry', line.number);
    }
    const key = (match[1] ?? '').trim();
    if (key === '') {
      throw new YamlParseError('mapping keys must not be empty', line.number);
    }
    if (Object.hasOwn(map, key)) {
      throw new YamlParseError(`duplicate key "${key}"`, line.number);
    }
    const inlineValue = match[2];
    if (inlineValue !== undefined && inlineValue.trim() !== '') {
      map[key] = parseScalar(inlineValue, line.number);
      index += 1;
      continue;
    }
    const child = lines[index + 1];
    if (child && child.indent > line.indent) {
      const parsed = parseBlock(lines, index + 1, child.indent);
      map[key] = parsed.value;
      index = parsed.next;
    } else {
      map[key] = null;
      index += 1;
    }
  }
  return { value: map, next: index };
}

function parseBlock(lines: readonly SourceLine[], start: number, indent: number): ParseResult {
  const first = lines[start];
  if (!first) {
    return { value: null, next: start };
  }
  return isListItem(first) ? parseList(lines, start, indent) : parseMap(lines, start, indent);
}

/** Parses a YAML document whose top level is a mapping. */
export function parseYaml(source: string): YamlMap {
  const lines = toSourceLines(source);
  const first = lines[0];
  if (!first) {
    return {};
  }
  const { value, next } = parseBlock(lines, 0, first.indent);
  const remaining = lines[next];
  if (remaining) {
    throw new YamlParseError(
      'content after the top-level block is not supported',
      remaining.number,
    );
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new YamlParseError('the top level of a document must be a mapping', first.number);
  }
  return value;
}
