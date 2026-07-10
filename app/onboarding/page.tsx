// app/onboarding/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

interface OnboardingPageProps {
  searchParams: Promise<{ card?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { card } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/onboarding');
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect('/dashboard');
  }

  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .eq('is_premium', false) // Free-plan onboarding only offers the 3 curated free themes.
    .order('sort_order');

  return (
    <div className="min-h-screen bg-secondary/20 px-4 py-16">
      <div className="mx-auto max-w-lg">
        <p className="mb-2 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Step into your profile
        </p>
        <h1 className="text-center font-display text-3xl font-semibold tracking-tight">
          Let&apos;s set up your card
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          This takes about a minute. You can change everything later from your dashboard.
        </p>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <OnboardingWizard cardId={card} themes={themes ?? []} defaultEmail={user.email ?? ''} />
        </div>
      </div>
    </div>
  );
}
