# 29. Language preference: remember the choice, suggest, never redirect

Date: 2026-10-06

## Status

Accepted

## Context

Readers should land in their language without surprise redirects that break
links, caches, crawlers and the back button.

## Decision

- The header carries `<kp-language-switcher>`: plain links to this page's
  alternates (works without JavaScript), endonyms, `aria-current`.
- Choosing a language stores `locale` in the existing settings key
  `kphoto:settings:v1` (ADR 0013).
- When the stored choice — or, without one, the first matching
  `navigator.languages` entry — differs from the page language and this page
  exists in it, a hidden "Read this page in …" link, written in that
  language, is revealed. Logic is the pure `chooseSuggestion`.
- No automatic redirect, ever.

## Consequences

One extra optional field in localStorage. Readers keep full control; every
URL is stable and cacheable.
