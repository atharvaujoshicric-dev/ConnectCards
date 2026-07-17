// app/org/new/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createOrganization } from '@/lib/services/organizations';
import { organizationBrandingSchema } from '@/lib/validation/profile';

export interface CreateOrgState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createOrganizationAction(
  _prevState: CreateOrgState,
  formData: FormData,
): Promise<CreateOrgState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/org/new');
  }

  const parsed = organizationBrandingSchema.pick({ name: true }).safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const organization = await createOrganization(supabase, user.id, parsed.data.name);
    redirect(`/dashboard/org?created=true&org=${organization.id}`);
  } catch (err) {
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) throw err;
    return {
      status: 'error',
      message: 'We could not create your organization. Please try again.',
    };
  }
}
