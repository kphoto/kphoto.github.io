# 26. Locale-prefixed URLs with an unprefixed default locale

Date: 2026-10-06

## Status

Accepted

## Context

The site gains more than one language. Existing URLs are linked from feeds,
search engines and other sites and must not change.

## Decision

- `siteConfig.locales` lists every built locale (code, endonym, `dir`);
  `siteConfig.defaultLocale` is `en`.
- The default locale keeps today's URLs. Every other locale mirrors the site
  under `/<code>/`: `/es/`, `/es/blog/…`, `/es/tags/…`, `/es/feed.xml`.
- One `/404.html` and one `/sitemap.xml` for the whole site.
- Every page sets `<html lang dir>` and, when it exists in more than one
  language, `<link rel="alternate" hreflang>` for each plus `x-default`. The
  sitemap repeats the alternates as `xhtml:link`.
- Each locale gets its own Atom feed with `xml:lang`.

## Consequences

Adding a locale never moves an existing URL. Removing one from `locales`
removes its tree and nothing else. Locale codes are lower-case BCP 47 so they
double as path segments.
