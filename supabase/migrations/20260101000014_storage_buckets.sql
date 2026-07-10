-- =========================================================
-- 0014: Storage Buckets & Storage RLS Policies
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('gallery', 'gallery', true, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('brochures', 'brochures', true, 10485760, array['application/pdf']),
  ('org-branding', 'org-branding', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('exports', 'exports', false, 20971520, array['text/csv', 'application/json'])
on conflict (id) do nothing;

-- ---------------------------------------------------------
-- avatars: path convention {user_id}/{filename}
-- ---------------------------------------------------------
create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------
-- gallery: path convention {profile_id}/{filename}, owner checked via profiles
-- ---------------------------------------------------------
create policy "gallery is publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "profile owners upload their gallery media"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery'
    and exists (
      select 1 from public.profiles p
      where p.id::text = (storage.foldername(name))[1] and p.user_id = auth.uid()
    )
  );

create policy "profile owners manage their gallery media"
  on storage.objects for update
  using (
    bucket_id = 'gallery'
    and exists (
      select 1 from public.profiles p
      where p.id::text = (storage.foldername(name))[1] and p.user_id = auth.uid()
    )
  );

create policy "profile owners delete their gallery media"
  on storage.objects for delete
  using (
    bucket_id = 'gallery'
    and exists (
      select 1 from public.profiles p
      where p.id::text = (storage.foldername(name))[1] and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- brochures: generated server-side only (service role); public read.
-- ---------------------------------------------------------
create policy "brochures are publicly readable"
  on storage.objects for select
  using (bucket_id = 'brochures');

-- No insert/update/delete policy: only the service role (Edge Function)
-- writes here, which bypasses RLS entirely.

-- ---------------------------------------------------------
-- org-branding: path convention {organization_id}/{filename}
-- ---------------------------------------------------------
create policy "org branding is publicly readable"
  on storage.objects for select
  using (bucket_id = 'org-branding');

create policy "org owners/admins upload branding assets"
  on storage.objects for insert
  with check (
    bucket_id = 'org-branding'
    and public.has_org_role((storage.foldername(name))[1]::uuid, array['owner', 'admin']::public.org_role[])
  );

create policy "org owners/admins manage branding assets"
  on storage.objects for update
  using (
    bucket_id = 'org-branding'
    and public.has_org_role((storage.foldername(name))[1]::uuid, array['owner', 'admin']::public.org_role[])
  );

create policy "org owners/admins delete branding assets"
  on storage.objects for delete
  using (
    bucket_id = 'org-branding'
    and public.has_org_role((storage.foldername(name))[1]::uuid, array['owner', 'admin']::public.org_role[])
  );

-- ---------------------------------------------------------
-- exports: private bucket, path convention {organization_id}/{filename},
-- accessed exclusively via short-TTL signed URLs generated server-side.
-- ---------------------------------------------------------
create policy "org owners/admins read their exports"
  on storage.objects for select
  using (
    bucket_id = 'exports'
    and public.has_org_role((storage.foldername(name))[1]::uuid, array['owner', 'admin']::public.org_role[])
  );

-- Writes to 'exports' happen only via service role (Edge Function).
