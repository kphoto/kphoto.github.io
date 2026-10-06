# 32. Explicit `.ts` import extensions and a TypeScript 7.1 preview gate

Date: 2026-10-06

## Status

Accepted

## Context

Vite warned on every build that extensionless imports block its native
config loader, the planned default. Node's type stripping needs explicit
extensions too. TypeScript 7.1 is in development and should not surprise us.

## Decision

- Every relative import names its `.ts` file; `tsconfig.json` uses
  `module: preserve` and `allowImportingTsExtensions` and states only
  non-default options (TypeScript 6/7 already default to `strict`,
  `target: es2025` and bundler resolution).
- `typescript-native-next` pins a 7.1 nightly that clears the 72-hour
  supply-chain gate; `scripts/typecheck-next.sh` runs it in `check.sh` and CI.
- The same `tsconfig.json` must type-check under 6.0 (lint), 7.0 and 7.1.

## Consequences

`vite build --configLoader native` works today. The 7.1 pin is bumped
deliberately and folds into the main compiler when 7.1 is stable.
