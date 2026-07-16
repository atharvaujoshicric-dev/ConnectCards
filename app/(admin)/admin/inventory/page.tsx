// app/(admin)/admin/inventory/page.tsx
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { CreditCard } from 'lucide-react';

const COLORS = ['gold', 'silver', 'rose_gold', 'black'] as const;
const STATUSES = ['manufactured', 'ready_to_ship', 'shipped', 'activated', 'frozen', 'revoked'] as const;

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data: cards } = await supabase.from('cards').select('color, status');

  const rows = cards ?? [];

  const totalByStatus = STATUSES.map((status) => ({
    status,
    count: rows.filter((c) => c.status === status).length,
  }));

  const grid = COLORS.map((color) => ({
    color,
    counts: STATUSES.map((status) => ({
      status,
      count: rows.filter((c) => c.color === color && c.status === status).length,
    })),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-muted-foreground">Card stock across every color and lifecycle stage.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {totalByStatus.map((item) => (
          <StatCard
            key={item.status}
            label={item.status.replace('_', ' ')}
            value={item.count}
            icon={CreditCard}
            accent={item.status === 'ready_to_ship'}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Color</th>
              {STATUSES.map((status) => (
                <th key={status} className="px-4 py-3 font-medium capitalize">
                  {status.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.color} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium capitalize">{row.color.replace('_', ' ')}</td>
                {row.counts.map((c) => (
                  <td key={c.status} className="px-4 py-3">
                    {c.count}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
