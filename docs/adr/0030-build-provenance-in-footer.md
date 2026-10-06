# 30. Build provenance: the commit in every footer

Date: 2026-10-06

## Status

Accepted

## Context

Readers and maintainers should see exactly which commit produced the
deployed site.

## Decision

- `resolveBuildInfo` (pure) prefers `GITHUB_SHA`, which Actions sets to the
  commit being built and deployed.
- Otherwise it asks git (`git -c safe.directory=* rev-parse HEAD`, which also
  works in the Playwright container, see ADR 0020) and flags uncommitted
  tracked changes.
- The footer shows the short SHA linked to the commit on GitHub, with
  "with local changes" for a dirty local build. Without git it shows nothing.
- `export.sh` is not involved.

## Consequences

Deployed pages are traceable to source. Every page changes on every commit,
which is acceptable for a static site.
