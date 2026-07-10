// app/onboarding/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  profileBasicInfoSchema,
  profileSlugSchema,
} from '@/lib/validation/profile';
import { slugify } from '@/lib/utils';

export interface OnboardingState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const ONBOARDING_INITIAL_STATE: OnboardingState = { status: 'idle' };

export async function checkSlugAvailability(rawSlug: string): Promise<{ available: boolean; suggestion?: string }> {
  const supabase = await createClient();
  const slug = slugify(rawSlug);

  const { data } = await supabase.from('profiles').select('id').eq('slug', slug).maybeSingle();

  if (!data) return { available: true };

  // Suggest a numeric suffix if the preferred slug is taken.
  for (let i = 2; i <= 20; i++) {
    const candidate = `${slug}-${i}`;
    const { data: taken } = await supabase.from('profiles').select('id').eq('slug', candidate).maybeSingle();
    if (!taken) return { available: false, suggestion: candidate };
  }

  return { available: false };
}

export async function completeOnboarding(
  cardId: string | undefined,
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const themeId = String(formData.get('themeId') ?? '');
  const rawSlug = String(formData.get('slug') ?? '');
  const slugParsed = profileSlugSchema.safeParse(slugify(rawSlug));

  const basicInfoParsed = profileBasicInfoSchema.safeParse({
    fullName: formData.get('fullName'),
    jobTitle: formData.get('jobTitle') || undefined,
    companyName: formData.get('companyName') || undefined,
    bio: formData.get('bio') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  });

  if (!slugParsed.success || !basicInfoParsed.success) {
    return {
      status: 'error',
      fieldErrors: {
        ...(slugParsed.success ? {} : { slug: slugParsed.error.flatten().formErrors }),
        ...(basicInfoParsed.success ? {} : basicInfoParsed.error.flatten().fieldErrors),
      },
    };
  }

  const { data: existingSlug } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', slugParsed.data)
    .maybeSingle();

  if (existingSlug) {
    return {
      status: 'error',
      fieldErrors: { slug: ['This link is already taken. Try another.'] },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      slug: slugParsed.data,
      full_name: basicInfoParsed.data.fullName,
      job_title: basicInfoParsed.data.jobTitle || null,
      company_name: basicInfoParsed.data.companyName || null,
      bio: basicInfoParsed.data.bio || null,
      phone: basicInfoParsed.data.phone || null,
      email: basicInfoParsed.data.email || user.email || null,
      theme_id: themeId || null,
      is_published: true,
    })
    .select()
    .single();

  if (profileError || !profile) {
    return {
      status: 'error',
      message: 'We could not create your profile. Please try again.',
    };
  }

  if (cardId) {
    await supabase.from('cards').update({ owner_profile_id: profile.id }).eq('id', cardId);
  }

  redirect('/dashboard?onboarded=true');
}
