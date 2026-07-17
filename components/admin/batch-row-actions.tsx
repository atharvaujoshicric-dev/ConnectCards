// components/admin/batch-row-actions.tsx
'use client';

import { useState, useTransition } from 'react';
import { advanceManufacturingBatchAction } from '@/(admin)/admin/actions';
import type { ManufacturingBatch } from '@/types/database.types';

const NEXT_STATUS: Record<string, ManufacturingBatch['status'] | null> = {
  queued: 'in_production',
  in_production: 'quality_check',
  quality_check: 'ready_to_ship',
  ready_to_ship: 'shipped',
  shipped: null,
};

const STATUS_LABEL: Record<string, string> = {
  queued: 'Start production',
  in_production: 'Send to QC',
  quality_check: 'Mark ready to ship',
  ready_to_ship: 'Mark shipped',
};

export function BatchRowActions({ batch }: { batch: ManufacturingBatch }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const nextStatus = NEXT_STATUS[batch.status];

  if (!nextStatus) {
    return <span className="text-xs text-muted-foreground">Complete</span>;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await advanceManufacturingBatchAction(
              batch.id,
              nextStatus as 'in_production' | 'quality_check' | 'ready_to_ship' | 'shipped',
            );
            setMessage(result.success ? 'Advanced.' : (result.message ?? 'Failed.'));
          })
        }
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? 'Working…' : STATUS_LABEL[batch.status]}
      </button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
