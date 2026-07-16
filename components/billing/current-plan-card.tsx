// components/billing/current-plan-card.tsx
'use client';

import { useState, useTransition } from 'react';
import { cancelSubscriptionAction } from '@/(dashboard)/dashboard/billing/actions';
import { formatDate } from '@/lib/utils';
import type { Subscription } from '@/types/database.types';

export function CurrentPlanCard({
  subscription,
  planName,
}: {
  subscription: Subscription | null;
  planName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!subscription) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">
          You are currently on the <span className="font-medium text-foreground">Free</span> plan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold">{planName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {subscription.cancel_at_period_end
              ? `Cancels on ${formatDate(subscription.current_period_end)}`
              : `Renews on ${formatDate(subscription.current_period_end)}`}
          </p>
        </div>
        {!subscription.cancel_at_period_end && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await cancelSubscriptionAction(subscription.id);
                setMessage(
                  result.success
                    ? 'Your plan will remain active until the end of the current billing period.'
                    : (result.message ?? 'Could not cancel.'),
                );
              })
            }
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Cancel plan
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
