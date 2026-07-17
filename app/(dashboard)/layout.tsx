// app/(dashboard)/layout.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { WelcomeTour } from '@/components/dashboard/welcome-tour';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/dashboard');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('slug')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={null}>
        <WelcomeTour />
      </Suspense>

      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-secondary/20 px-4 py-6 md:block">
        <Link href="/" className="mb-8 block px-3 font-display text-lg font-semibold tracking-tight">
          Connect<span className="text-accent">Cards</span>
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex-1">
        <DashboardHeader userEmail={user.email ?? ''} profileSlug={profile.slug} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
