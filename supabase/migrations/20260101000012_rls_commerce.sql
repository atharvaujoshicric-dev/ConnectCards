-- =========================================================
-- 0012: Row Level Security — Cards, Orders, Payments, Subscriptions
-- =========================================================

-- ---------------------------------------------------------
-- manufacturing_batches
-- ---------------------------------------------------------
alter table public.manufacturing_batches enable row level security;

create policy "org admins view their batches"
  on public.manufacturing_batches for select
  using (
    (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
    or public.is_super_admin()
  );

create policy "super admin manages batches"
  on public.manufacturing_batches for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---------------------------------------------------------
-- cards
-- No direct client-side UPDATE for binding fields is ever permitted;
-- binding happens exclusively through activate_card()/freeze_card()
-- SECURITY DEFINER functions. These policies only cover SELECT.
-- ---------------------------------------------------------
alter table public.cards enable row level security;

create policy "owners view their own cards"
  on public.cards for select
  using (owner_user_id = auth.uid());

create policy "employees view their assigned card"
  on public.cards for select
  using (
    exists (
      select 1 from public.employees e
      join public.profiles p on p.id = e.profile_id
      where e.id = cards.assigned_employee_id and p.user_id = auth.uid()
    )
  );

create policy "org admins view org cards"
  on public.cards for select
  using (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "super admin full access to cards"
  on public.cards for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Public (unauthenticated) lookup by activation_token is handled via a
-- SECURITY DEFINER RPC (see get_card_by_token in 0013), never a raw
-- table policy, to avoid exposing the whole cards table to anon.

-- ---------------------------------------------------------
-- orders / order_items
-- ---------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;

create policy "users view their own orders"
  on public.orders for select
  using (user_id = auth.uid());

create policy "org admins view org orders"
  on public.orders for select
  using (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "users create their own orders"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "super admin manages all orders"
  on public.orders for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "users view items on their orders"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));

create policy "users insert items on their own pending orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
        and o.status = 'pending_payment'
    )
  );

create policy "active coupons are publicly readable"
  on public.coupons for select
  using (is_active = true);

-- ---------------------------------------------------------
-- payment_events — never client-accessible; Edge Functions use the
-- service role key and bypass RLS entirely by design.
-- ---------------------------------------------------------
alter table public.payment_events enable row level security;
-- Intentionally no policies: table is only ever touched via service role.

-- ---------------------------------------------------------
-- plans — public read, no client writes
-- ---------------------------------------------------------
alter table public.plans enable row level security;

create policy "anyone can view active plans"
  on public.plans for select
  using (is_active = true);

-- ---------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------
alter table public.subscriptions enable row level security;

create policy "users view their own subscription"
  on public.subscriptions for select
  using (user_id = auth.uid());

create policy "org admins view org subscription"
  on public.subscriptions for select
  using (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- Subscription writes happen exclusively via service-role Edge Function
-- webhook handlers (source of truth = provider), never client-side.
