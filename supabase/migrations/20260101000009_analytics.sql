-- =========================================================
-- 0009: Analytics Events & Daily Rollups
-- =========================================================

create table public.analytics_events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  event_type public.analytics_event_type not null,
  source public.analytics_source not null default 'direct',
  referrer text,
  device_type text check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  country text,
  city text,
  occurred_at timestamptz not null default now()
) partition by range (occurred_at);

-- Default partition + first two months so inserts never fail before a
-- scheduled job creates the next month's partition.
create table public.analytics_events_default partition of public.analytics_events default;

create index idx_analytics_events_profile on public.analytics_events (profile_id, occurred_at desc);
create index idx_analytics_events_org on public.analytics_events (organization_id, occurred_at desc)
  where organization_id is not null;
create index idx_analytics_events_type on public.analytics_events (event_type, occurred_at desc);

create table public.analytics_daily_rollups (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  rollup_date date not null,
  profile_views int not null default 0,
  nfc_taps int not null default 0,
  qr_scans int not null default 0,
  vcf_downloads int not null default 0,
  leads_captured int not null default 0,
  top_source public.analytics_source,
  top_country text,
  created_at timestamptz not null default now(),
  unique (profile_id, rollup_date)
);

create index idx_rollups_profile_date on public.analytics_daily_rollups (profile_id, rollup_date desc);
create index idx_rollups_org_date on public.analytics_daily_rollups (organization_id, rollup_date desc)
  where organization_id is not null;

comment on table public.analytics_events is 'Append-only raw event log, range-partitioned by month for scale. Retained 90 days; rolled up nightly into analytics_daily_rollups.';
