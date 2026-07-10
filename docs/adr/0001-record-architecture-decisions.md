# 1. Record architecture decisions

Date: 2026-07-09

## Status

Accepted

## Context

This project exists to demonstrate what TypeScript 7 and the bare web
platform can do, which means it makes many deliberate, non-default choices.
Future readers (including the LLMs that help develop it) need the _why_, not
just the _what_.

## Decision

We record every architecturally significant decision as an ADR in
`docs/adr/`, one decision per file, numbered sequentially, in the style
described at <https://adr.github.io/> (Status / Context / Decision /
Consequences). ADRs are immutable history: a reversed decision gets a new ADR
that supersedes the old one.

## Consequences

Decisions are reviewable in pull requests alongside the code they justify.
The set of ADRs doubles as a guided tour of the codebase. Writing them is a
small tax on every significant change, paid deliberately.
