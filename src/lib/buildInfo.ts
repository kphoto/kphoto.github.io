export interface BuildInfo {
  readonly commit: string | null;
  readonly modified: boolean;
}

export interface GitReader {
  headCommit(): string | null;
  isModified(): boolean;
}

export const UNKNOWN_BUILD: BuildInfo = { commit: null, modified: false };

const COMMIT_PATTERN = /^[0-9a-f]{40}$/;

export function isCommitSha(value: unknown): value is string {
  return typeof value === 'string' && COMMIT_PATTERN.test(value);
}

export function resolveBuildInfo(
  env: Readonly<Record<string, string | undefined>>,
  git: GitReader,
): BuildInfo {
  const fromEnv = env.GITHUB_SHA?.trim().toLowerCase();
  if (isCommitSha(fromEnv)) {
    return { commit: fromEnv, modified: false };
  }
  const head = git.headCommit()?.trim().toLowerCase();
  if (isCommitSha(head)) {
    return { commit: head, modified: git.isModified() };
  }
  return UNKNOWN_BUILD;
}

export function shortCommit(commit: string): string {
  return commit.slice(0, 7);
}

export function commitUrl(repoUrl: string, commit: string): string {
  return `${repoUrl}/commit/${commit}`;
}
