# 39. Scripts provision a pinned corepack; Node's bundled one is never used

Date: 2026-11-06

## Status

Accepted. Amends ADRs 0011, 0014, 0017 and 0019.

## Context

Node.js 25 and later no longer ship corepack. On 2026-11-01 Microsoft
republished `mcr.microsoft.com/playwright:v1.64.1-noble` under the same tag
with Node 26.13.0 (previously Node 24), and the `verify / e2e` job stopped
at its first step, `corepack enable`, with `corepack: not found` (exit 127).
The `checks` and `deploy` jobs still worked only because the runner image's
preinstalled Node happened to bundle corepack — the same failure waiting
for the runner image to move.

The image also ships classic Yarn 1 at `/usr/bin/yarn` (`npm install -g
yarn`). `scripts/lib.sh` skipped corepack whenever any `yarn` was on
`PATH`, so on such an image classic Yarn would have been picked instead of
the pinned Yarn 4.

Alternatives considered:

- `npm install -g corepack` — collides with the image's yarn shim
  (`EEXIST`), needs root on Fedora, and differs between machines.
- Committing `.yarn/releases/yarn-*.cjs` with `yarnPath` — a 3 MB generated
  blob in the repository and in every `docs/llm/dump.txt`.
- Pinning the image to its old Node 24 digest — moves backwards and only
  postpones the problem to the next Playwright release.

## Decision

- `scripts/lib.sh` pins `KPHOTO_COREPACK_VERSION` (0.36.0) and
  `ensure_node` calls `ensure_yarn`, which installs exactly that corepack
  with npm into `${XDG_CACHE_HOME:-~/.cache}/kphoto/corepack-<version>`,
  creates a `yarn` shim there with `corepack enable --install-directory`
  and puts that directory first on `PATH`. The pinned corepack then runs
  the Yarn named in `package.json#packageManager`.
- The install happens once per machine and corepack version; later runs
  only prepend `PATH`. No root, no global install, and any other `yarn`
  (classic, distro, global corepack) is shadowed.
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0` is exported by `lib.sh`, so no
  workflow or compose file needs it.
- Workflows and `compose.yaml` never mention corepack commands; they call
  scripts. `actions/setup-node` no longer caches yarn (it needs a yarn
  before the scripts run); an `actions/cache` step caches
  `~/.yarn/berry/cache`, `~/.cache/kphoto` and `~/.cache/node/corepack`
  instead. `compose.yaml` keeps the same directories in named volumes.
- `src/versionSync.test.ts` fails if a workflow, `compose.yaml` or
  `lib.sh` calls `corepack enable|prepare|install|use` directly, if a
  workflow uses setup-node's yarn cache, or if either pin is not exact.

## Consequences

The same function provides Yarn on Fedora, in the Playwright container and
on the Actions runner, regardless of Node version or what else is
installed. The first run on a machine needs the npm registry (it already
needed it for Yarn itself). Upgrading corepack is a one-line change in
`lib.sh`, kept current like any other pin.
