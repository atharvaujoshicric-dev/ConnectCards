// app/(dashboard)/dashboard/billing/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlement } from '@/lib/entitlements';
import { CurrentPlanCard } from '@/components/billing/current-plan-card';
import { PlanSelector } from '@/components/billing/plan-selector';

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [entitlement, { data: subscription }] = await Promise.all([
    getUserEntitlement(supabase, user.id),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle(),
  ]);

  const planName = entitlement.tier.charAt(0).toUpperCase() + entitlement.tier.slice(1);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-muted-foreground">Manage your subscription and plan.</p>
      </div>

      <CurrentPlanCard subscription={subscription} planName={planName} />

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Change plan</h2>
        <PlanSelector currentTier={entitlement.tier} />
      </section>
    </div>
  );
}
