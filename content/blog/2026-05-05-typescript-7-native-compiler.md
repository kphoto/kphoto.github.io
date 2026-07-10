---
title: Building on the TypeScript 7 native compiler
date: 2026-05-05
author: kphoto-team
summary: What actually changes when tsc is a native binary, and how this site's toolchain is wired around it.
tags:
  - typescript
  - tooling
series: TypeScript 7 in Practice
episode: 1
---

## The headline

TypeScript 7 ships `tsc` as a **native binary** — the Go port of the compiler,
now stable under the `typescript` package name. Type-checking this whole site
takes a blink.

## What that means in practice

The npm package no longer ships the classic JavaScript compiler API. The
package exposes a small launcher plus platform binaries, and a new
`typescript/unstable/*` API surface for tools:

```text
typescript/
  bin/tsc            → launches the native binary
  lib/version.cjs    → version metadata only
  dist/api/…         → the new (unstable) tool API
```

Tools that still need the classic API — like typescript-eslint — get a
side-by-side TypeScript 6 install, while `tsc` itself is the native compiler.
[Episode 2](/blog/2026-05-12-a-markdown-renderer-from-scratch/) starts using
that speed budget on something fun.

## The rules this site follows

1. `tsc --noEmit` is the gate — the native compiler checks every file
2. no deprecated compiler options, so future major versions cost nothing
3. `erasableSyntaxOnly` keeps the code in the type-stripping-friendly subset
