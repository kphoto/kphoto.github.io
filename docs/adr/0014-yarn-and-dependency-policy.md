# 14. Yarn 4 via corepack, exact pins, and the minimal-age quarantine

Date: 2026-07-09

## Status

Accepted

## Context

The requirements ask for the latest yarn and the latest versions of
everything, kept current. Supply-chain attacks on npm typically exploit the
window right after a malicious version is published; a short waiting period
defeats most of them at near-zero cost.

## Decision

- **Yarn 4** (currently 4.17.1) is pinned in `package.json#packageManager`
  and provided by **corepack**, so contributors and CI get the identical
  package manager with no global install.
- Every dependency is **exact-pinned** (no `^`/`~`); `yarn.lock` is
  committed; installs everywhere use `--immutable`. Updating is a deliberate
  act (`yarn up`), reviewed like any change.
- `.yarnrc.yml` sets `npmMinimalAgeGate: 4320` (3 days): yarn refuses
  versions published more recently than that. "Latest" therefore means
  _latest that has been public for 72 hours_. At the time of writing that
  holds vite at **8.1.3** (8.1.4 was hours old) and prettier at **3.9.4**
  (3.9.5 likewise); both will be picked up by the next routine `yarn up`.
- `.yarnrc.yml` also carries the `packageExtensions` block from ADR 0006 —
  policy and mechanism live in one file.

## Consequences

Builds are reproducible byte-for-byte from the lockfile. The quarantine
means the repository is occasionally one patch release behind the absolute
newest, by design; the README's "always latest" promise is formally "latest
past the gate". Corepack needs enabling once per machine
(`sudo corepack enable`), which `scripts/bootstrap.sh` checks and explains.
