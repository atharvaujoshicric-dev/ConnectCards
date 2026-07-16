-- =========================================================
-- 0003: Profiles (1:1 with auth.users, public-facing identity)
-- =========================================================

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 60),
  full_name text not null check (char_length(full_name) between 1 and 120),
  job_title text check (char_length(job_title) <= 120),
  company_name text check (char_length(company_name) <= 120),
  bio text check (char_length(bio) <= 1000),
  avatar_url text,
  phone text check (phone ~ '^\+?[1-9][0-9]{7,14}$'),
  email text check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  website_url text,
  whatsapp_number text check (whatsapp_number ~ '^\+?[1-9][0-9]{7,14}$'),
  map_address text,
  theme_id uuid,
  dark_mode_enabled boolean not null default false,
  is_published boolean not null default false,
  branding_removed boolean not null default false,
  plan public.plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_profiles_user on public.profiles (user_id);
create index idx_profiles_org on public.profiles (organization_id) where organization_id is not null;
create index idx_profiles_slug on public.profiles (slug) where deleted_at is null;
create index idx_profiles_published on public.profiles (is_published) where deleted_at is null;

create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure moddatetime(updated_at);

-- Social links (structured, one row per link, ordered)
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in (
    'linkedin', 'instagram', 'twitter', 'facebook', 'youtube',
    'tiktok', 'github', 'behance', 'dribbble', 'custom'
  )),
  label text check (char_length(label) <= 60),
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_social_links_profile on public.social_links (profile_id, sort_order);

-- Gallery / portfolio items (Pro+)
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text check (char_length(caption) <= 240),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_gallery_items_profile on public.gallery_items (profile_id, sort_order);

comment on table public.profiles is 'Public-facing identity data. One row per auth.users, optionally scoped to an organization for employee-issued profiles.';
comment on column public.profiles.organization_id is 'Set only for org-issued (Business/Enterprise) employee profiles; null for individual accounts.';
