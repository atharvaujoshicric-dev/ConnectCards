-- =========================================================
-- 0005: Manufacturing Batches & Cards
-- =========================================================

create table public.manufacturing_batches (
  id uuid primary key default gen_random_uuid(),
  order_id uuid, -- FK added in 0006 after orders table exists
  organization_id uuid references public.organizations (id) on delete set null,
  quantity int not null check (quantity > 0),
  color public.card_color not null,
  status text not null default 'queued' check (status in (
    'queued', 'in_production', 'quality_check', 'ready_to_ship', 'shipped'
  )),
  requested_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_manufacturing_batches_org on public.manufacturing_batches (organization_id)
  where organization_id is not null;

create trigger set_updated_at
  before update on public.manufacturing_batches
  for each row execute procedure moddatetime(updated_at);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.manufacturing_batches (id) on delete restrict,
  card_serial text not null unique,
  activation_token text not null unique,
  color public.card_color not null,
  status public.card_status not null default 'manufactured',
  owner_user_id uuid references auth.users (id) on delete set null,
  owner_profile_id uuid references public.profiles (id) on delete set null,
  assigned_employee_id uuid references public.employees (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  qr_code_url text,
  activated_at timestamptz,
  frozen_at timestamptz,
  frozen_reason text check (char_length(frozen_reason) <= 240),
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_cards_single_binding check (
    not (owner_user_id is not null and assigned_employee_id is not null)
  )
);

create index idx_cards_batch on public.cards (batch_id);
create index idx_cards_owner on public.cards (owner_user_id) where owner_user_id is not null;
create index idx_cards_employee on public.cards (assigned_employee_id) where assigned_employee_id is not null;
create index idx_cards_org on public.cards (organization_id) where organization_id is not null;
create index idx_cards_activation_token on public.cards (activation_token);
create index idx_cards_status on public.cards (status);

create trigger set_updated_at
  before update on public.cards
  for each row execute procedure moddatetime(updated_at);

comment on table public.cards is 'Physical NFC card records. activation_token is the single-use secret embedded in the NFC chip and QR code at manufacturing time.';
comment on column public.cards.activation_token is 'Cryptographically random token. Never regenerated after manufacturing; binding is enforced via activate_card() SECURITY DEFINER function only.';

-- ---------------------------------------------------------
-- Card activation function (SECURITY DEFINER, one-time bind)
-- ---------------------------------------------------------
create or replace function public.activate_card(
  p_activation_token text,
  p_user_id uuid
)
returns public.cards
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.cards;
  v_employee public.employees;
  v_user_email text;
begin
  select * into v_card from public.cards where activation_token = p_activation_token for update;

  if v_card.id is null then
    raise exception 'invalid_activation_token' using errcode = 'P0001';
  end if;

  if v_card.status = 'activated' then
    raise exception 'card_already_activated' using errcode = 'P0002';
  end if;

  if v_card.status not in ('shipped', 'ready_to_ship') then
    raise exception 'card_not_shippable_state' using errcode = 'P0003';
  end if;

  -- Org-assigned card: verify the activating user matches the invited employee email.
  if v_card.assigned_employee_id is not null then
    select * into v_employee from public.employees where id = v_card.assigned_employee_id;
    select email into v_user_email from auth.users where id = p_user_id;

    if v_employee.invited_email is distinct from v_user_email then
      raise exception 'employee_email_mismatch' using errcode = 'P0004';
    end if;

    update public.employees
      set status = 'active', activated_at = now()
      where id = v_card.assigned_employee_id;
  else
    update public.cards set owner_user_id = p_user_id where id = v_card.id;
  end if;

  update public.cards
    set status = 'activated', activated_at = now()
    where id = v_card.id
    returning * into v_card;

  return v_card;
end;
$$;

revoke all on function public.activate_card(text, uuid) from public;
grant execute on function public.activate_card(text, uuid) to authenticated;

-- ---------------------------------------------------------
-- Freeze card function (owner or org admin only, checked by RLS on caller side)
-- ---------------------------------------------------------
create or replace function public.freeze_card(p_card_id uuid, p_reason text)
returns public.cards
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.cards;
begin
  select * into v_card from public.cards where id = p_card_id for update;

  if v_card.id is null then
    raise exception 'card_not_found' using errcode = 'P0005';
  end if;

  if v_card.owner_user_id is distinct from auth.uid()
     and not exists (
       select 1 from public.org_members om
       where om.organization_id = v_card.organization_id
         and om.user_id = auth.uid()
         and om.role in ('owner', 'admin')
     ) then
    raise exception 'not_authorized' using errcode = 'P0006';
  end if;

  update public.cards
    set status = 'frozen', frozen_at = now(), frozen_reason = p_reason
    where id = p_card_id
    returning * into v_card;

  return v_card;
end;
$$;

revoke all on function public.freeze_card(uuid, text) from public;
grant execute on function public.freeze_card(uuid, text) to authenticated;
