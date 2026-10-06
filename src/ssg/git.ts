import { execFileSync } from 'node:child_process';
import type { GitReader } from '../lib/buildInfo.ts';

function git(rootDir: string, args: readonly string[]): string | null {
  try {
    return execFileSync('git', ['-c', 'safe.directory=*', '-C', rootDir, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

export function nodeGitReader(rootDir: string): GitReader {
  return {
    headCommit: () => git(rootDir, ['rev-parse', 'HEAD']),
    isModified: () =>
      (git(rootDir, ['status', '--porcelain', '--untracked-files=no']) ?? '') !== '',
  };
}
