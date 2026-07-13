# 21. Scheduled publishing: dated posts go live on their date

Date: 2026-07-13

## Status

Accepted

## Context

Twenty "Photography Fundamentals" episodes landed at once, dated one per day
into the future. The build published all of them immediately: the home page's
"latest posts" jumped nineteen days ahead, the Atom feed announced entries
"from the future", and the site contradicted its own dates. (It also broke an
e2e test that assumed a specific post sat on the home page — a test defect
fixed separately under ADR 0010's amendment.) A static site has no server
clock at request time, so "publish on the date" has to be a property of the
build.

## Decision

A post is **published** when its date has arrived in the site's time zone,
and unpublished posts are absent from the built site entirely:

- `SiteConfig` gains `timeZone` (`America/New_York`). The new pure helper
  `isoDateInTimeZone(instant, timeZone)` (in `src/lib/dates.ts`, built on
  `Intl.DateTimeFormat`) maps an injected clock reading to the calendar date
  that decides publication — no hand-rolled offset arithmetic, no DST bugs.
- `loadSiteModel(input, publishedThrough?)` takes the cutoff date. Validation
  still runs over **every** post first (a broken or episode-conflicting
  future post fails today's build, when it is cheapest to fix); the filter
  applies after validation, before any collection is derived. Because tags,
  series, author groupings, the feed and the sitemap are all built from the
  filtered list, nothing anywhere links to an unpublished URL — a series
  reads "Part 1 of 1" until episode 2 exists publicly.
- The Vite plugin (the only impure shell) reads the clock once per render and
  passes the cutoff down. The dev server renders per request, so a scheduled
  post flips live at midnight without a restart. Setting
  `KPHOTO_SHOW_FUTURE=1` omits the cutoff for previewing scheduled posts
  locally.
- `deploy.yml` gains `schedule: cron '10 5 * * *'` — a daily rebuild at
  05:10 UTC (00:10 EST / 01:10 EDT), which is the mechanism that actually
  flips each episode live on GitHub Pages.

## Consequences

Writing ahead now works the way the daily-dated URL scheme always implied:
commit twenty episodes, and they appear one per day. The published site can
lag a scheduled date by up to ~70 minutes past midnight Eastern (cron
granularity), which is acceptable for a blog. GitHub disables cron schedules
on repositories with no activity for 60 days; any push re-enables it, and
`workflow_dispatch` can force a publish at any moment. Omitting the cutoff
(the two-argument call with `undefined`) is reserved for previews and tests;
the production path always passes today's date.
