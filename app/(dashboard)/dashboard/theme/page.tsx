// app/(dashboard)/dashboard/theme/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlement, hasFeature } from '@/lib/entitlements';
import { ThemePicker } from '@/components/theme-builder/theme-picker';
import { ThemeToggles } from '@/components/theme-builder/theme-toggles';

export default async function ThemeBuilderPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: themes }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('themes').select('*').eq('is_active', true).order('sort_order'),
  ]);

  if (!profile) return null;

  const entitlement = await getUserEntitlement(supabase, user.id);
  const isProOrAbove = hasFeature(entitlement, 'gallery');

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Theme</h1>
        <p className="mt-1 text-muted-foreground">
          Choose how your profile looks the moment someone taps your card.
        </p>
      </div>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Appearance</h2>
        <ThemePicker
          themes={themes ?? []}
          currentThemeId={profile.theme_id}
          canUsePremiumThemes={isProOrAbove}
        />
      </section>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Options</h2>
        <ThemeToggles
          darkModeEnabled={profile.dark_mode_enabled}
          brandingRemoved={profile.branding_removed}
          isProOrAbove={isProOrAbove}
        />
      </section>
    </div>
  );
}
