# 40. The Playwright image is pinned by tag and digest

Date: 2026-11-06

## Status

Accepted. Amends ADR 0017.

## Context

`compose.yaml` and the CI `e2e` job named the image by tag only. Tags are
mutable: `v1.64.1-noble` was republished on 2026-11-01 with a different
Node major (ADR 0039). GitHub Actions pulled the new image
(`sha256:2f05f8a7…`); podman kept the copy it had pulled earlier
(`sha256:47b510dd…`, Node 24) because a tag that is present locally is not
pulled again. `./check.sh` passed locally while CI failed — the two were no
longer the same environment, which is the whole point of ADR 0017.

## Decision

Both files reference the image as
`mcr.microsoft.com/playwright:v<version>-noble@sha256:<digest>`. The tag
stays for readability and for the version check; the digest decides what
runs. Podman, Docker and Actions all resolve the digest and pull it if it is
missing, so a stale local tag can no longer be used.

`src/versionSync.test.ts` requires every reference to carry a digest,
requires the tag version to equal `@playwright/test`, and requires
`compose.yaml` and `verify.yml` to name the identical reference.

## Consequences

A republished tag changes nothing until someone updates the digest
deliberately, and then it changes locally and in CI in the same commit.
Upgrading Playwright now means bumping the dependency and both image
references to the new tag and its digest
(`podman pull mcr.microsoft.com/playwright:v<version>-noble` prints it).
Security rebuilds of the same tag are picked up only by such an update; the
image runs tests only, never the deployed site.
