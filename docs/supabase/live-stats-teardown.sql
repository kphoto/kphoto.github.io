begin;

select cron.unschedule(jobname)
from cron.job
where jobname in (
  'kphoto-stats-prune-presence',
  'kphoto-stats-prune-page-views',
  'kphoto-stats-prune-cron-history'
);

drop function if exists public.kp_heartbeat(uuid, text, boolean);
drop function if exists public.kp_leave(uuid);
drop function if exists public.kp_summary(text);
drop function if exists public.kp_board();

drop schema if exists kphoto_stats cascade;

commit;

notify pgrst, 'reload schema';
