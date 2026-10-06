# 33. No comments in code

Date: 2026-10-06

## Status

Accepted

## Context

The maintainer requires that the repository contain no comments. Comments
drift from code; names, types, tests and docs do not.

## Decision

- No comments in TypeScript, CSS, shell, YAML, SQL or ignore files.
  Markdown is the only place for prose, kept terse.
- Enforced by a local ESLint rule `kphoto/no-comments` plus
  `noInlineConfig` (no `eslint-disable`), and by `src/repoHygiene.test.ts`
  for non-TypeScript files.
- `no-empty` allows empty `catch {}` blocks, the deliberate "ignore" idiom.
- `export.sh` is the maintainer's own tool and is exempt.

## Consequences

Rationale moves to ADRs and docs, where it was mostly already. A shebang is
the only `#` line left in a script.
