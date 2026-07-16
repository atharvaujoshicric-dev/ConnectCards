// lib/services/organizations.ts
// Business logic for organization management: creating an org, inviting
// employees, managing departments, and computing seat usage against the
// active subscription.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Organization, Employee, Department } from '@/types/database.types';
import { slugify } from '@/lib/utils';

export async function createOrganization(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  name: string,
): Promise<Organization> {
  const baseSlug = slugify(name);
  let slug = baseSlug;

  for (let attempt = 1; attempt <= 20; attempt++) {
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!existing) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug, plan: 'business', seat_count: 0 })
    .select()
    .single();

  if (orgError || !organization) {
    throw new Error(orgError?.message ?? 'failed_to_create_organization');
  }

  const { error: memberError } = await supabase.from('org_members').insert({
    organization_id: organization.id,
    user_id: ownerId,
    role: 'owner',
  });

  if (memberError) {
    await supabase.from('organizations').delete().eq('id', organization.id);
    throw new Error(memberError.message);
  }

  return organization;
}

export async function inviteEmployee(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  invitedByUserId: string,
  email: string,
  departmentId?: string,
): Promise<Employee> {
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('invited_email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    throw new Error('employee_already_invited');
  }

  const { data: employee, error } = await supabase
    .from('employees')
    .insert({
      organization_id: organizationId,
      department_id: departmentId ?? null,
      invited_email: email.toLowerCase(),
      invited_by: invitedByUserId,
      status: 'invited',
    })
    .select()
    .single();

  if (error || !employee) {
    throw new Error(error?.message ?? 'failed_to_invite_employee');
  }

  return employee;
}

export async function offboardEmployee(
  supabase: SupabaseClient<Database>,
  employeeId: string,
): Promise<void> {
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (!employee) throw new Error('employee_not_found');

  await supabase
    .from('employees')
    .update({ status: 'offboarded', offboarded_at: new Date().toISOString() })
    .eq('id', employeeId);

  // Freeze any card bound to this employee slot so it stops resolving to
  // a live profile the moment the person leaves.
  await supabase
    .from('cards')
    .update({ status: 'frozen', frozen_at: new Date().toISOString(), frozen_reason: 'employee_offboarded' })
    .eq('assigned_employee_id', employeeId)
    .eq('status', 'activated');
}

export async function createDepartment(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  name: string,
): Promise<Department> {
  const { data, error } = await supabase
    .from('departments')
    .insert({ organization_id: organizationId, name })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'failed_to_create_department');
  }

  return data;
}

export interface SeatUsage {
  seatsUsed: number;
  seatsAllowed: number;
  atCapacity: boolean;
}

export async function getSeatUsage(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<SeatUsage> {
  const [{ count: activeCount }, { data: subscription }] = await Promise.all([
    supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['invited', 'active']),
    supabase
      .from('subscriptions')
      .select('seats')
      .eq('organization_id', organizationId)
      .in('status', ['active', 'trialing'])
      .maybeSingle(),
  ]);

  const seatsUsed = activeCount ?? 0;
  const seatsAllowed = subscription?.seats ?? 0;

  return { seatsUsed, seatsAllowed, atCapacity: seatsAllowed > 0 && seatsUsed >= seatsAllowed };
}

export async function getOrganizationForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ organization: Organization; role: string } | null> {
  const { data } = await supabase
    .from('org_members')
    .select('role, organizations(*)')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data || !data.organizations) return null;

  return { organization: data.organizations as unknown as Organization, role: data.role };
}
