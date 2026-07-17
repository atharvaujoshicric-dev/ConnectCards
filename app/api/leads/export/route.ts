// app/api/leads/export/route.ts
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlement, hasFeature } from '@/lib/entitlements';
import { exportLeadsToCsv } from '@/lib/services/leads';
import { apiError } from '@/lib/security/api-response';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError('unauthorized', 'You must be logged in to export leads.');
  }

  const entitlement = await getUserEntitlement(supabase, user.id);
  if (!hasFeature(entitlement, 'crm_export')) {
    return apiError('plan_upgrade_required', 'CRM export requires a Business plan or above.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return apiError('not_found', 'Profile not found.');
  }

  const statusFilter = request.nextUrl.searchParams.get('status');

  let query = supabase.from('leads').select('*').eq('profile_id', profile.id);
  if (statusFilter) {
    query = query.eq('status', statusFilter as never);
  }

  const { data: leads, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return apiError('internal_error', 'Could not fetch leads for export.');
  }

  const csv = exportLeadsToCsv(leads ?? []);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="connect-cards-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
