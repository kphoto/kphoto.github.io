begin;

create extension if not exists pg_cron;

create schema if not exists kphoto_stats;
revoke all on schema kphoto_stats from public;
revoke all on schema kphoto_stats from anon, authenticated;

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

create or replace function kphoto_stats.active_cutoff()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select now() - interval '90 seconds' $$;

create or replace function kphoto_stats.hour_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select date_trunc('minute', now()) - interval '59 minutes' $$;

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

  if exists (select 1 from kphoto_stats.presence where viewer_id = p_viewer)
     or (select count(*) from kphoto_stats.presence) < 10000 then
    insert into kphoto_stats.presence as pr (viewer_id, path, last_seen)
    values (p_viewer, p_path, now())
    on conflict (viewer_id) do update
      set path = excluded.path, last_seen = excluded.last_seen;
  end if;

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

create or replace function public.kp_leave(p_viewer uuid)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from kphoto_stats.presence where viewer_id = p_viewer
$$;

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

revoke all on function public.kp_heartbeat(uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.kp_leave(uuid) from public, anon, authenticated;
revoke all on function public.kp_summary(text) from public, anon, authenticated;
revoke all on function public.kp_board() from public, anon, authenticated;
grant execute on function public.kp_heartbeat(uuid, text, boolean) to anon;
grant execute on function public.kp_leave(uuid) to anon;
grant execute on function public.kp_summary(text) to anon;
grant execute on function public.kp_board() to anon;

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
select cron.schedule(
  'kphoto-stats-prune-cron-history',
  '23 * * * *',
  $job$delete from cron.job_run_details
        where end_time < now() - interval '6 hours'
          and jobid in (select jobid from cron.job where jobname like 'kphoto-stats-%')$job$
);

commit;

notify pgrst, 'reload schema';
