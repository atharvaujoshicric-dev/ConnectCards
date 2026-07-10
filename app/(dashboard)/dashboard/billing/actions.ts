// app/(dashboard)/dashboard/billing/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createStripeCheckoutSession, cancelSubscriptionAtPeriodEnd } from '@/lib/services/subscriptions';
import { getOrganizationForUser } from '@/lib/services/organizations';
import type { PlanTier } from '@/types/database.types';

export async function startSubscriptionCheckoutAction(
  planTier: Exclude<PlanTier, 'free'>,
  billingInterval: 'monthly' | 'yearly',
): Promise<{ checkoutUrl?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/dashboard/billing');
  }

  try {
    let ownerType: 'user' | 'organization' = 'user';
    let ownerId: string = user.id;
    let seats = 1;

    if (planTier === 'business' || planTier === 'enterprise') {
      const membership = await getOrganizationForUser(supabase, user.id);
      if (!membership) {
        return { error: 'Create an organization first from the Organization tab.' };
      }
      ownerType = 'organization';
      ownerId = membership.organization.id;
      seats = Math.max(1, membership.organization.seat_count);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const { checkoutUrl } = await createStripeCheckoutSession({
      planTier,
      billingInterval,
      ownerType,
      ownerId,
      seats,
      customerEmail: user.email ?? '',
      successUrl: `${appUrl}/dashboard/billing?upgraded=true`,
      cancelUrl: `${appUrl}/dashboard/billing`,
    });

    return { checkoutUrl };
  } catch (err) {
    console.error('Failed to create Stripe checkout session', err);
    return { error: 'Could not start checkout. Please try again or contact support.' };
  }
}

export async function cancelSubscriptionAction(
  subscriptionId: string,
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be logged in.' };

  try {
    await cancelSubscriptionAtPeriodEnd(supabase, subscriptionId);
    return { success: true };
  } catch {
    return { success: false, message: 'Could not cancel subscription. Please contact support.' };
  }
}
