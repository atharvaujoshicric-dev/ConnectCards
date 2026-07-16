-- =========================================================
-- 0004: Employees (org-issued card holders)
-- =========================================================

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  department_id uuid references public.departments (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  invited_email text not null check (invited_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status public.employee_status not null default 'invited',
  invited_by uuid references auth.users (id) on delete set null,
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  offboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invited_email)
);

create index idx_employees_org on public.employees (organization_id);
create index idx_employees_department on public.employees (department_id) where department_id is not null;
create index idx_employees_profile on public.employees (profile_id) where profile_id is not null;
create index idx_employees_status on public.employees (organization_id, status);

create trigger set_updated_at
  before update on public.employees
  for each row execute procedure moddatetime(updated_at);

comment on table public.employees is 'Org-issued card program membership. Distinct from profiles so a person can hold both a personal and an org profile.';
