// app/(marketing)/themes/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Theme gallery',
  description: 'Browse every theme available on Connect Cards, free and Pro.',
};

export default async function ThemeMarketplacePage() {
  const supabase = await createClient();

  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Theme gallery</h1>
        <p className="mt-4 text-muted-foreground">
          Three themes are free with every card. Pro unlocks the full library, dark mode, and
          custom colors.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(themes ?? []).map((theme) => (
          <div
            key={theme.id}
            className="overflow-hidden rounded-2xl border border-border/60"
            style={{ background: theme.tokens.bg, color: theme.tokens.fg }}
          >
            <div className="flex aspect-[3/4] flex-col justify-between p-5">
              <div>
                <span
                  className="mb-4 block h-10 w-10 rounded-full"
                  style={{ background: theme.tokens.accent }}
                />
                <p className="font-display text-lg font-semibold">{theme.name}</p>
                <p className="mt-1 text-sm capitalize opacity-70">
                  {theme.layout_variant.replace('_', ' ')} layout
                </p>
              </div>
              {theme.is_premium && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium">
                  <Lock className="h-3 w-3" />
                  Pro
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Button size="lg" variant="accent" asChild>
          <Link href="/order">Get your card and pick a theme</Link>
        </Button>
      </div>
    </div>
  );
}
