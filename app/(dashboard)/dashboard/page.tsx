// app/(dashboard)/dashboard/page.tsx
import Link from 'next/link';
import { Eye, Smartphone, QrCode, Users, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfileAnalyticsSummary } from '@/lib/services/analytics';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default async function DashboardOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const [{ data: card }, analyticsSummary, { data: recentLeads }] = await Promise.all([
    supabase.from('cards').select('*').eq('owner_profile_id', profile?.id ?? '').maybeSingle(),
    profile ? getProfileAnalyticsSummary(supabase, profile.id, 30) : null,
    supabase
      .from('leads')
      .select('*')
      .eq('profile_id', profile?.id ?? '')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here is how your card has been performing over the last 30 days.
        </p>
      </div>

      {card && (
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-medium">
                {card.color.replace('_', ' ')} card &middot; {card.card_serial}
              </p>
              <p className="text-xs text-muted-foreground">
                Activated {card.activated_at ? formatDate(card.activated_at) : '\u2014'}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
            Active
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile views" value={analyticsSummary?.totalViews ?? 0} icon={Eye} accent />
        <StatCard label="NFC taps" value={analyticsSummary?.totalTaps ?? 0} icon={Smartphone} />
        <StatCard label="QR scans" value={analyticsSummary?.totalScans ?? 0} icon={QrCode} />
        <StatCard label="Leads captured" value={analyticsSummary?.totalLeads ?? 0} icon={Users} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="font-display font-semibold">Recent leads</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/leads">View all</Link>
          </Button>
        </div>

        {recentLeads && recentLeads.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{lead.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.email ?? lead.phone ?? 'No contact info'} &middot; via {lead.source}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                  {lead.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No leads yet. Share your profile to start capturing contacts.
          </div>
        )}
      </div>
    </div>
  );
}
