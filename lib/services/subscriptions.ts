// lib/services/subscriptions.ts
// Checkout session creation for Razorpay/Stripe subscriptions. Webhook
// handlers (supabase/functions/*-webhook) remain the source of truth for
// subscription state — this module only ever *initiates* checkout.

import 'server-only';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, PlanTier } from '@/types/database.types';

// Both SDK clients are created lazily, on first real use, rather than at
// module load time. Next.js executes route-handler modules during its
// build-time "collect page data" step, and constructing these clients
// eagerly would run (and potentially fail on) unset/placeholder env vars
// during the build itself, before any real request ever comes in.
let stripeClient: Stripe | null = null;
function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeClient;
}

let razorpayClient: Razorpay | null = null;
function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ?? '',
      key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
    });
  }
  return razorpayClient;
}

const STRIPE_PRICE_IDS: Record<Exclude<PlanTier, 'free'>, { monthly?: string; yearly?: string }> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_BUSINESS_YEARLY,
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
    yearly: undefined,
  },
};

export interface CreateCheckoutSessionInput {
  planTier: Exclude<PlanTier, 'free'>;
  billingInterval: 'monthly' | 'yearly';
  ownerType: 'user' | 'organization';
  ownerId: string;
  seats?: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
}

export async function createStripeCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<{ checkoutUrl: string }> {
  const priceId = STRIPE_PRICE_IDS[input.planTier][input.billingInterval];
  if (!priceId) {
    throw new Error(`no_stripe_price_configured_for_${input.planTier}_${input.billingInterval}`);
  }

  const session = await getStripeClient().checkout.sessions.create({
    mode: 'subscription',
    customer_email: input.customerEmail,
    line_items: [{ price: priceId, quantity: input.seats ?? 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    subscription_data: {
      metadata: {
        plan_tier: input.planTier,
        owner_type: input.ownerType,
        owner_id: input.ownerId,
      },
    },
    metadata: {
      plan_tier: input.planTier,
      owner_type: input.ownerType,
      owner_id: input.ownerId,
    },
  });

  if (!session.url) {
    throw new Error('stripe_session_missing_url');
  }

  return { checkoutUrl: session.url };
}

export async function createRazorpayOrderCheckout(input: {
  amountInPaise: number;
  receipt: string;
  ownerType: 'user' | 'organization';
  ownerId: string;
}): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  const order = await getRazorpayClient().orders.create({
    amount: input.amountInPaise,
    currency: 'INR',
    receipt: input.receipt,
    notes: {
      connect_cards_order_id: input.receipt,
      owner_type: input.ownerType,
      owner_id: input.ownerId,
    },
  });

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
  };
}

export async function cancelSubscriptionAtPeriodEnd(
  supabase: SupabaseClient<Database>,
  subscriptionId: string,
): Promise<void> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (!subscription) throw new Error('subscription_not_found');

  if (subscription.provider === 'stripe') {
    await getStripeClient().subscriptions.update(subscription.provider_subscription_id, {
      cancel_at_period_end: true,
    });
  } else {
    await getRazorpayClient().subscriptions.cancel(subscription.provider_subscription_id, true);
  }

  await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('id', subscriptionId);
}
