// supabase/functions/analytics-rollup/index.ts
// Scheduled nightly (via Supabase Cron) to aggregate the previous day's
// raw analytics_events into analytics_daily_rollups for fast dashboard
// queries without scanning raw events at scale.

import { getSupabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabase-admin.ts';

Deno.serve(async (req: Request) => {
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== Deno.env.get('CRON_SECRET')) {
    return errorResponse('unauthorized', 401);
  }

  const supabase = getSupabaseAdmin();

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const rollupDate = yesterday.toISOString().slice(0, 10);
  const rangeStart = `${rollupDate}T00:00:00.000Z`;
  const rangeEnd = `${rollupDate}T23:59:59.999Z`;

  const { data: profileIds, error: profileFetchError } = await supabase
    .from('analytics_events')
    .select('profile_id')
    .gte('occurred_at', rangeStart)
    .lte('occurred_at', rangeEnd);

  if (profileFetchError) {
    console.error('Failed to fetch profile ids for rollup', profileFetchError);
    return errorResponse('internal_error', 500);
  }

  const uniqueProfileIds = Array.from(new Set((profileIds ?? []).map((r) => r.profile_id)));

  let rolledUp = 0;

  for (const profileId of uniqueProfileIds) {
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('event_type, source, country, organization_id')
      .eq('profile_id', profileId)
      .gte('occurred_at', rangeStart)
      .lte('occurred_at', rangeEnd);

    if (eventsError || !events) {
      console.error('Failed to fetch events for profile', profileId, eventsError);
      continue;
    }

    const counts = {
      profile_views: 0,
      nfc_taps: 0,
      qr_scans: 0,
      vcf_downloads: 0,
      leads_captured: 0,
    };
    const sourceCounts = new Map<string, number>();
    const countryCounts = new Map<string, number>();
    let organizationId: string | null = null;

    for (const evt of events) {
      organizationId = (evt.organization_id as string | null) ?? organizationId;
      switch (evt.event_type) {
        case 'profile_view':
          counts.profile_views += 1;
          break;
        case 'nfc_tap':
          counts.nfc_taps += 1;
          break;
        case 'qr_scan':
          counts.qr_scans += 1;
          break;
        case 'vcf_download':
          counts.vcf_downloads += 1;
          break;
        case 'lead_submitted':
          counts.leads_captured += 1;
          break;
      }
      if (evt.source) sourceCounts.set(evt.source, (sourceCounts.get(evt.source) ?? 0) + 1);
      if (evt.country) countryCounts.set(evt.country, (countryCounts.get(evt.country) ?? 0) + 1);
    }

    const topSource = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topCountry = [...countryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const { error: upsertError } = await supabase.from('analytics_daily_rollups').upsert(
      {
        profile_id: profileId,
        organization_id: organizationId,
        rollup_date: rollupDate,
        ...counts,
        top_source: topSource,
        top_country: topCountry,
      },
      { onConflict: 'profile_id,rollup_date' },
    );

    if (upsertError) {
      console.error('Failed to upsert rollup for profile', profileId, upsertError);
      continue;
    }

    rolledUp += 1;
  }

  // Ensure next month's partition exists well ahead of the boundary.
  await supabase.rpc('ensure_next_month_analytics_partition');

  return jsonResponse({ rollup_date: rollupDate, profiles_processed: rolledUp });
});
