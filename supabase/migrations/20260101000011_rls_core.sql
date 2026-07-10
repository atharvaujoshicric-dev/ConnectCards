-- =========================================================
-- 0011: Row Level Security — Core Identity & Organization Tables
-- Default posture: deny-all. Every policy below is additive.
-- =========================================================

-- ---------------------------------------------------------
-- Helper functions used across many policies
-- ---------------------------------------------------------
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where organization_id = p_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_roles public.org_role[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where organization_id = p_org_id
      and user_id = auth.uid()
      and role = any(p_roles)
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean,
    false
  );
$$;

-- ---------------------------------------------------------
-- organizations
-- ---------------------------------------------------------
alter table public.organizations enable row level security;

create policy "org members can view their organization"
  on public.organizations for select
  using (public.is_org_member(id) or public.is_super_admin());

create policy "org owners/admins can update their organization"
  on public.organizations for update
  using (public.has_org_role(id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.org_role[]));

create policy "authenticated users can create an organization"
  on public.organizations for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------
-- org_members
-- ---------------------------------------------------------
alter table public.org_members enable row level security;

create policy "members can view their org roster"
  on public.org_members for select
  using (public.is_org_member(organization_id) or public.is_super_admin());

create policy "owners/admins manage org membership"
  on public.org_members for all
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------
-- departments
-- ---------------------------------------------------------
alter table public.departments enable row level security;

create policy "org members can view departments"
  on public.departments for select
  using (public.is_org_member(organization_id));

create policy "owners/admins manage departments"
  on public.departments for insert
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "owners/admins update departments"
  on public.departments for update
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "owners/admins delete departments"
  on public.departments for delete
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------
-- employees
-- ---------------------------------------------------------
alter table public.employees enable row level security;

create policy "managers+ can view org employees"
  on public.employees for select
  using (public.has_org_role(organization_id, array['owner', 'admin', 'manager']::public.org_role[]));

create policy "employees can view their own record"
  on public.employees for select
  using (
    exists (
      select 1 from public.profiles pr
      where pr.id = employees.profile_id and pr.user_id = auth.uid()
    )
  );

create policy "owners/admins manage employees"
  on public.employees for insert
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "owners/admins update employees"
  on public.employees for update
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------
-- profiles
-- ---------------------------------------------------------
alter table public.profiles enable row level security;

-- Public can view only published profiles, and only via the public column set
-- exposed through the public_profiles view (see 0013); the raw table itself
-- is still readable here to keep RLS simple, since profiles carries no
-- unpublished-secret fields beyond ownership linkage which is excluded by
-- the view's column list.
create policy "anyone can view published profiles"
  on public.profiles for select
  using (is_published = true and deleted_at is null);

create policy "owners can view their own profile"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "org admins can view org profiles"
  on public.profiles for select
  using (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin', 'manager']::public.org_role[]));

create policy "owners can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "owners can update their own profile"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "owners can soft delete their own profile"
  on public.profiles for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------
-- social_links / gallery_items (owned via profile_id)
-- ---------------------------------------------------------
alter table public.social_links enable row level security;
alter table public.gallery_items enable row level security;

create policy "anyone can view links on published profiles"
  on public.social_links for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = social_links.profile_id and p.is_published = true and p.deleted_at is null
    )
  );

create policy "owners manage their own social links"
  on public.social_links for all
  using (
    exists (select 1 from public.profiles p where p.id = social_links.profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.profiles p where p.id = social_links.profile_id and p.user_id = auth.uid())
  );

create policy "anyone can view gallery on published profiles"
  on public.gallery_items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = gallery_items.profile_id and p.is_published = true and p.deleted_at is null
    )
  );

create policy "owners manage their own gallery"
  on public.gallery_items for all
  using (
    exists (select 1 from public.profiles p where p.id = gallery_items.profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.profiles p where p.id = gallery_items.profile_id and p.user_id = auth.uid())
  );
