// components/theme-builder/theme-toggles.tsx
'use client';

import { useTransition } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { toggleDarkMode, toggleRemoveBranding } from '@/(dashboard)/dashboard/theme/actions';

interface ThemeTogglesProps {
  darkModeEnabled: boolean;
  brandingRemoved: boolean;
  isProOrAbove: boolean;
}

export function ThemeToggles({ darkModeEnabled, brandingRemoved, isProOrAbove }: ThemeTogglesProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <ToggleRow
        label="Dark mode"
        description="Render your profile in a dark palette by default."
        defaultChecked={darkModeEnabled}
        disabled={!isProOrAbove || isPending}
        onCheckedChange={(checked) => startTransition(() => toggleDarkMode(checked))}
        lockedMessage={!isProOrAbove ? 'Pro feature' : undefined}
      />
      <ToggleRow
        label="Remove Connect Cards branding"
        description={'Hide the "Made with Connect Cards" footer.'}
        defaultChecked={brandingRemoved}
        disabled={!isProOrAbove || isPending}
        onCheckedChange={(checked) => startTransition(() => toggleRemoveBranding(checked))}
        lockedMessage={!isProOrAbove ? 'Pro feature' : undefined}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked,
  disabled,
  onCheckedChange,
  lockedMessage,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
  lockedMessage?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
      <div>
        <p className="text-sm font-medium">
          {label}
          {lockedMessage && (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {lockedMessage}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch.Root
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="relative h-6 w-11 rounded-full bg-secondary data-[state=checked]:bg-accent disabled:opacity-50"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  );
}
