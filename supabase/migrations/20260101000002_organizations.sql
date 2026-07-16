-- =========================================================
-- 0002: Organizations, Departments, Org Members
-- =========================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  logo_url text,
  brand_primary_color text check (brand_primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  brand_secondary_color text check (brand_secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  default_theme_id uuid,
  plan public.plan_tier not null default 'business' check (plan in ('business', 'enterprise')),
  seat_count int not null default 0 check (seat_count >= 0),
  custom_domain text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_organizations_slug on public.organizations (slug) where deleted_at is null;
create index idx_organizations_custom_domain on public.organizations (custom_domain) where custom_domain is not null;

create trigger set_updated_at
  before update on public.organizations
  for each row execute procedure moddatetime(updated_at);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index idx_departments_org on public.departments (organization_id);

create trigger set_updated_at
  before update on public.departments
  for each row execute procedure moddatetime(updated_at);

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null default 'employee',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index idx_org_members_org on public.org_members (organization_id);
create index idx_org_members_user on public.org_members (user_id);

comment on table public.organizations is 'Tenant root for Business/Enterprise customers. All org-scoped tables key off organization_id.';
comment on table public.org_members is 'Maps a Supabase auth user to an organization with a role; drives RLS for every org-scoped table.';
