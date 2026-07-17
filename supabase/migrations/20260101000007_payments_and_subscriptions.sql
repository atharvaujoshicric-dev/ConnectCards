-- =========================================================
-- 0007: Payment Events, Plans, Subscriptions
-- =========================================================

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_provider not null,
  provider_event_id text not null,
  event_type text not null,
  order_id uuid references public.orders (id) on delete set null,
  raw_payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index idx_payment_events_order on public.payment_events (order_id) where order_id is not null;

comment on table public.payment_events is 'Idempotent webhook event log. provider+provider_event_id uniqueness prevents double-processing.';

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  tier public.plan_tier not null unique,
  name text not null,
  monthly_price_inr numeric(10, 2) not null default 0,
  yearly_price_inr numeric(10, 2) not null default 0,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  feature_flags jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete restrict,
  provider public.payment_provider not null,
  provider_customer_id text not null,
  provider_subscription_id text not null,
  status public.subscription_status not null default 'trialing',
  seats int not null default 1 check (seats > 0),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id),
  constraint chk_subscription_owner_xor check (
    (user_id is not null and organization_id is null)
    or (user_id is null and organization_id is not null)
  )
);

create index idx_subscriptions_user on public.subscriptions (user_id) where user_id is not null;
create index idx_subscriptions_org on public.subscriptions (organization_id) where organization_id is not null;
create index idx_subscriptions_status on public.subscriptions (status);

create trigger set_updated_at
  before update on public.subscriptions
  for each row execute procedure moddatetime(updated_at);

-- ---------------------------------------------------------
-- Derived entitlements view — single source of truth for feature gating.
-- ---------------------------------------------------------
create or replace view public.entitlements as
select
  s.id as subscription_id,
  s.user_id,
  s.organization_id,
  p.tier,
  p.feature_flags,
  s.status,
  s.current_period_end,
  s.seats
from public.subscriptions s
join public.plans p on p.id = s.plan_id
where s.status in ('active', 'trialing', 'past_due');

comment on view public.entitlements is 'Single source of truth for feature gating. Application code should read this view, never scatter tier checks across the codebase.';

insert into public.plans (tier, name, monthly_price_inr, yearly_price_inr, feature_flags) values
  ('free', 'Free', 0, 0, '{"themes": 3, "gallery": false, "lead_forms": false, "advanced_analytics": false, "remove_branding": false}'::jsonb),
  ('pro', 'Pro', 499, 4999, '{"themes": "unlimited", "gallery": true, "lead_forms": true, "advanced_analytics": true, "remove_branding": true}'::jsonb),
  ('business', 'Business', 1499, 14999, '{"themes": "unlimited", "gallery": true, "lead_forms": true, "advanced_analytics": true, "remove_branding": true, "org_dashboard": true, "employee_cards": true, "crm_export": true}'::jsonb),
  ('enterprise', 'Enterprise', 4999, 49999, '{"themes": "unlimited", "gallery": true, "lead_forms": true, "advanced_analytics": true, "remove_branding": true, "org_dashboard": true, "employee_cards": true, "crm_export": true, "api_access": true, "white_label": true, "custom_domain": true, "sso": true}'::jsonb);
