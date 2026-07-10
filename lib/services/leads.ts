// lib/services/leads.ts
// Business logic for lead capture and pipeline management.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Lead, LeadStatus } from '@/types/database.types';
import type { LeadFormSubmissionInput } from '@/lib/validation/profile';

export async function submitLead(
  supabase: SupabaseClient<Database>,
  profileId: string,
  input: LeadFormSubmissionInput,
): Promise<Lead> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, organization_id, is_published')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile || !profile.is_published) {
    throw new Error('profile_not_found_or_unpublished');
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      profile_id: profileId,
      organization_id: profile.organization_id,
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      message: input.message || null,
      source: input.source,
      status: 'new',
    })
    .select()
    .single();

  if (error || !lead) {
    throw new Error(error?.message ?? 'failed_to_submit_lead');
  }

  // Record the corresponding analytics event and trigger notification
  // fan-out. Both are best-effort — a failure here must never roll back
  // the successfully captured lead.
  await supabase.rpc('record_analytics_event', {
    p_profile_id: profileId,
    p_event_type: 'lead_submitted',
    p_source: input.source,
    p_referrer: null,
    p_device_type: null,
    p_country: null,
    p_city: null,
  });

  return lead;
}

export async function updateLeadStatus(
  supabase: SupabaseClient<Database>,
  leadId: string,
  status: LeadStatus,
  notes?: string,
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update({ status, ...(notes !== undefined ? { notes } : {}) })
    .eq('id', leadId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'failed_to_update_lead');
  }

  return data;
}

export async function checkForDuplicateLead(
  supabase: SupabaseClient<Database>,
  profileId: string,
  contactHash: string,
): Promise<boolean> {
  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('contact_hash', contactHash);

  return (count ?? 0) > 0;
}

export function exportLeadsToCsv(leads: Lead[]): string {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Message', 'Source', 'Status', 'Created At'];
  const rows = leads.map((lead) => [
    lead.full_name,
    lead.email ?? '',
    lead.phone ?? '',
    lead.company ?? '',
    (lead.message ?? '').replace(/"/g, '""'),
    lead.source,
    lead.status,
    lead.created_at,
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
  );

  return csvLines.join('\n');
}
