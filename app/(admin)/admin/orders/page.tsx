// app/(admin)/admin/orders/page.tsx
import { createClient } from '@/lib/supabase/server';
import { OrderRowActions } from '@/components/admin/order-row-actions';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-muted-foreground">Fulfillment queue across all customers.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-border/40 last:border-0 align-top">
                <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{order.order_type}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(order.total_amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <OrderRowActions order={order} />
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
