# 31. TypeScript 7 is the only compiler; TypeScript 6 is a lint-only API facade

Date: 2026-10-06

## Status

Accepted. Supersedes [ADR 0006](0006-dual-typescript-toolchain.md).

## Context

TypeScript 7.0.2 ships the native compiler and no stable programmatic API.
typescript-eslint 8.71 still requires the classic API (peer
`typescript >=4.8.4 <6.1.0`) and resolves it as a peer of the project. A
root `typescript@7` therefore reaches the linter and crashes it, and Yarn
cannot override a peer edge. The TypeScript team publishes
`@typescript/typescript6` for exactly this side-by-side case; its binary is
`tsc6`, so it never shadows `tsc`. The stable API is planned for 7.1.

## Decision

- `typescript-native` = `npm:typescript@7.0.2` type-checks everything
  (`yarn typecheck`) and backs the editor (`js/ts.tsdk.path`, with the
  TypeScript native-preview extension and `js/ts.experimental.useTsgo`).
- `typescript` = `npm:@typescript/typescript6@6.0.2` exists only so
  typescript-eslint can `require('typescript')`. The `packageExtensions`
  block is gone.
- Scripts call each compiler by explicit path; `node_modules/.bin/tsc` is
  ambiguous and unused.
- ESLint was kept over oxlint/tsgolint because the standing instructions
  require typescript-eslint.

## Consequences

Every compile, type-check and editor diagnostic is TypeScript 7. When
typescript-eslint supports TypeScript 7.1's API, replace the
`typescript` alias with `typescript@7.1.x`, drop `typescript-native`, and
supersede this ADR.
