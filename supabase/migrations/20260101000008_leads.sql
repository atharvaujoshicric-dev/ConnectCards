-- =========================================================
-- 0008: Leads (CRM lead collection)
-- =========================================================

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  company text check (char_length(company) <= 120),
  message text check (char_length(message) <= 2000),
  custom_fields jsonb not null default '{}'::jsonb,
  source public.analytics_source not null default 'direct',
  status public.lead_status not null default 'new',
  contact_hash text generated always as (
    encode(digest(coalesce(lower(email), '') || coalesce(phone, ''), 'sha256'), 'hex')
  ) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_profile on public.leads (profile_id);
create index idx_leads_org on public.leads (organization_id) where organization_id is not null;
create index idx_leads_status on public.leads (profile_id, status);
create index idx_leads_contact_hash on public.leads (contact_hash);

create trigger set_updated_at
  before update on public.leads
  for each row execute procedure moddatetime(updated_at);

comment on column public.leads.contact_hash is 'SHA-256 of normalized email+phone, used for duplicate-lead detection without indexing raw PII twice.';
