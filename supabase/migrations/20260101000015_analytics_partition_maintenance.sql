-- =========================================================
-- 0015: Analytics Partition Maintenance
-- Creates next month's partition ahead of time; scheduled monthly via
-- pg_cron (see supabase/functions/analytics-rollup for the companion
-- rollup job). Keeping this as a callable function (rather than only a
-- migration-time partition) means it can be invoked by a scheduled job
-- indefinitely without further migrations.
-- =========================================================

create extension if not exists pg_cron with schema extensions;

create or replace function public.ensure_next_month_analytics_partition()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start date := date_trunc('month', now() + interval '1 month');
  v_end date := date_trunc('month', now() + interval '2 months');
  v_partition_name text := 'analytics_events_' || to_char(v_start, 'YYYY_MM');
begin
  if not exists (
    select 1 from pg_class where relname = v_partition_name
  ) then
    execute format(
      'create table public.%I partition of public.analytics_events for values from (%L) to (%L);',
      v_partition_name, v_start, v_end
    );
  end if;
end;
$$;

select cron.schedule(
  'ensure-next-month-analytics-partition',
  '0 3 25 * *', -- 03:00 UTC on the 25th of every month
  $$select public.ensure_next_month_analytics_partition();$$
);

comment on function public.ensure_next_month_analytics_partition is 'Idempotently creates next month''s analytics_events partition. Scheduled monthly via pg_cron so raw event inserts never fail for lack of a partition.';
