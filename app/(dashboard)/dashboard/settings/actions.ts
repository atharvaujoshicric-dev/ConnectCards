// app/(dashboard)/dashboard/settings/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface SettingsActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

export async function updateNotificationPreferencesAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: 'error', message: 'You must be logged in.' };

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: user.id,
    email_new_lead: formData.get('email_new_lead') === 'on',
    email_order_updates: formData.get('email_order_updates') === 'on',
    email_billing: formData.get('email_billing') === 'on',
    email_product_updates: formData.get('email_product_updates') === 'on',
  });

  if (error) {
    return { status: 'error', message: 'Could not save preferences.' };
  }

  revalidatePath('/dashboard/settings');
  return { status: 'success', message: 'Preferences saved.' };
}

export async function deleteAccountAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Soft-delete the profile (preserves billing/analytics history per the
  // blueprint's data-retention principle) and sign the user out. Full
  // account erasure requests are handled by support per the privacy policy.
  await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq('user_id', user.id);

  await supabase.auth.signOut();
  redirect('/');
}
