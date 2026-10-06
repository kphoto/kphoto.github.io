# 28. Translations are sibling files; untranslated content links to the original

Date: 2026-10-06

## Status

Accepted

## Context

Posts should not have to be written once per language, and a partially
translated site must still be complete and honest.

## Decision

- A translation is `content/blog/YYYY-MM-DD-name.<locale>.md` or
  `content/pages/name.<locale>.md` next to the original.
- A post translation may set only `title`, `summary` and the body. Date,
  author, tags, series and episode are inherited; scheduled publishing
  follows the original.
- An original may declare `lang: <locale>` when it is not written in the
  default language; its URL then lives under that locale.
- A locale tree renders only content that exists in that locale. Listings in
  every locale still show every post: untranslated cards carry `lang`,
  `hreflang` and an "In English" badge and link to the original.
- Translated posts state the source language and link to the original.
- Orphaned translations, translations into the original's language and
  unknown locales fail the build.

## Consequences

No duplicate untranslated pages, no machine-translated fallbacks, and tags
and series stay one taxonomy across languages. Tag and series names are not
translated yet.
