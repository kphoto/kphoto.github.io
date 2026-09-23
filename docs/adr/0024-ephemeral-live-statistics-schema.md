# 24. Ephemeral live-statistics schema sized for the Supabase free tier

Date: 2026-09-23

## Status

Accepted

## Context

The free tier gives 500 MB of database, 5 GB of egress a month, and pauses projects
after a week without activity. The requirement is real-time data only, not an archive.
The schema also has to be safe to expose to an anonymous, unauthenticated API.

## Decision

`docs/supabase/live-stats.sql` (idempotent; verified on PostgreSQL 16 with pg_cron and
against PostgREST 14.18 before commit) creates:

- **A private schema, `kphoto_stats`,** which is not in the Data API's exposed schemas.
  It has every privilege revoked from `public`, `anon` and `authenticated`, and RLS
  enabled with no policies as defence in depth.
- **Two `UNLOGGED` tables.** Being unlogged means no WAL: writes are cheap and nothing
  lingers in archives. A crash truncating them is acceptable for data this ephemeral.
  - `presence (viewer_id uuid pk, path, last_seen)` has one row per visible tab and is
    counted as "here now" while `last_seen` is within 90 s.
  - `page_views (path, minute, views)` holds per-minute counters. The rolling windows are
    exactly the last 60 and 1440 minute buckets.
- **Four `SECURITY DEFINER` functions in `public` with `search_path = ''`** and every
  reference schema-qualified. They are the only surface, and `EXECUTE` is granted to
  `anon` alone (Supabase's default privileges would otherwise also grant `authenticated`).
  - `kp_heartbeat` is `VOLATILE`, called with POST.
  - `kp_leave` is `VOLATILE`, called with POST.
  - `kp_summary` is `STABLE`, called with GET; PostgREST refuses writes over GET with 405.
  - `kp_board` is `STABLE`, called with GET.

  Invalid input raises SQLSTATE 22023, which PostgREST maps to HTTP 400.

- **Fair-use caps.** There are at most 10 000 tracked tabs, and at most 500 distinct
  paths per minute bucket. The second cap bounds `page_views` at 720 000 rows (about
  70 MB) even under deliberate abuse with fabricated paths.
- **Retention by pg_cron,** via three named jobs that upsert on re-run:
  - presence rows older than 5 minutes are deleted every minute;
  - counters older than 25 hours are deleted every 10 minutes;
  - `cron.job_run_details` is pruned hourly, for these jobs only. pg_cron never trims its
    run log on its own, and a once-a-minute job would otherwise add about 1 440 rows a day
    forever.

## Consequences

Normal use needs kilobytes; the worst case stays an order of magnitude inside the 500 MB
limit. Responses are about 100 bytes, so egress is negligible. The read functions filter by
time themselves, so the numbers stay correct even if pg_cron stops. Only storage depends on
the jobs.

Real visitors' requests are the activity that keeps the project from pausing. A week
without readers lets it pause, which ADR 0022 already treats as a non-event. No keep-alive
ping was added.

Schema changes are made by editing the file and re-running it in the SQL editor. Drops and
renames need a matching line in the teardown script.
