// lib/services/analytics.ts
// Read-side analytics queries used by the dashboard. Write-side (event
// recording) happens exclusively through the record_analytics_event RPC,
// called directly from client code — see components/profile/analytics-beacon.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AnalyticsDailyRollup } from '@/types/database.types';

export interface AnalyticsSummary {
  totalViews: number;
  totalTaps: number;
  totalScans: number;
  totalVcfDownloads: number;
  totalLeads: number;
  last7DaysTrend: Array<{ date: string; views: number; taps: number; scans: number }>;
}

export async function getProfileAnalyticsSummary(
  supabase: SupabaseClient<Database>,
  profileId: string,
  daysBack = 30,
): Promise<AnalyticsSummary> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  const { data: rollups } = await supabase
    .from('analytics_daily_rollups')
    .select('*')
    .eq('profile_id', profileId)
    .gte('rollup_date', sinceDate.toISOString().slice(0, 10))
    .order('rollup_date', { ascending: true });

  const rows: AnalyticsDailyRollup[] = rollups ?? [];

  const totals = rows.reduce(
    (acc, row) => {
      acc.totalViews += row.profile_views;
      acc.totalTaps += row.nfc_taps;
      acc.totalScans += row.qr_scans;
      acc.totalVcfDownloads += row.vcf_downloads;
      acc.totalLeads += row.leads_captured;
      return acc;
    },
    { totalViews: 0, totalTaps: 0, totalScans: 0, totalVcfDownloads: 0, totalLeads: 0 },
  );

  const last7DaysTrend = rows.slice(-7).map((row) => ({
    date: row.rollup_date,
    views: row.profile_views,
    taps: row.nfc_taps,
    scans: row.qr_scans,
  }));

  return { ...totals, last7DaysTrend };
}

export interface SourceBreakdownRow {
  source: string;
  count: number;
}

export async function getSourceBreakdown(
  supabase: SupabaseClient<Database>,
  profileId: string,
  daysBack = 30,
): Promise<SourceBreakdownRow[]> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  const { data } = await supabase
    .from('analytics_events')
    .select('source')
    .eq('profile_id', profileId)
    .gte('occurred_at', sinceDate.toISOString());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.source, (counts.get(row.source) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export interface DeviceBreakdownRow {
  device: string;
  count: number;
}

export async function getDeviceBreakdown(
  supabase: SupabaseClient<Database>,
  profileId: string,
  daysBack = 30,
): Promise<DeviceBreakdownRow[]> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  const { data } = await supabase
    .from('analytics_events')
    .select('device_type')
    .eq('profile_id', profileId)
    .gte('occurred_at', sinceDate.toISOString());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const device = row.device_type ?? 'unknown';
    counts.set(device, (counts.get(device) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getTopReferrers(
  supabase: SupabaseClient<Database>,
  profileId: string,
  daysBack = 30,
  limit = 5,
): Promise<Array<{ referrer: string; count: number }>> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  const { data } = await supabase
    .from('analytics_events')
    .select('referrer')
    .eq('profile_id', profileId)
    .gte('occurred_at', sinceDate.toISOString())
    .not('referrer', 'is', null);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.referrer) continue;
    counts.set(row.referrer, (counts.get(row.referrer) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
  topPerformingProfiles: Array<{ profileId: string; views: number }>;
}

export async function getOrganizationAnalyticsSummary(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  daysBack = 30,
): Promise<OrgAnalyticsSummary> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  const { data: rollups } = await supabase
    .from('analytics_daily_rollups')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('rollup_date', sinceDate.toISOString().slice(0, 10));

  const rows: AnalyticsDailyRollup[] = rollups ?? [];

  const totals = rows.reduce(
    (acc, row) => {
      acc.totalViews += row.profile_views;
      acc.totalTaps += row.nfc_taps;
      acc.totalScans += row.qr_scans;
      acc.totalVcfDownloads += row.vcf_downloads;
      acc.totalLeads += row.leads_captured;
      return acc;
    },
    { totalViews: 0, totalTaps: 0, totalScans: 0, totalVcfDownloads: 0, totalLeads: 0 },
  );

  const byProfile = new Map<string, number>();
  for (const row of rows) {
    byProfile.set(row.profile_id, (byProfile.get(row.profile_id) ?? 0) + row.profile_views);
  }

  const topPerformingProfiles = [...byProfile.entries()]
    .map(([profileId, views]) => ({ profileId, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return { ...totals, last7DaysTrend: [], topPerformingProfiles };
}
