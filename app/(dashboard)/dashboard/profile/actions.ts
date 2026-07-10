// app/(dashboard)/dashboard/profile/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  profileBasicInfoSchema,
  profileContactExtrasSchema,
  socialLinkSchema,
} from '@/lib/validation/profile';
import { getUserEntitlement, hasFeature } from '@/lib/entitlements';

export interface ProfileFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

async function getOwnProfileOrThrow(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) throw new Error('profile_not_found');
  return profile;
}

export async function updateBasicInfo(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'You must be logged in.' };

  const parsed = profileBasicInfoSchema.safeParse({
    fullName: formData.get('fullName'),
    jobTitle: formData.get('jobTitle') || undefined,
    companyName: formData.get('companyName') || undefined,
    bio: formData.get('bio') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      job_title: parsed.data.jobTitle || null,
      company_name: parsed.data.companyName || null,
      bio: parsed.data.bio || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    })
    .eq('user_id', user.id);

  if (error) {
    return { status: 'error', message: 'Could not save changes. Please try again.' };
  }

  revalidatePath('/dashboard/profile');
  return { status: 'success', message: 'Profile updated.' };
}

export async function updateContactExtras(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'You must be logged in.' };

  const entitlement = await getUserEntitlement(supabase, user.id);
  if (!hasFeature(entitlement, 'gallery')) {
    // gallery flag doubles as the general "Pro extras unlocked" flag in
    // the seeded plan data — website/whatsapp/maps are Pro+ features.
    return {
      status: 'error',
      message: 'Upgrade to Pro to add a website, WhatsApp number, or map location.',
    };
  }

  const parsed = profileContactExtrasSchema.safeParse({
    websiteUrl: formData.get('websiteUrl') || undefined,
    whatsappNumber: formData.get('whatsappNumber') || undefined,
    mapAddress: formData.get('mapAddress') || undefined,
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      website_url: parsed.data.websiteUrl || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      map_address: parsed.data.mapAddress || null,
    })
    .eq('user_id', user.id);

  if (error) {
    return { status: 'error', message: 'Could not save changes. Please try again.' };
  }

  revalidatePath('/dashboard/profile');
  return { status: 'success', message: 'Contact details updated.' };
}

export async function addSocialLink(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'You must be logged in.' };

  const parsed = socialLinkSchema.safeParse({
    platform: formData.get('platform'),
    label: formData.get('label') || undefined,
    url: formData.get('url'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please enter a valid link.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const profile = await getOwnProfileOrThrow(user.id);

  const { data: existingLinks } = await supabase
    .from('social_links')
    .select('id')
    .eq('profile_id', profile.id);

  const { error } = await supabase.from('social_links').insert({
    profile_id: profile.id,
    platform: parsed.data.platform,
    label: parsed.data.label || null,
    url: parsed.data.url,
    sort_order: existingLinks?.length ?? 0,
  });

  if (error) {
    return { status: 'error', message: 'Could not add link. Please try again.' };
  }

  revalidatePath('/dashboard/profile');
  return { status: 'success', message: 'Link added.' };
}

export async function removeSocialLink(linkId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('social_links').delete().eq('id', linkId);
  revalidatePath('/dashboard/profile');
}

export async function togglePublished(isPublished: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update({ is_published: isPublished }).eq('user_id', user.id);
  revalidatePath('/dashboard/profile');
}
