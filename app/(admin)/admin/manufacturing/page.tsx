// app/(admin)/admin/manufacturing/page.tsx
import { createClient } from '@/lib/supabase/server';
import { BatchRowActions } from '@/components/admin/batch-row-actions';
import { formatDate } from '@/lib/utils';

export default async function AdminManufacturingPage() {
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from('manufacturing_batches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Manufacturing queue</h1>
        <p className="mt-1 text-muted-foreground">
          Advance batches through production. Card serials and activation tokens are generated
          automatically once a batch reaches &quot;ready to ship.&quot;
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {(batches ?? []).map((batch) => (
              <tr key={batch.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{batch.id.slice(0, 8)}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {batch.color.replace('_', ' ')}
                </td>
                <td className="px-4 py-3">{batch.quantity}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {batch.status.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(batch.created_at)}</td>
                <td className="px-4 py-3">
                  <BatchRowActions batch={batch} />
                </td>
              </tr>
            ))}
            {(batches ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No batches in the queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
