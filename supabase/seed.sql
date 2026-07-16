-- =========================================================
-- Seed Data — Local Development Only
-- Run via: npm run supabase:reset
-- =========================================================

-- Note: auth.users rows are normally created via Supabase Auth (Email OTP).
-- For local dev convenience, we insert a couple of test users directly.
-- These match the Inbucket test inbox at http://localhost:54324.

insert into auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role
) values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'founder@connectcards.app',
    crypt('devpassword123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"is_super_admin":true}'::jsonb,
    '{}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'jane.doe@example.com',
    crypt('devpassword123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'admin@acme-corp.com',
    crypt('devpassword123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
on conflict (id) do nothing;

-- Individual profile
insert into public.profiles (
  id, user_id, slug, full_name, job_title, company_name, bio,
  phone, email, is_published, plan, theme_id
) values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'jane-doe',
  'Jane Doe',
  'Principal Architect',
  'Doe Design Studio',
  'Award-winning architect specializing in sustainable residential design.',
  '+919876543210',
  'jane.doe@example.com',
  true,
  'pro',
  (select id from public.themes where slug = 'midnight-minimal')
)
on conflict (id) do nothing;

-- Organization + admin membership
insert into public.organizations (id, name, slug, plan, seat_count)
values (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'Acme Corp',
  'acme-corp',
  'business',
  25
)
on conflict (id) do nothing;

insert into public.org_members (organization_id, user_id, role)
values (
  'bbbbbbbb-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333333',
  'owner'
)
on conflict (organization_id, user_id) do nothing;

insert into public.departments (id, organization_id, name)
values (
  'cccccccc-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'Sales'
)
on conflict do nothing;

-- A manufacturing batch + a handful of test cards (mix of statuses)
insert into public.manufacturing_batches (id, organization_id, quantity, color, status)
values (
  'dddddddd-0000-0000-0000-000000000001',
  null,
  1,
  'black',
  'shipped'
)
on conflict (id) do nothing;

insert into public.cards (
  id, batch_id, card_serial, activation_token, color, status, owner_user_id, owner_profile_id, activated_at
) values (
  'eeeeeeee-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000001',
  'CC-000001',
  'dev-activation-token-jane',
  'black',
  'activated',
  '22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-0000-0000-0000-000000000001',
  now()
)
on conflict (id) do nothing;

insert into public.manufacturing_batches (id, organization_id, quantity, color, status)
values (
  'dddddddd-0000-0000-0000-000000000002',
  null,
  1,
  'gold',
  'shipped'
)
on conflict (id) do nothing;

insert into public.cards (
  id, batch_id, card_serial, activation_token, color, status
) values (
  'eeeeeeee-0000-0000-0000-000000000002',
  'dddddddd-0000-0000-0000-000000000002',
  'CC-000002',
  'dev-activation-token-unclaimed',
  'gold',
  'shipped'
)
on conflict (id) do nothing;

-- A couple of sample leads on Jane's profile
insert into public.leads (profile_id, full_name, email, phone, company, message, source, status)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Ravi Kumar',
    'ravi.kumar@example.com',
    '+919812345678',
    'Kumar Builders',
    'Interested in a consult for a hillside residence project.',
    'nfc',
    'new'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Priya Sharma',
    'priya.sharma@example.com',
    null,
    null,
    'Loved your portfolio, would like to discuss an interior redesign.',
    'qr',
    'contacted'
  );
