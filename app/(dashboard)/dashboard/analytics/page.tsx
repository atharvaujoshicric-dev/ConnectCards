// app/(dashboard)/dashboard/analytics/page.tsx
import Link from 'next/link';
import { Lock, Eye, Smartphone, QrCode, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileAnalyticsSummary,
  getSourceBreakdown,
  getDeviceBreakdown,
  getTopReferrers,
} from '@/lib/services/analytics';
import { getUserEntitlement, hasFeature } from '@/lib/entitlements';
import { StatCard } from '@/components/dashboard/stat-card';
import { TrendChart } from '@/components/analytics/trend-chart';
import { BreakdownBars } from '@/components/analytics/breakdown-bars';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  const entitlement = await getUserEntitlement(supabase, user.id);
  const isAdvanced = hasFeature(entitlement, 'advanced_analytics');

  const summary = await getProfileAnalyticsSummary(supabase, profile.id, 30);

  const [sourceBreakdown, deviceBreakdown, topReferrers] = isAdvanced
    ? await Promise.all([
        getSourceBreakdown(supabase, profile.id, 30),
        getDeviceBreakdown(supabase, profile.id, 30),
        getTopReferrers(supabase, profile.id, 30),
      ])
    : [[], [], []];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Last 30 days of activity on your profile.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile views" value={summary.totalViews} icon={Eye} accent />
        <StatCard label="NFC taps" value={summary.totalTaps} icon={Smartphone} />
        <StatCard label="QR scans" value={summary.totalScans} icon={QrCode} />
        <StatCard label="VCF downloads" value={summary.totalVcfDownloads} icon={Download} />
      </div>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">7-day trend</h2>
        <TrendChart data={summary.last7DaysTrend} />
      </section>

      {isAdvanced ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border border-border/60 bg-card p-6">
            <BreakdownBars
              title="Traffic source"
              rows={sourceBreakdown.map((r) => ({ label: r.source, count: r.count }))}
            />
          </section>
          <section className="rounded-xl border border-border/60 bg-card p-6">
            <BreakdownBars
              title="Device type"
              rows={deviceBreakdown.map((r) => ({ label: r.device, count: r.count }))}
            />
          </section>
          <section className="rounded-xl border border-border/60 bg-card p-6 sm:col-span-2">
            <h3 className="mb-3 text-sm font-medium">Top referrers</h3>
            {topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrer data yet.</p>
            ) : (
              <ul className="space-y-2">
                {topReferrers.map((r) => (
                  <li key={r.referrer} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{r.referrer}</span>
                    <span className="font-medium">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border p-6">
          <Lock className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Advanced analytics is a Pro feature</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to see traffic source, device type, and top referrer breakdowns.
            </p>
            <Link href="/dashboard/billing" className="mt-3 inline-block text-sm font-medium text-accent">
              Upgrade to Pro &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
