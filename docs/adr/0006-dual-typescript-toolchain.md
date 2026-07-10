# 6. Dual TypeScript install: 7 (native) compiles, 6 (classic) serves the linter

Date: 2026-07-09

## Status

Accepted

## Context

TypeScript 7.0 ships `tsc` as the native (Go) compiler and **no longer ships
the classic JavaScript compiler API** — the npm package exposes the `tsc`
launcher plus a new `typescript/unstable/*` surface. typescript-eslint 8.63
(latest, and its canary) still requires the classic API: its peer range is
`typescript >=4.8.4 <6.1.0`, and importing it under TypeScript 7 crashes at
load (`Cannot read properties of undefined (reading 'Cjs')` from
ts-api-utils). Yarn `resolutions` and a packageExtensions _dependency_
override were both tried and failed to satisfy the peer edge cleanly.

## Decision

Install both, side by side, each under the name its consumer expects:

- Root `devDependencies` contains **no `typescript` entry**. Instead
  `"typescript-go": "npm:typescript@7.0.2"` aliases TypeScript 7; because
  only direct dependencies' bins are offered to `yarn run`, `yarn tsc` is the
  native 7.0 compiler. `scripts.typecheck` = `tsc --noEmit`.
- `.yarnrc.yml` `packageExtensions` add a **dependency** on
  `typescript: 6.0.3` (latest 6.x) to the six packages that need the classic
  API: `@typescript-eslint/{eslint-plugin,parser,project-service,type-utils,typescript-estree}`
  and `ts-api-utils`. The hoister places that copy at `node_modules/typescript`,
  which also gives VS Code a stable `tsdk` path (`node_modules/typescript/lib`).

Verified: `yarn tsc --version` → 7.0.2; typescript-estree resolves 6.0.3;
type-aware rules (e.g. `no-floating-promises`) fire.

## Consequences

Type-checking gets native-compiler speed while linting keeps full type-aware
rules. Two compilers can disagree at the margins; `tsc` (7.0) is the gate.
**Caveat:** `node_modules/.bin/tsc` physically symlinks to the hoisted 6.x
copy (transitive bins get linked); every yarn script resolves to 7.0, but
invoking `./node_modules/.bin/tsc` directly does not — always go through
`yarn tsc`. When typescript-eslint gains TypeScript 7 support, delete the
packageExtensions block and this becomes a one-package install (a future ADR
will supersede this one).
