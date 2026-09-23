# 22. Optional live statistics from Supabase, strictly non-blocking

Date: 2026-09-23

## Status

Accepted. Amends ADR 0004 (the "own origin only" rule).

## Context

The site should show live readership — who is reading right now, what was read
today — which a static site cannot know on its own. A free Supabase project
("colorado", ref `wgtvebsxazxfapjtujce`, us-east-2) can hold the counters. But
a free project pauses after a week without traffic, can hit its quotas (Supabase
then answers every request with HTTP 402), and the account itself may lapse. None
of that is allowed to affect the site: kphoto.github.io must keep working exactly
as it does today, whatever state the backend is in.

## Decision

Live statistics are a **progressive enhancement with no failure mode visible to
readers**:

- **Off unless configured.** `siteConfig.liveStats` holds the project URL and the
  _publishable_ key. `liveStatsEnabled()` requires an https URL and a non-blank key
  (and refuses an `sb_secret_…` key pasted by mistake). When it is off, no live
  markup is rendered and no request is ever made. `/live/` still exists and says the
  feature is off, which keeps the sitemap and links stable.
- **Hidden until proven.** The footer's live line ships with `hidden` and is revealed
  only after a successful response. A backend that is down, slow, paused or deleted
  is therefore indistinguishable from the feature not existing. Timeouts, retries and
  back-off are specified in ADR 0025.
- **Plain `fetch` against PostgREST.** The browser calls four RPC functions
  (`kp_heartbeat`, `kp_leave`, `kp_summary`, `kp_board`) at
  `/rest/v1/rpc/…`. There is no `@supabase/supabase-js`, so `package.json` still has no
  `dependencies`. The key travels only in the `apikey` header: Supabase's new keys are
  not JWTs and are rejected in `Authorization: Bearer`. Requests send no cookies and no
  referrer.
- **The schema lives in this repository and is applied by hand.** It is applied by
  pasting `docs/supabase/live-stats.sql` into the Supabase SQL editor; there is no
  second repository and no Supabase CLI. The file is idempotent, so re-running it is the
  migration story; `live-stats-teardown.sql` removes everything. See ADR 0024.
- **One sanctioned exception to ADR 0004.** Pages may now make requests to exactly one
  foreign origin, the configured Supabase project, and only from the live-statistics
  code. The e2e test "pages load nothing from any other origin" enforces that nothing
  else ever does.

## Consequences

The feature costs nothing when absent and nothing when broken. The client grows from
0.77 kB to 3.70 kB gzipped, all in the one existing module. A lazily loaded chunk was
tried and rejected: Vite 8 still wraps dynamic imports in its preload helper even with
`modulePreload: false`, and the shared browser module was hoisted into the entry
anyway. The saving was about 1 kB, at the price of a second request and more moving
parts.

The numbers are for interest, not for decisions. Anyone can call the public functions
and inflate counts; the fair-use caps in ADR 0024 bound storage, not honesty.

Enabling the feature is a one-line commit (paste the publishable key). Disabling it is
the same line emptied, or the teardown script, or doing nothing at all and letting the
project pause.
