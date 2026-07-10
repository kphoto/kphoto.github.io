# 13. One versioned localStorage key behind a validated settings store

Date: 2026-07-09

## Status

Accepted

## Context

The requirements say to use localStorage "to the max": on a static site it is
the only persistence there is. Today it holds the theme choice; the design
should absorb future settings without migrations scattered around the code,
and must survive hostile realities: private browsing (throwing storage),
corrupt JSON, and values written by older or newer versions of the site.

## Decision

All settings live in **one key**, `kphoto:settings:v1`, holding a JSON
object (currently `{ "theme": … }`). Access goes exclusively through
`SettingsStore` (`src/client/storage.ts`), which wraps a two-method
`KeyValueStore` interface so tests inject fakes and `main.ts` injects a
try/catch-wrapped `localStorage`. Reads validate structurally — parse,
type-check, narrow the `theme` value against the `THEMES` list — and fall
back to defaults on _any_ failure; writes serialise the whole settings
object. The version lives in the key name: a breaking schema change means a
`v2` key and explicit migration code, never in-place mutation.

The pre-paint script (ADR 0008) reads the same key with the same fallback
semantics, kept honest by a unit test that evaluates the generated script.

## Consequences

New settings are one field on the `Settings` type plus validation — no new
keys, no migration for additive changes. Unknown themes from the future
degrade to the default instead of breaking the page. Private-browsing users
get working theming for the session that silently forgets. The single-key
design makes "what does this site store?" answerable in one sentence — which
the About page does.
