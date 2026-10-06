import type { YamlMap } from './yaml.ts';
import { parseYaml } from './yaml.ts';

export interface FrontmatterDocument {
  readonly data: YamlMap;

  readonly body: string;
}

export function extractFrontmatter(source: string): FrontmatterDocument {
  const normalized = source.replace(/^\uFEFF/, '');
  const lines = normalized.split('\n');
  if ((lines[0] ?? '').trimEnd() !== '---') {
    throw new Error('missing frontmatter: the file must start with a "---" line');
  }
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trimEnd() === '---');
  if (closingIndex === -1) {
    throw new Error('unterminated frontmatter: no closing "---" line was found');
  }
  const data = parseYaml(lines.slice(1, closingIndex).join('\n'));
  const body = lines.slice(closingIndex + 1).join('\n');
  return { data, body };
}
