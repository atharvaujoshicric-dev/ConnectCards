// app/(admin)/admin/layout.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth: middleware.ts already blocks non-super-admins from
  // /admin/*, but this layout re-checks server-side so the guard holds
  // even if middleware config ever drifts.
  const isSuperAdmin = Boolean(
    (user?.app_metadata as Record<string, unknown> | undefined)?.is_super_admin,
  );

  if (!user || !isSuperAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-secondary/20 px-4 py-6 md:block">
        <Link href="/admin" className="mb-8 block px-3 font-display text-lg font-semibold tracking-tight">
          Connect<span className="text-accent">Cards</span>{' '}
          <span className="text-xs font-normal text-muted-foreground">Admin</span>
        </Link>
        <AdminSidebarNav />
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
