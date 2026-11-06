# 41. One Node version file for CI; the e2e job uses the image's Node

Date: 2026-11-06

## Status

Accepted. Amends ADR 0011.

## Context

The workflows hardcoded `node-version: 24` three times, and the e2e job
installed Node 24 with `actions/setup-node` inside an image that already
carries the Node it was built and tested with. Node 26 has been the active
LTS since October 2026, and the Playwright image now ships it.

## Decision

- `.node-version` holds the Node major for runner-hosted jobs (`26`).
  `checks` and `deploy` use `actions/setup-node` with
  `node-version-file: .node-version`; version managers such as fnm and nvm
  read the same file locally.
- The `e2e` job has no setup-node step and runs on the image's Node, the
  same Node the local container uses.
- `package.json#engines` stays `>=24` and `scripts/lib.sh` keeps that
  floor, so a host with Node 24 LTS still works.
- `src/versionSync.test.ts` fails if a workflow names a `node-version`
  directly, if setup-node is used without `.node-version`, or if
  `.node-version` falls below the engines floor.

## Consequences

Moving CI to a new Node LTS is one edit. The e2e Node follows the image
digest (ADR 0040), so it changes only when the image does. CI exercises
Node 26 while a developer may still run Node 24 on the host; both are
supported by the engines range.
