-- =============================================================================
-- kphoto live statistics — complete removal (ADR 0024)
--
-- Apply: Dashboard → SQL Editor → paste → Run. Safe to run more than once.
-- The site keeps working afterwards: the client treats the missing functions
-- as "unavailable" and hides the live figures (ADR 0022). To stop the site
-- from even trying, also empty `publishableKey` in src/lib/config.ts.
-- pg_cron itself is left installed in case anything else uses it.
-- =============================================================================

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
