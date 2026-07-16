// app/(dashboard)/dashboard/orders/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { OrderTracker } from '@/components/order/order-tracker';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-muted-foreground">Track your card orders and shipments.</p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/order">Order more cards</Link>
        </Button>
      </div>

      {(orders ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {(orders ?? []).map((order) => (
            <div key={order.id} className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <p className="font-display font-semibold">{formatCurrency(order.total_amount)}</p>
              </div>

              <div className="mt-4">
                <OrderTracker status={order.status} />
              </div>

              {order.tracking_number && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Tracking: <span className="font-mono">{order.tracking_number}</span>
                  {order.tracking_carrier ? ` via ${order.tracking_carrier}` : ''}
                </p>
              )}

              {order.status === 'pending_payment' && (
                <Button size="sm" variant="outline" className="mt-4" asChild>
                  <Link href={`/order/${order.id}/checkout`}>Complete payment</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
