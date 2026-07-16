// app/[slug]/actions.ts
'use server';

import { leadFormSubmissionSchema } from '@/lib/validation/profile';
import { submitLead } from '@/lib/services/leads';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { headers } from 'next/headers';

export interface LeadFormState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitLeadAction(
  profileId: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = leadFormSubmissionSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    company: formData.get('company') || undefined,
    message: formData.get('message') || undefined,
    source: formData.get('source') || 'direct',
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for') ?? 'unknown';

  const { success: withinLimit } = await rateLimit(
    `lead-form:${profileId}:${ip}`,
    RATE_LIMITS.LEAD_FORM_SUBMIT,
  );

  if (!withinLimit) {
    return {
      success: false,
      message: 'You are submitting too quickly. Please wait a moment and try again.',
    };
  }

  // Public lead submission uses the service-role client because the
  // visitor submitting the form is typically anonymous; the RLS policy
  // for leads.insert already scopes this to published profiles only, and
  // this server action independently re-validates that constraint inside
  // submitLead(), so this is not a broad privilege escalation.
  const supabase = createServiceRoleClient();

  try {
    await submitLead(supabase, profileId, parsed.data);
    return { success: true, message: 'Thanks! Your message has been sent.' };
  } catch (err) {
    console.error('Lead submission failed', err);
    return {
      success: false,
      message: 'Something went wrong sending your message. Please try again.',
    };
  }
}
