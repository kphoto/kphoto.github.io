# 2. AGPL-3.0-or-later license and free-software dependency policy

Date: 2026-07-09

## Status

Accepted

## Context

The project is built in the open as a demonstration; its license should
guarantee that it and its derivatives stay open, including when served over a
network.

## Decision

The project is licensed **AGPL-3.0-or-later**. The `LICENSE` file contains
the verbatim license text as published by the FSF (fetched from the GitHub
Licenses API, not retyped). Every dependency must be free software under an
AGPL-compatible license (MIT, Apache-2.0, ISC, BSD and similar all qualify).
Since the site has zero runtime dependencies (ADR 0004), this policy applies
to development tooling.

## Consequences

Anyone deploying a modified version of the site must publish their changes.
Dependency additions require a license check; all current devDependencies
are MIT/Apache-2.0/ISC. The footer of every page and the README state the
license.
