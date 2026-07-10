// components/admin/order-row-actions.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatusAction, issueRefundAction } from '@/(admin)/admin/actions';
import type { Order, OrderStatus } from '@/types/database.types';

const STATUS_FLOW: OrderStatus[] = [
  'pending_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled', 'refunded',
];

export function OrderRowActions({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const [tracking, setTracking] = useState(order.tracking_number ?? '');
  const [carrier, setCarrier] = useState(order.tracking_carrier ?? '');
  const [message, setMessage] = useState<string | null>(null);

  function handleStatusChange(newStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, newStatus, tracking, carrier);
      setMessage(result.success ? 'Updated.' : (result.message ?? 'Failed to update.'));
    });
  }

  function handleRefund() {
    if (!confirm('Issue a refund for this order? This cannot be undone.')) return;
    startTransition(async () => {
      const result = await issueRefundAction(order.id);
      setMessage(result.success ? 'Refund issued.' : (result.message ?? 'Failed to refund.'));
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          defaultValue={order.status}
          disabled={isPending}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
        >
          {STATUS_FLOW.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>

        <input
          placeholder="Tracking #"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="w-28 rounded-md border border-input bg-background px-2 py-1 text-xs"
        />
        <input
          placeholder="Carrier"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="w-24 rounded-md border border-input bg-background px-2 py-1 text-xs"
        />

        {order.status !== 'refunded' && order.status !== 'cancelled' && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleRefund}
            className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
          >
            Refund
          </button>
        )}
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
