// app/(dashboard)/dashboard/leads/page.tsx
import Link from 'next/link';
import { Download, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlement, hasFeature } from '@/lib/entitlements';
import { LeadsTable } from '@/components/leads/leads-table';
import { Button } from '@/components/ui/button';

export default async function LeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  const entitlement = await getUserEntitlement(supabase, user.id);
  const canUseLeadForms = hasFeature(entitlement, 'lead_forms');
  const canExportCrm = hasFeature(entitlement, 'crm_export');

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  if (!canUseLeadForms) {
    return (
      <div className="max-w-3xl">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Leads</h1>
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-border p-6">
          <Lock className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Lead capture is a Pro feature</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to add a lead capture form to your profile and start building a real
              pipeline from every scan.
            </p>
            <Link href="/dashboard/billing" className="mt-3 inline-block text-sm font-medium text-accent">
              Upgrade to Pro &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Every submission from your profile&apos;s lead form lands here.
          </p>
        </div>

        {canExportCrm ? (
          <Button variant="outline" asChild>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- intentional plain anchor: this triggers a CSV file download from an API route, not a client-side page navigation */}
            <a href="/api/leads/export">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </a>
          </Button>
        ) : (
          <Button variant="outline" disabled title="CRM export requires Business plan">
            <Lock className="mr-2 h-4 w-4" />
            Export CSV (Business)
          </Button>
        )}
      </div>

      <LeadsTable leads={leads ?? []} />
    </div>
  );
}
