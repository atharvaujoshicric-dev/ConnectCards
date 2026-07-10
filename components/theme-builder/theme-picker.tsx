// components/theme-builder/theme-picker.tsx
'use client';

import { useState, useTransition } from 'react';
import { Lock, Check } from 'lucide-react';
import { selectTheme } from '@/(dashboard)/dashboard/theme/actions';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/database.types';

interface ThemePickerProps {
  themes: Theme[];
  currentThemeId: string | null;
  canUsePremiumThemes: boolean;
}

export function ThemePicker({ themes, currentThemeId, canUsePremiumThemes }: ThemePickerProps) {
  const [selected, setSelected] = useState(currentThemeId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(theme: Theme) {
    if (theme.is_premium && !canUsePremiumThemes) {
      setError('Upgrade to Pro to unlock this theme.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await selectTheme(theme.id);
      if (result.success) {
        setSelected(theme.id);
      } else {
        setError(result.message ?? 'Could not apply theme.');
      }
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {themes.map((theme) => {
          const isLocked = theme.is_premium && !canUsePremiumThemes;
          const isSelected = selected === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(theme)}
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-xl border-2 p-3 text-left text-xs transition-all',
                isSelected ? 'border-accent' : 'border-transparent hover:border-border',
              )}
              style={{ background: theme.tokens.bg, color: theme.tokens.fg }}
            >
              {isLocked && (
                <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1">
                  <Lock className="h-3 w-3 text-white" />
                </span>
              )}
              {isSelected && (
                <span className="absolute right-2 top-2 rounded-full bg-accent p-1">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
              <span
                className="mb-3 block h-8 w-8 rounded-full"
                style={{ background: theme.tokens.accent }}
              />
              <p className="font-medium">{theme.name}</p>
              <p className="opacity-60">{theme.layout_variant.replace('_', ' ')}</p>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
