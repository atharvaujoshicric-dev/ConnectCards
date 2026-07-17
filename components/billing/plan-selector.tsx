// components/billing/plan-selector.tsx
'use client';

import { useState, useTransition } from 'react';
import { startSubscriptionCheckoutAction } from '@/(dashboard)/dashboard/billing/actions';
import { cn } from '@/lib/utils';
import type { PlanTier } from '@/types/database.types';

const UPGRADE_PLANS: Array<{ tier: Exclude<PlanTier, 'free'>; name: string; monthly: number; yearly: number }> = [
  { tier: 'pro', name: 'Pro', monthly: 499, yearly: 4999 },
  { tier: 'business', name: 'Business', monthly: 1499, yearly: 14999 },
  { tier: 'enterprise', name: 'Enterprise', monthly: 4999, yearly: 49999 },
];

export function PlanSelector({ currentTier }: { currentTier: PlanTier }) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpgrade(tier: Exclude<PlanTier, 'free'>) {
    setError(null);
    startTransition(async () => {
      const result = await startSubscriptionCheckoutAction(tier, interval);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error ?? 'Could not start checkout.');
      }
    });
  }

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-border/60 p-1 text-sm">
        {(['monthly', 'yearly'] as const).map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInterval(i)}
            className={cn(
              'rounded-full px-4 py-1.5 capitalize transition-colors',
              interval === i ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
            )}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {UPGRADE_PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const price = interval === 'monthly' ? plan.monthly : plan.yearly;

          return (
            <div key={plan.tier} className="rounded-xl border border-border/60 bg-card p-5">
              <p className="font-display font-semibold">{plan.name}</p>
              <p className="mt-2 text-2xl font-semibold">
                &#8377;{price.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-muted-foreground">
                  /{interval === 'monthly' ? 'mo' : 'yr'}
                </span>
              </p>
              <button
                type="button"
                disabled={isCurrent || isPending}
                onClick={() => handleUpgrade(plan.tier)}
                className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {isCurrent ? 'Current plan' : isPending ? 'Redirecting…' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
