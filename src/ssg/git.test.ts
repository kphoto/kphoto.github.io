import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isCommitSha } from '../lib/buildInfo.ts';
import { nodeGitReader } from './git.ts';

describe('nodeGitReader', () => {
  it('returns nothing outside a repository instead of throwing', () => {
    const reader = nodeGitReader(mkdtempSync(path.join(tmpdir(), 'kphoto-git-')));
    expect(reader.headCommit()).toBeNull();
    expect(reader.isModified()).toBe(false);
  });

  it('reads the commit of a real checkout when there is one', () => {
    const head = nodeGitReader(process.cwd()).headCommit();
    expect(head === null || isCommitSha(head.trim())).toBe(true);
  });
});
