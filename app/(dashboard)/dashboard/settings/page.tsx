// app/(dashboard)/dashboard/settings/page.tsx
import { createClient } from '@/lib/supabase/server';
import { NotificationPreferencesForm } from '@/components/settings/notification-preferences-form';
import { DeleteAccountButton } from '@/components/settings/delete-account-button';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and notification preferences.</p>
      </div>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="text-sm font-medium">{user.email}</p>
      </section>

      <section className="rounded-xl border border-border/60 bg-card p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Email notifications</h2>
        <NotificationPreferencesForm preferences={preferences} />
      </section>

      <section className="rounded-xl border border-destructive/30 bg-card p-6">
        <h2 className="mb-2 font-display text-lg font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Deleting your account unpublishes your profile and signs you out immediately.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
