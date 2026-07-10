# 9. Content model: date-stamped URLs, required tags, single optional series

Date: 2026-07-09

## Status

Accepted

## Context

The requirements fix several content rules: posts are markdown with YAML
frontmatter (`title`, `date`, `author`, `summary`, `tags` list); post URLs
must be unique per day while titles may repeat across days; a post may belong
to at most one series with an episode number; tag pages list newest first,
series pages list by episode. The implementation had to make those rules
precise and machine-checkable.

## Decision

The post **file name is the URL**: `content/blog/YYYY-MM-DD-name.md`
publishes at `/blog/YYYY-MM-DD-name/`. The date prefix makes same-day
collisions impossible to miss (two files cannot share a name) while leaving
titles free to repeat on other days. The frontmatter `date` must equal the
file-name date — one date, stated twice, checked once.

Validation is strict and total: dates must be real calendar dates (leap
years included), `tags` needs ≥ 1 entry, `series` and `episode` come as a
pair with `episode` an integer ≥ 1 unique within its series, series-name
spellings must match exactly across episodes, `author` must reference an
existing author file, and **unknown frontmatter keys are rejected** to catch
typos. All problems across all files are aggregated into one report
(`ContentValidationError`) instead of failing one file at a time.

Ordering is centralised in `src/lib/collections.ts`: post lists sort newest
first with slug as the same-day tie-break (deterministic builds), series
pages sort by episode ascending, tag/series/author indexes sort
alphabetically.

## Consequences

URLs are stable, sortable and self-describing; renaming a post changes its
URL (accepted for a personal blog — no redirect layer exists). Authors fix a
whole batch of content errors per build. The tie-break rule means two
same-day posts always render in the same order everywhere: pages, feed,
sitemap.
