// app/(admin)/admin/audit-log/page.tsx
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

interface AuditLogPageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 50;

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? '1'));
  const supabase = await createClient();

  const { data: entries, count } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-muted-foreground">
          Every admin action, immutable. Page {page} of {totalPages}.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {(entries ?? []).map((entry) => (
              <tr key={entry.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium capitalize">{entry.action.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {entry.target_table}/{entry.target_id?.slice(0, 8) ?? '\u2014'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {entry.actor_id?.slice(0, 8) ?? 'system'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.created_at)}</td>
              </tr>
            ))}
            {(entries ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
