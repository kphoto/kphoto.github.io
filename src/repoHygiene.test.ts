import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));

const tracked = (): string[] => {
  try {
    return execFileSync('git', ['-c', 'safe.directory=*', '-C', root, 'ls-files'], {
      encoding: 'utf8',
    })
      .split('\n')
      .filter((file) => file !== '');
  } catch {
    return [];
  }
};

const EXEMPT = new Set(['export.sh']);

const RULES: readonly (readonly [RegExp, RegExp])[] = [
  [/\.(sh|ya?ml)$|^\.(gitignore|prettierignore|editorconfig)$/, /^\s*#(?!!)/],
  [/\.css$/, /\/\*/],
  [/\.sql$/, /^\s*--|\/\*/],
];

describe('repository hygiene (ADR 0033)', () => {
  const files = tracked().filter((file) => !file.startsWith('docs/llm/') && !EXEMPT.has(file));

  it.each(RULES.map(([pattern]) => [pattern.source]))('no comments in %s files', (source) => {
    const rule = RULES.find(([pattern]) => pattern.source === source);
    const offenders: string[] = [];
    for (const file of files) {
      const name = file.split('/').pop() ?? file;
      if (!rule || !(rule[0].test(file) || rule[0].test(name))) {
        continue;
      }
      readFileSync(`${root}${file}`, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (rule[1].test(line)) {
            offenders.push(`${file}:${String(index + 1)}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
