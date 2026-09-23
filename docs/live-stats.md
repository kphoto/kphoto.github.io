# Live statistics runbook

Everything needed to switch live statistics on, check them, and remove them.
The why is in ADRs [0022](adr/0022-optional-live-statistics-backend.md) to
[0025](adr/0025-visibility-gated-polling-with-circuit-breaker.md). If any step
here goes wrong, the site is unaffected: the live figures simply don't appear.

## Switching it on (once)

1. **Create the schema.** In the Supabase dashboard for project _colorado_, open
   **SQL Editor**, paste all of
   [`docs/supabase/live-stats.sql`](supabase/live-stats.sql) and press **Run**.
   It is idempotent, so running it again after an edit is safe.
2. **Check the Data API is on.** Go to **Project Settings → Data API**. `public` must
   be among the exposed schemas (it is by default). Do _not_ add `kphoto_stats`.
3. **Copy the publishable key.** It is under **Project Settings → API Keys**, in the
   **Publishable key** row, and looks like `sb_publishable_…`. Never use a
   `sb_secret_…` key; `liveStatsEnabled()` refuses one anyway.
4. **Paste it** into `publishableKey` in `src/lib/config.ts`, then run
   `./check.sh` and push. The key is public by design: it can only call the four
   `kp_*` functions.

## Checking it from a terminal

```bash
KEY=sb_publishable_...   # the key from step 3
URL=https://wgtvebsxazxfapjtujce.supabase.co/rest/v1/rpc

curl -s "$URL/kp_board" -H "apikey: $KEY"
# → {"pages": [...], "siteNow": 0, "siteViews1h": 0, "siteViews24h": 0}

curl -s "$URL/kp_summary?p_path=%2F" -H "apikey: $KEY"
# → {"pageNow": 0, "siteNow": 0, ...}
```

A `404` with code `PGRST202` means the SQL has not been applied yet, or PostgREST has
not reloaded. Re-run the file; its last line asks PostgREST to reload. A `401` means
the key is wrong. Only real visits from `https://kphoto.github.io` write data. Local
dev, `vite preview`, the e2e suite and Global Privacy Control users only read.

To confirm the cleanup jobs run, use **Integrations → Cron**, or in SQL:

```sql
select j.jobname, d.status, d.start_time
from cron.job_run_details d join cron.job j using (jobid)
where j.jobname like 'kphoto-stats-%'
order by d.start_time desc limit 10;
```

## What it costs on the free tier

| Resource      | Use                                                               |
| ------------- | ----------------------------------------------------------------- |
| Database      | Kilobytes normally; at most ~70 MB under abuse (fair-use caps)    |
| Egress        | ~100-byte responses; two per visible tab per minute               |
| Realtime      | None: polling, not WebSockets                                     |
| Pausing       | Real visits are activity; a week with no readers pauses it (fine) |
| Quota reached | Supabase returns 402; the site trips its breaker and hides it     |

## If the project pauses or disappears

Nothing to do for the site. Each browser tries at most three times, then stays
quiet for ten minutes at a time. To bring the numbers back, restore the project in
the dashboard; browsers resume on their own. If the project is gone for good,
create a new one, re-run the SQL, and update `projectUrl` and `publishableKey`.

## Switching it off

Either clear `publishableKey` in `src/lib/config.ts` (no markup and no requests,
from the next deploy), or run
[`docs/supabase/live-stats-teardown.sql`](supabase/live-stats-teardown.sql) to
remove every table, function and cron job. Doing both is cleanest.
