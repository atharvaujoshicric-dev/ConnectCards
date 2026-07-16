-- =========================================================
-- 0001: Extensions & Shared Enums
-- =========================================================

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;
create extension if not exists "moddatetime" with schema extensions;

-- ---------------------------------------------------------
-- Enums
-- ---------------------------------------------------------

create type public.plan_tier as enum ('free', 'pro', 'business', 'enterprise');

create type public.subscription_status as enum (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'paused'
);

create type public.card_color as enum ('gold', 'silver', 'rose_gold', 'black');

create type public.card_status as enum (
  'manufactured',
  'ready_to_ship',
  'shipped',
  'activated',
  'frozen',
  'revoked'
);

create type public.order_type as enum ('individual', 'organization');

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'in_production',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.payment_provider as enum ('razorpay', 'stripe');

create type public.org_role as enum ('owner', 'admin', 'manager', 'employee');

create type public.employee_status as enum (
  'invited',
  'active',
  'suspended',
  'offboarded'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost'
);

create type public.analytics_event_type as enum (
  'profile_view',
  'nfc_tap',
  'qr_scan',
  'vcf_download',
  'brochure_download',
  'link_click',
  'lead_submitted'
);

create type public.analytics_source as enum ('nfc', 'qr', 'link', 'share', 'direct');

create type public.notification_type as enum (
  'order_status_changed',
  'new_lead',
  'subscription_renewed',
  'subscription_payment_failed',
  'card_activated',
  'employee_invited',
  'seat_limit_reached',
  'card_frozen'
);

comment on type public.plan_tier is 'SaaS subscription tiers as defined in the Connect Cards blueprint.';
comment on type public.card_status is 'Physical card lifecycle: manufactured -> shipped -> activated, or frozen/revoked.';
