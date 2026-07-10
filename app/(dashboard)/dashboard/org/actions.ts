// app/(dashboard)/dashboard/org/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  inviteEmployee,
  offboardEmployee,
  createDepartment,
  getSeatUsage,
} from '@/lib/services/organizations';
import { organizationBrandingSchema } from '@/lib/validation/profile';

export interface OrgActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

async function requireOrgAdmin(organizationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('unauthorized');

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new Error('forbidden');
  }

  return { supabase, userId: user.id };
}

export async function updateBrandingAction(
  organizationId: string,
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const parsed = organizationBrandingSchema.safeParse({
    name: formData.get('name'),
    brandPrimaryColor: formData.get('brandPrimaryColor') || undefined,
    brandSecondaryColor: formData.get('brandSecondaryColor') || undefined,
  });

  if (!parsed.success) {
    return { status: 'error', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { supabase } = await requireOrgAdmin(organizationId);
    await supabase
      .from('organizations')
      .update({
        name: parsed.data.name,
        brand_primary_color: parsed.data.brandPrimaryColor ?? null,
        brand_secondary_color: parsed.data.brandSecondaryColor ?? null,
      })
      .eq('id', organizationId);

    revalidatePath('/dashboard/org');
    return { status: 'success', message: 'Branding updated.' };
  } catch {
    return { status: 'error', message: 'Could not update branding.' };
  }
}

export async function inviteEmployeeAction(
  organizationId: string,
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const departmentId = String(formData.get('departmentId') ?? '') || undefined;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { status: 'error', fieldErrors: { email: ['Enter a valid email address.'] } };
  }

  try {
    const { supabase, userId } = await requireOrgAdmin(organizationId);

    const seatUsage = await getSeatUsage(supabase, organizationId);
    if (seatUsage.atCapacity) {
      return {
        status: 'error',
        message: 'You have reached your seat limit. Upgrade seats in Billing to invite more employees.',
      };
    }

    await inviteEmployee(supabase, organizationId, userId, email, departmentId);
    revalidatePath('/dashboard/org/employees');
    return { status: 'success', message: `Invited ${email}.` };
  } catch (err) {
    const message =
      err instanceof Error && err.message === 'employee_already_invited'
        ? 'This email has already been invited.'
        : 'Could not send invite. Please try again.';
    return { status: 'error', message };
  }
}

export async function offboardEmployeeAction(employeeId: string, organizationId: string): Promise<void> {
  const { supabase } = await requireOrgAdmin(organizationId);
  await offboardEmployee(supabase, employeeId);
  revalidatePath('/dashboard/org/employees');
}

export async function createDepartmentAction(
  organizationId: string,
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    return { status: 'error', fieldErrors: { name: ['Department name is required.'] } };
  }

  try {
    const { supabase } = await requireOrgAdmin(organizationId);
    await createDepartment(supabase, organizationId, name);
    revalidatePath('/dashboard/org/employees');
    return { status: 'success', message: 'Department created.' };
  } catch {
    return { status: 'error', message: 'Could not create department.' };
  }
}
