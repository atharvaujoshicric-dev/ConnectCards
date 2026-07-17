// app/(admin)/admin/page.tsx
import Link from 'next/link';
import { Package, Factory, ScrollText, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatDate } from '@/lib/utils';

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: pendingOrders },
    { count: queuedBatches },
    { count: shippedThisWeek },
    { data: recentAuditEntries },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['paid', 'in_production']),
    supabase
      .from('manufacturing_batches')
      .select('id', { count: 'exact', head: true })
      .in('status', ['queued', 'in_production', 'quality_check']),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'shipped')
      .gte('shipped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Admin overview</h1>
        <p className="mt-1 text-muted-foreground">Fulfillment and platform health at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders awaiting fulfillment" value={pendingOrders ?? 0} icon={Package} accent />
        <StatCard label="Batches in production" value={queuedBatches ?? 0} icon={Factory} />
        <StatCard label="Shipped this week" value={shippedThisWeek ?? 0} icon={AlertCircle} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/orders"
          className="rounded-xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-md"
        >
          <Package className="h-6 w-6 text-accent" />
          <p className="mt-3 font-display font-semibold">Manage orders</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Update fulfillment status, add tracking, issue refunds.
          </p>
        </Link>
        <Link
          href="/admin/manufacturing"
          className="rounded-xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-md"
        >
          <Factory className="h-6 w-6 text-accent" />
          <p className="mt-3 font-display font-semibold">Manufacturing queue</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Advance batches through production and generate card serials.
          </p>
        </Link>
      </div>

      <section className="rounded-xl border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display font-semibold">
            <ScrollText className="h-4 w-4" />
            Recent admin activity
          </h2>
          <Link href="/admin/audit-log" className="text-sm text-accent">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border/60">
          {(recentAuditEntries ?? []).map((entry) => (
            <li key={entry.id} className="px-5 py-3 text-sm">
              <span className="font-medium">{entry.action.replace(/_/g, ' ')}</span>{' '}
              <span className="text-muted-foreground">
                on {entry.target_table} &middot; {formatDate(entry.created_at)}
              </span>
            </li>
          ))}
          {(recentAuditEntries ?? []).length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-muted-foreground">
              No admin actions recorded yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
