// components/order/order-tracker.tsx
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/database.types';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'paid', label: 'Payment confirmed' },
  { status: 'in_production', label: 'In production' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === 'cancelled' || status === 'refunded') {
    return (
      <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium capitalize text-destructive">
        {status}
      </span>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isComplete = currentIndex >= 0 && index <= currentIndex;
        return (
          <div key={step.status} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  isComplete ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="whitespace-nowrap text-[10px] text-muted-foreground">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <span className={cn('h-px flex-1', isComplete ? 'bg-accent' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
