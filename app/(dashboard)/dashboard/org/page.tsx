// app/(dashboard)/dashboard/org/page.tsx
import Link from 'next/link';
import { Users, Building2, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationForUser, getSeatUsage } from '@/lib/services/organizations';
import { getOrganizationAnalyticsSummary } from '@/lib/services/analytics';
import { StatCard } from '@/components/dashboard/stat-card';
import { BrandingForm } from '@/components/org/branding-form';
import { Button } from '@/components/ui/button';

export default async function OrgOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const membership = await getOrganizationForUser(supabase, user.id);

  if (!membership) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-xl font-semibold">No organization yet</h1>
        <p className="mt-2 text-muted-foreground">
          Create an organization to issue cards to your team and manage them from one place.
        </p>
        <Button asChild className="mt-6" variant="accent">
          <Link href="/org/new">Create organization</Link>
        </Button>
      </div>
    );
  }

  const { organization, role } = membership;

  const [seatUsage, analyticsSummary] = await Promise.all([
    getSeatUsage(supabase, organization.id),
    getOrganizationAnalyticsSummary(supabase, organization.id, 30),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{organization.name}</h1>
          <p className="mt-1 text-muted-foreground">
            You are the {role} of this organization.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/org/employees">Manage employees</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Seats used"
          value={`${seatUsage.seatsUsed} / ${seatUsage.seatsAllowed || '\u2014'}`}
          icon={Users}
          accent={seatUsage.atCapacity}
        />
        <StatCard label="Profile views (30d)" value={analyticsSummary.totalViews} icon={TrendingUp} />
        <StatCard label="Leads captured (30d)" value={analyticsSummary.totalLeads} icon={Users} />
      </div>

      {seatUsage.atCapacity && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          You have used all available seats.{' '}
          <Link href="/dashboard/billing" className="font-medium underline">
            Add more seats
          </Link>{' '}
          to invite additional employees.
        </div>
      )}

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Branding</h2>
        <BrandingForm organization={organization} />
      </section>

      {analyticsSummary.topPerformingProfiles.length > 0 && (
        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Top performing profiles</h2>
          <ul className="space-y-2">
            {analyticsSummary.topPerformingProfiles.map((p) => (
              <li key={p.profileId} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-muted-foreground">{p.profileId}</span>
                <span className="font-medium">{p.views} views</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
