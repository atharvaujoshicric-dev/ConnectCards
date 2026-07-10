// components/leads/lead-status-select.tsx
'use client';

import { useTransition } from 'react';
import { updateLeadStatusAction } from '@/(dashboard)/dashboard/leads/actions';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/database.types';

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-secondary text-foreground',
  contacted: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  qualified: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  converted: 'bg-success/15 text-success',
  lost: 'bg-destructive/15 text-destructive',
};

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => updateLeadStatusAction(leadId, e.target.value as LeadStatus))
      }
      className={cn(
        'rounded-full border-0 px-3 py-1 text-xs font-medium capitalize outline-none',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
