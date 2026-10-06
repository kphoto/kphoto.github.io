# 27. Typed message catalogs with per-key fallback

Date: 2026-10-06

## Status

Accepted

## Context

Interface text (navigation, headings, footer, live statistics) must be
translatable without a runtime dependency and without blocking a new
language on a complete translation.

## Decision

- `src/i18n/messages/en.ts` is the source of truth; its keys are the
  `MessageKey` type. Other catalogs are `Partial<Catalog>`.
- A value is a string or a plural map (`one`, `other`, …) chosen with
  `Intl.PluralRules`. Placeholders are `{name}`; numbers and dates use `Intl`.
- A missing key falls back to the default locale. In HTML the fallback is
  wrapped in `<span lang="en">` so assistive technology pronounces it
  correctly.
- `Translator.html` escapes templates and text parameters; trusted markup
  enters only through `rawHtml()`.
- Client-side text (live statistics) is resolved at build time and shipped
  as a `data-messages` JSON attribute; the client formats it with the same
  pure `formatMessage`.
- Unit tests enforce: every catalog key exists in `en`, every translation
  keeps the same placeholders, and shipped catalogs are complete.

## Consequences

A new language can go live with a handful of keys. The compiler catches
misspelt keys; tests catch broken placeholders.
