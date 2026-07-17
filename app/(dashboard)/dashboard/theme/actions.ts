// app/(dashboard)/dashboard/theme/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlement, hasFeature, themeLimit } from '@/lib/entitlements';

export async function selectTheme(themeId: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'You must be logged in.' };

  const { data: theme } = await supabase.from('themes').select('*').eq('id', themeId).single();
  if (!theme) return { success: false, message: 'Theme not found.' };

  if (theme.is_premium) {
    const entitlement = await getUserEntitlement(supabase, user.id);
    const limit = themeLimit(entitlement);
    if (limit !== 'unlimited') {
      return { success: false, message: 'Upgrade to Pro to unlock this theme.' };
    }
  }

  await supabase.from('profiles').update({ theme_id: themeId }).eq('user_id', user.id);
  revalidatePath('/dashboard/theme');
  return { success: true };
}

export async function toggleDarkMode(enabled: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const entitlement = await getUserEntitlement(supabase, user.id);
  if (!hasFeature(entitlement, 'gallery')) return; // dark mode is a Pro+ feature

  await supabase.from('profiles').update({ dark_mode_enabled: enabled }).eq('user_id', user.id);
  revalidatePath('/dashboard/theme');
}

export async function toggleRemoveBranding(enabled: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const entitlement = await getUserEntitlement(supabase, user.id);
  if (!hasFeature(entitlement, 'remove_branding')) return;

  await supabase.from('profiles').update({ branding_removed: enabled }).eq('user_id', user.id);
  revalidatePath('/dashboard/theme');
}
