// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhooks for international card orders and Stripe
// Billing subscriptions (Pro/Business/Enterprise). Idempotent via
// payment_events unique constraint on (provider, provider_event_id).

import { getSupabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabase-admin.ts';
import { verifyStripeSignature } from '../_shared/verify-signature.ts';

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return errorResponse('method_not_allowed', 405);
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return errorResponse('server_misconfigured', 500);
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    return errorResponse('invalid_signature', 401);
  }

  const event: StripeEvent = JSON.parse(rawBody);
  const supabase = getSupabaseAdmin();

  const { error: insertEventError } = await supabase.from('payment_events').insert({
    provider: 'stripe',
    provider_event_id: event.id,
    event_type: event.type,
    raw_payload: event,
  });

  if (insertEventError) {
    if (insertEventError.code === '23505') {
      return jsonResponse({ received: true, deduplicated: true });
    }
    console.error('Failed to log payment event', insertEventError);
    return errorResponse('internal_error', 500);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          metadata?: Record<string, string>;
          mode: string;
          customer: string;
          subscription?: string;
        };

        if (session.mode === 'payment') {
          const orderId = session.metadata?.connect_cards_order_id;
          if (orderId) {
            await supabase
              .from('orders')
              .update({ status: 'paid' })
              .eq('id', orderId)
              .eq('status', 'pending_payment');

            await supabase.from('manufacturing_batches').insert({ order_id: orderId });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as {
          id: string;
          customer: string;
          status: string;
          current_period_start: number;
          current_period_end: number;
          cancel_at_period_end: boolean;
          items: { data: Array<{ price: { id: string }; quantity: number }> };
          metadata?: Record<string, string>;
        };

        const planTier = sub.metadata?.plan_tier;
        const ownerType = sub.metadata?.owner_type;
        const ownerId = sub.metadata?.owner_id;
        if (!planTier || !ownerType || !ownerId) break;

        const { data: planRow } = await supabase
          .from('plans')
          .select('id')
          .eq('tier', planTier)
          .single();

        if (!planRow) break;

        const seats = sub.items.data[0]?.quantity ?? 1;

        await supabase.from('subscriptions').upsert(
          {
            [ownerType === 'organization' ? 'organization_id' : 'user_id']: ownerId,
            plan_id: planRow.id,
            provider: 'stripe',
            provider_customer_id: sub.customer,
            provider_subscription_id: sub.id,
            status: mapStripeStatus(sub.status),
            seats,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
          },
          { onConflict: 'provider,provider_subscription_id' },
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as { id: string };
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('provider', 'stripe')
          .eq('provider_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as { subscription?: string };
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('provider', 'stripe')
            .eq('provider_subscription_id', invoice.subscription);
        }
        break;
      }

      default:
        break;
    }

    await supabase
      .from('payment_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('provider', 'stripe')
      .eq('provider_event_id', event.id);

    return jsonResponse({ received: true });
  } catch (err) {
    console.error('Error processing Stripe webhook', err);
    return errorResponse('internal_error', 500);
  }
});

function mapStripeStatus(
  stripeStatus: string,
): 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused' {
  const map: Record<string, ReturnType<typeof mapStripeStatus>> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused: 'paused',
  };
  return map[stripeStatus] ?? 'incomplete';
}
