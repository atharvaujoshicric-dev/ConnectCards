-- =========================================================
-- 0010: Themes, Notifications, Audit Log, Custom Domains, API Keys
-- =========================================================

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  layout_variant text not null check (layout_variant in ('classic', 'minimal', 'bold', 'card_stack')),
  tokens jsonb not null,
  is_premium boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.themes is 'Theme definitions are data (color tokens, font pairing, layout variant), rendered through one shared profile-rendering component.';

alter table public.profiles
  add constraint fk_profiles_theme foreign key (theme_id) references public.themes (id) on delete set null;

alter table public.organizations
  add constraint fk_organizations_theme foreign key (default_theme_id) references public.themes (id) on delete set null;

insert into public.themes (name, slug, layout_variant, tokens, is_premium, sort_order) values
  ('Classic Light', 'classic-light', 'classic', '{"bg":"#FFFFFF","fg":"#111111","accent":"#111111","font":"inter"}'::jsonb, false, 1),
  ('Midnight Minimal', 'midnight-minimal', 'minimal', '{"bg":"#0A0A0B","fg":"#FAFAFA","accent":"#C9A24B","font":"inter"}'::jsonb, false, 2),
  ('Soft Slate', 'soft-slate', 'minimal', '{"bg":"#F4F5F7","fg":"#1A1A1D","accent":"#5B6EE1","font":"inter"}'::jsonb, false, 3),
  ('Bold Gradient', 'bold-gradient', 'bold', '{"bg":"linear-gradient(135deg,#6D28D9,#DB2777)","fg":"#FFFFFF","accent":"#FDE68A","font":"inter"}'::jsonb, true, 4),
  ('Card Stack Gold', 'card-stack-gold', 'card_stack', '{"bg":"#111111","fg":"#FFFFFF","accent":"#C9A24B","font":"inter"}'::jsonb, true, 5);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  type public.notification_type not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications (user_id, created_at desc);
create index idx_notifications_unread on public.notifications (user_id) where read_at is null;

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_new_lead boolean not null default true,
  email_order_updates boolean not null default true,
  email_billing boolean not null default true,
  email_product_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.notification_preferences
  for each row execute procedure moddatetime(updated_at);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_audit_log_actor on public.audit_log (actor_id, created_at desc);
create index idx_audit_log_target on public.audit_log (target_table, target_id);

comment on table public.audit_log is 'Immutable admin/system action trail. No UPDATE or DELETE policy exists — immutability by omission.';

create table public.custom_domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  domain text not null unique,
  verification_token text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  scopes text[] not null default array[]::text[],
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_api_keys_org on public.api_keys (organization_id) where revoked_at is null;

comment on table public.api_keys is 'Enterprise API access. key_hash stores a SHA-256 hash only; the raw key is shown once at creation time.';
