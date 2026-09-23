-- =============================================================================
-- kphoto live statistics — database side (ADRs 0022–0025)
--
-- Target  : Supabase project "colorado" (ref wgtvebsxazxfapjtujce, us-east-2)
-- Apply   : Dashboard → SQL Editor → paste this whole file → Run.
-- Re-run  : Safe. Every statement is idempotent (create … if not exists,
--           create or replace, named cron jobs that upsert), so editing this
--           file and running it again is the whole migration story.
-- Remove  : docs/supabase/live-stats-teardown.sql
--
-- What it stores — and nothing else:
--   kphoto_stats.presence    one row per open, visible browser tab: a random
--                            UUID the tab generated in memory, the page path,
--                            and when it last checked in. Deleted within
--                            minutes of the tab going quiet.
--   kphoto_stats.page_views  a counter per (page path, UTC minute). Deleted
--                            after 25 hours.
-- No IP addresses, no user agents, no referrers, no cookies, no accounts.
--
-- The browser can only reach the four public.kp_* functions below. The tables
-- live in a schema the Data API does not expose, have row-level security on
-- with no policies, and have every privilege revoked from anon/authenticated.
--
-- Timing contract with src/client/liveStats.ts (keep in sync):
--   the client checks in every 30 s (HEARTBEAT_INTERVAL_MS) while visible;
--   a tab counts as "here now" for 90 s after its last check-in (3 missed
--   heartbeats), so a lost "leave" request self-corrects within 90 s.
-- =============================================================================

begin;

-- pg_cron is available on every Supabase plan, including Free.
create extension if not exists pg_cron;

-- -----------------------------------------------------------------------------
-- Private schema: not listed in the Data API's exposed schemas.
-- -----------------------------------------------------------------------------
create schema if not exists kphoto_stats;
revoke all on schema kphoto_stats from public;
revoke all on schema kphoto_stats from anon, authenticated;

-- UNLOGGED: no write-ahead log, so writes are cheap and nothing lingers in
-- WAL archives. The trade-off — contents are truncated after a crash — is a
-- feature here: this data is meant to be ephemeral (ADR 0024).
create unlogged table if not exists kphoto_stats.presence (
  viewer_id uuid primary key,
  path      text not null,
  last_seen timestamptz not null default now()
);
create index if not exists presence_last_seen_idx on kphoto_stats.presence (last_seen);

create unlogged table if not exists kphoto_stats.page_views (
  path   text not null,
  minute timestamptz not null,
  views  integer not null default 0 check (views >= 0),
  primary key (path, minute)
);
create index if not exists page_views_minute_idx on kphoto_stats.page_views (minute);

alter table kphoto_stats.presence enable row level security;
alter table kphoto_stats.page_views enable row level security;
revoke all on table kphoto_stats.presence from public, anon, authenticated;
revoke all on table kphoto_stats.page_views from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Internal helpers (not callable by the browser: anon has no schema usage).
-- -----------------------------------------------------------------------------

-- Same rule as isSafePath() in src/client/liveStats.ts: a site-absolute path
-- of URL-safe characters, at most 200 long, never protocol-relative.
create or replace function kphoto_stats.valid_path(p_path text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select p_path is not null
     and length(p_path) between 1 and 200
     and p_path ~ '^/[A-Za-z0-9._~/-]*$'
     and p_path !~ '^//'
$$;

-- A tab is "here now" if it checked in within the last 90 seconds.
create or replace function kphoto_stats.active_cutoff()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select now() - interval '90 seconds' $$;

-- First minute bucket of the rolling last hour (60 buckets incl. this one).
create or replace function kphoto_stats.hour_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select date_trunc('minute', now()) - interval '59 minutes' $$;

-- First minute bucket of the rolling last 24 hours (1440 buckets).
create or replace function kphoto_stats.day_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select date_trunc('minute', now()) - interval '1439 minutes' $$;

create or replace function kphoto_stats.site_totals()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'siteNow',
      (select count(*) from kphoto_stats.presence
        where last_seen > kphoto_stats.active_cutoff()),
    'siteViews1h',
      (select coalesce(sum(views), 0) from kphoto_stats.page_views
        where minute >= kphoto_stats.hour_start()),
    'siteViews24h',
      (select coalesce(sum(views), 0) from kphoto_stats.page_views
        where minute >= kphoto_stats.day_start())
  )
$$;

create or replace function kphoto_stats.page_summary(p_path text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select kphoto_stats.site_totals() || jsonb_build_object(
    'pageNow',
      (select count(*) from kphoto_stats.presence
        where path = p_path and last_seen > kphoto_stats.active_cutoff()),
    'pageViews24h',
      (select coalesce(sum(views), 0) from kphoto_stats.page_views
        where path = p_path and minute >= kphoto_stats.day_start())
  )
$$;

revoke all on all functions in schema kphoto_stats from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Public API — the only surface PostgREST exposes (POST/GET /rest/v1/rpc/…).
-- SECURITY DEFINER with an empty search_path: callers get exactly these
-- operations and nothing else, and every object reference is schema-qualified.
-- -----------------------------------------------------------------------------

-- Check in a visible tab; optionally count a page view; return the summary
-- for that page. Called by the site only from the production origin.
create or replace function public.kp_heartbeat(
  p_viewer uuid,
  p_path text,
  p_new_view boolean default false
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_minute timestamptz := date_trunc('minute', now());
begin
  if p_viewer is null or not kphoto_stats.valid_path(p_path) then
    raise exception using
      errcode = '22023',
      message = 'kphoto_stats: invalid viewer or path';
  end if;

  -- Fair-use guard: at most 10 000 tracked tabs at once. Existing tabs keep
  -- checking in; a flood of fabricated UUIDs cannot grow the table further.
  if exists (select 1 from kphoto_stats.presence where viewer_id = p_viewer)
     or (select count(*) from kphoto_stats.presence) < 10000 then
    insert into kphoto_stats.presence as pr (viewer_id, path, last_seen)
    values (p_viewer, p_path, now())
    on conflict (viewer_id) do update
      set path = excluded.path, last_seen = excluded.last_seen;
  end if;

  -- Fair-use guard: at most 500 distinct paths per minute bucket, which caps
  -- page_views at 720 000 rows (~70 MB) even under deliberate abuse.
  if coalesce(p_new_view, false) then
    if exists (select 1 from kphoto_stats.page_views
                where path = p_path and minute = v_minute)
       or (select count(*) from kphoto_stats.page_views
            where minute = v_minute) < 500 then
      insert into kphoto_stats.page_views as pv (path, minute, views)
      values (p_path, v_minute, 1)
      on conflict (path, minute) do update set views = pv.views + 1;
    end if;
  end if;

  return kphoto_stats.page_summary(p_path);
end;
$$;

-- A tab was hidden or closed: stop counting it as here now. Best-effort from
-- the browser side; the 90-second cutoff covers requests that never arrive.
create or replace function public.kp_leave(p_viewer uuid)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from kphoto_stats.presence where viewer_id = p_viewer
$$;

-- Read-only summary for one page (GET). Used on non-production origins, by
-- automated browsers and by visitors who send Global Privacy Control.
create or replace function public.kp_summary(p_path text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not kphoto_stats.valid_path(p_path) then
    raise exception using
      errcode = '22023',
      message = 'kphoto_stats: invalid path';
  end if;
  return kphoto_stats.page_summary(p_path);
end;
$$;

-- Read-only board for /live/ (GET): site totals plus the 25 busiest pages.
create or replace function public.kp_board()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with active as (
    select path, count(*) as viewers
    from kphoto_stats.presence
    where last_seen > kphoto_stats.active_cutoff()
    group by path
  ),
  recent as (
    select path,
           coalesce(sum(views) filter (where minute >= kphoto_stats.hour_start()), 0) as views_1h,
           sum(views) as views_24h
    from kphoto_stats.page_views
    where minute >= kphoto_stats.day_start()
    group by path
  ),
  ranked as (
    select path,
           coalesce(a.viewers, 0) as viewers,
           coalesce(r.views_1h, 0) as views_1h,
           coalesce(r.views_24h, 0) as views_24h
    from active a
    full join recent r using (path)
    order by viewers desc, views_1h desc, views_24h desc, path
    limit 25
  )
  select kphoto_stats.site_totals() || jsonb_build_object(
    'pages',
    coalesce(
      (select jsonb_agg(
                jsonb_build_object(
                  'path', path,
                  'now', viewers,
                  'views1h', views_1h,
                  'views24h', views_24h)
                order by viewers desc, views_1h desc, views_24h desc, path)
         from ranked),
      '[]'::jsonb)
  )
$$;

-- Supabase's default privileges grant EXECUTE on new public functions to
-- anon, authenticated and service_role. Narrow that to exactly anon.
revoke all on function public.kp_heartbeat(uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.kp_leave(uuid) from public, anon, authenticated;
revoke all on function public.kp_summary(text) from public, anon, authenticated;
revoke all on function public.kp_board() from public, anon, authenticated;
grant execute on function public.kp_heartbeat(uuid, text, boolean) to anon;
grant execute on function public.kp_leave(uuid) to anon;
grant execute on function public.kp_summary(text) to anon;
grant execute on function public.kp_board() to anon;

-- -----------------------------------------------------------------------------
-- Retention — the reason the free tier's 500 MB is never at risk.
-- cron.schedule(name, …) upserts by name, so re-running is safe.
-- -----------------------------------------------------------------------------
select cron.schedule(
  'kphoto-stats-prune-presence',
  '* * * * *',
  $job$delete from kphoto_stats.presence where last_seen < now() - interval '5 minutes'$job$
);
select cron.schedule(
  'kphoto-stats-prune-page-views',
  '*/10 * * * *',
  $job$delete from kphoto_stats.page_views where minute < now() - interval '25 hours'$job$
);
-- pg_cron records every run in cron.job_run_details and never cleans it up
-- on its own; a once-a-minute job would otherwise add ~1 440 rows a day
-- forever. Keep six hours of history for our jobs only.
select cron.schedule(
  'kphoto-stats-prune-cron-history',
  '23 * * * *',
  $job$delete from cron.job_run_details
        where end_time < now() - interval '6 hours'
          and jobid in (select jobid from cron.job where jobname like 'kphoto-stats-%')$job$
);

commit;

-- Ask PostgREST to pick up the new functions right away.
notify pgrst, 'reload schema';
