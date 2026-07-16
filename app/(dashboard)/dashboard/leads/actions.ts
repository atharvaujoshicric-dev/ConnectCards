// app/(dashboard)/dashboard/leads/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { updateLeadStatus } from '@/lib/services/leads';
import type { LeadStatus } from '@/types/database.types';

export async function updateLeadStatusAction(leadId: string, status: LeadStatus): Promise<void> {
  const supabase = await createClient();
  await updateLeadStatus(supabase, leadId, status);
  revalidatePath('/dashboard/leads');
}

export async function updateLeadNotesAction(leadId: string, notes: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('leads').update({ notes }).eq('id', leadId);
  revalidatePath('/dashboard/leads');
}
