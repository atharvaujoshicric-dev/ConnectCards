-- =========================================================
-- 0013: Row Level Security — Leads, Analytics, Notifications,
-- Audit Log, Platform Tables, and Public-Safe RPCs
-- =========================================================

-- ---------------------------------------------------------
-- leads
-- ---------------------------------------------------------
alter table public.leads enable row level security;

create policy "profile owners view their own leads"
  on public.leads for select
  using (exists (select 1 from public.profiles p where p.id = leads.profile_id and p.user_id = auth.uid()));

create policy "org managers view department leads"
  on public.leads for select
  using (
    organization_id is not null
    and (
      public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[])
      or exists (
        select 1
        from public.employees e
        join public.profiles mp on mp.user_id = auth.uid()
        join public.employees me on me.profile_id = mp.id
        where e.profile_id = leads.profile_id
          and e.department_id = me.department_id
          and me.organization_id = leads.organization_id
      )
    )
  );

create policy "anyone can submit a lead to a published profile"
  on public.leads for insert
  with check (
    exists (select 1 from public.profiles p where p.id = leads.profile_id and p.is_published = true)
  );

create policy "profile owners update their leads (status/notes)"
  on public.leads for update
  using (exists (select 1 from public.profiles p where p.id = leads.profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = leads.profile_id and p.user_id = auth.uid()));

-- ---------------------------------------------------------
-- analytics_events / analytics_daily_rollups
-- Raw events are written only via a SECURITY DEFINER RPC so anonymous
-- visitors (who generate most events) never get a direct table grant.
-- ---------------------------------------------------------
alter table public.analytics_events enable row level security;
alter table public.analytics_daily_rollups enable row level security;

create policy "profile owners view their raw events"
  on public.analytics_events for select
  using (exists (select 1 from public.profiles p where p.id = analytics_events.profile_id and p.user_id = auth.uid()));

create policy "org admins view org raw events"
  on public.analytics_events for select
  using (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "profile owners view their rollups"
  on public.analytics_daily_rollups for select
  using (exists (select 1 from public.profiles p where p.id = analytics_daily_rollups.profile_id and p.user_id = auth.uid()));

create policy "org admins view org rollups"
  on public.analytics_daily_rollups for select
  using (organization_id is not null and public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------
-- themes, custom_domains, api_keys
-- ---------------------------------------------------------
alter table public.themes enable row level security;
alter table public.custom_domains enable row level security;
alter table public.api_keys enable row level security;

create policy "anyone can view active themes"
  on public.themes for select
  using (is_active = true);

create policy "org owners/admins manage custom domains"
  on public.custom_domains for all
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

create policy "org owners/admins manage api keys"
  on public.api_keys for all
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- ---------------------------------------------------------
-- notifications / notification_preferences
-- ---------------------------------------------------------
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

create policy "users view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "users mark their own notifications read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users manage their own notification preferences"
  on public.notification_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------
-- audit_log — insert-only for service role; readable by super admins.
-- No UPDATE or DELETE policy exists at all (immutability by omission).
-- ---------------------------------------------------------
alter table public.audit_log enable row level security;

create policy "super admins view audit log"
  on public.audit_log for select
  using (public.is_super_admin());

-- ---------------------------------------------------------
-- Public-safe RPCs (SECURITY DEFINER) for anonymous visitor actions
-- ---------------------------------------------------------

-- Look up a card by its activation token without exposing the cards table.
create or replace function public.get_card_by_token(p_activation_token text)
returns table (
  id uuid,
  status public.card_status,
  color public.card_color,
  bound_profile_slug text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    c.id,
    c.status,
    c.color,
    p.slug as bound_profile_slug
  from public.cards c
  left join public.profiles p on p.id = c.owner_profile_id
  where c.activation_token = p_activation_token;
$$;

revoke all on function public.get_card_by_token(text) from public;
grant execute on function public.get_card_by_token(text) to anon, authenticated;

-- Record an analytics event as an anonymous visitor.
create or replace function public.record_analytics_event(
  p_profile_id uuid,
  p_event_type public.analytics_event_type,
  p_source public.analytics_source,
  p_referrer text,
  p_device_type text,
  p_country text,
  p_city text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id from public.profiles where id = p_profile_id;

  insert into public.analytics_events (
    profile_id, organization_id, event_type, source, referrer, device_type, country, city
  ) values (
    p_profile_id, v_org_id, p_event_type, p_source, p_referrer, p_device_type, p_country, p_city
  );
end;
$$;

revoke all on function public.record_analytics_event(uuid, public.analytics_event_type, public.analytics_source, text, text, text, text) from public;
grant execute on function public.record_analytics_event(uuid, public.analytics_event_type, public.analytics_source, text, text, text, text) to anon, authenticated;

comment on function public.record_analytics_event is 'Rate-limited at the API layer (see lib/security/rate-limit.ts) in addition to this RPC to prevent event-flood abuse.';
