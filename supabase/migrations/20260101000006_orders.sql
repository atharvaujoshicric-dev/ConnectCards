-- =========================================================
-- 0006: Orders & Order Items
-- =========================================================

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  currency text not null default 'INR',
  max_redemptions int check (max_redemptions > 0),
  times_redeemed int not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint chk_percentage_bounds check (
    discount_type <> 'percentage' or (discount_value > 0 and discount_value <= 100)
  )
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete set null,
  order_type public.order_type not null,
  status public.order_status not null default 'pending_payment',
  currency text not null default 'INR',
  subtotal_amount numeric(10, 2) not null check (subtotal_amount >= 0),
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  tax_amount numeric(10, 2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  coupon_id uuid references public.coupons (id) on delete set null,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address_line1 text not null,
  shipping_address_line2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text not null,
  shipping_country text not null default 'IN',
  tracking_number text,
  tracking_carrier text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders (user_id);
create index idx_orders_org on public.orders (organization_id) where organization_id is not null;
create index idx_orders_status on public.orders (status);

create trigger set_updated_at
  before update on public.orders
  for each row execute procedure moddatetime(updated_at);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  card_color public.card_color not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index idx_order_items_order on public.order_items (order_id);

-- Link manufacturing_batches to orders now that orders exists.
alter table public.manufacturing_batches
  add constraint fk_manufacturing_batches_order
  foreign key (order_id) references public.orders (id) on delete set null;

comment on table public.orders is 'Hardware purchase orders. MOQ 20 pricing (INR 1300/unit vs INR 1500/unit) is computed and stored at order-creation time in order_items.unit_price.';
