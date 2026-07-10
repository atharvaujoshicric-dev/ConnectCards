// components/profile-builder/publish-toggle.tsx
'use client';

import { useTransition } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { togglePublished } from '@/(dashboard)/dashboard/profile/actions';

export function PublishToggle({ initialValue }: { initialValue: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
      <div>
        <p className="text-sm font-medium">Profile visibility</p>
        <p className="text-xs text-muted-foreground">
          When off, your profile page shows as not found to visitors.
        </p>
      </div>
      <Switch.Root
        defaultChecked={initialValue}
        disabled={isPending}
        onCheckedChange={(checked) => startTransition(() => togglePublished(checked))}
        className="relative h-6 w-11 rounded-full bg-secondary data-[state=checked]:bg-accent"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  );
}
