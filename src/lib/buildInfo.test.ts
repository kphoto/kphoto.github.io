import { describe, expect, it } from 'vitest';
import {
  commitUrl,
  isCommitSha,
  resolveBuildInfo,
  shortCommit,
  UNKNOWN_BUILD,
  type GitReader,
} from './buildInfo.ts';

const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);

const git = (head: string | null, modified = false): GitReader => ({
  headCommit: () => head,
  isModified: () => modified,
});

describe('resolveBuildInfo', () => {
  it('prefers the commit GitHub Actions is building', () => {
    expect(resolveBuildInfo({ GITHUB_SHA: SHA }, git(OTHER, true))).toEqual({
      commit: SHA,
      modified: false,
    });
  });

  it('normalizes case and whitespace', () => {
    expect(resolveBuildInfo({ GITHUB_SHA: ` ${SHA.toUpperCase()}\n` }, git(null)).commit).toBe(SHA);
  });

  it('falls back to the local checkout and reports local changes', () => {
    expect(resolveBuildInfo({}, git(`${OTHER}\n`, true))).toEqual({
      commit: OTHER,
      modified: true,
    });
    expect(resolveBuildInfo({ GITHUB_SHA: 'nope' }, git(OTHER))).toEqual({
      commit: OTHER,
      modified: false,
    });
  });

  it('is unknown without a usable commit anywhere', () => {
    expect(resolveBuildInfo({}, git(null))).toBe(UNKNOWN_BUILD);
    expect(resolveBuildInfo({}, git('HEAD'))).toBe(UNKNOWN_BUILD);
  });
});

describe('commit helpers', () => {
  it('validates, shortens and links commits', () => {
    expect(isCommitSha(SHA)).toBe(true);
    expect(isCommitSha('abc')).toBe(false);
    expect(isCommitSha(undefined)).toBe(false);
    expect(shortCommit(SHA)).toBe('aaaaaaa');
    expect(commitUrl('https://github.com/o/r', SHA)).toBe(`https://github.com/o/r/commit/${SHA}`);
  });
});
