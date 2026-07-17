// supabase/functions/razorpay-webhook/index.ts
// Handles Razorpay webhooks for one-time card hardware purchases and
// Razorpay Subscriptions. Idempotent via payment_events unique constraint.

import { getSupabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabase-admin.ts';
import { verifyRazorpaySignature } from '../_shared/verify-signature.ts';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: RazorpayOrderEntity };
    subscription?: { entity: RazorpaySubscriptionEntity };
  };
}

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  notes?: Record<string, string>;
}

interface RazorpayOrderEntity {
  id: string;
  notes?: Record<string, string>;
}

interface RazorpaySubscriptionEntity {
  id: string;
  status: string;
  customer_id: string;
  current_start: number;
  current_end: number;
  notes?: Record<string, string>;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return errorResponse('method_not_allowed', 405);
  }

  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return errorResponse('server_misconfigured', 500);
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  const isValid = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    return errorResponse('invalid_signature', 401);
  }

  const payload: RazorpayWebhookPayload = JSON.parse(rawBody);
  const supabase = getSupabaseAdmin();

  const providerEventId = `${payload.event}:${
    payload.payload.payment?.entity.id ?? payload.payload.subscription?.entity.id ?? crypto.randomUUID()
  }`;

  // Idempotency guard — insert first; if it already exists, no-op and 200.
  const { error: insertEventError } = await supabase.from('payment_events').insert({
    provider: 'razorpay',
    provider_event_id: providerEventId,
    event_type: payload.event,
    raw_payload: payload,
  });

  if (insertEventError) {
    if (insertEventError.code === '23505') {
      // Unique violation => already processed this exact event.
      return jsonResponse({ received: true, deduplicated: true });
    }
    console.error('Failed to log payment event', insertEventError);
    return errorResponse('internal_error', 500);
  }

  try {
    switch (payload.event) {
      case 'payment.captured': {
        const payment = payload.payload.payment?.entity;
        if (!payment) break;
        const orderId = payment.notes?.connect_cards_order_id;
        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId)
            .eq('status', 'pending_payment');

          await supabase.from('manufacturing_batches').insert({
            order_id: orderId,
          });
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payload.payment?.entity;
        const orderId = payment?.notes?.connect_cards_order_id;
        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('status', 'pending_payment');
        }
        break;
      }

      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.payload.subscription?.entity;
        if (!sub) break;
        const planTier = sub.notes?.plan_tier;
        const ownerType = sub.notes?.owner_type; // 'user' | 'organization'
        const ownerId = sub.notes?.owner_id;
        if (!planTier || !ownerType || !ownerId) break;

        const { data: planRow } = await supabase
          .from('plans')
          .select('id')
          .eq('tier', planTier)
          .single();

        if (!planRow) break;

        await supabase.from('subscriptions').upsert(
          {
            [ownerType === 'organization' ? 'organization_id' : 'user_id']: ownerId,
            plan_id: planRow.id,
            provider: 'razorpay',
            provider_customer_id: sub.customer_id,
            provider_subscription_id: sub.id,
            status: 'active',
            current_period_start: new Date(sub.current_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_end * 1000).toISOString(),
          },
          { onConflict: 'provider,provider_subscription_id' },
        );
        break;
      }

      case 'subscription.cancelled': {
        const sub = payload.payload.subscription?.entity;
        if (!sub) break;
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('provider', 'razorpay')
          .eq('provider_subscription_id', sub.id);
        break;
      }

      default:
        // Unhandled event types are logged but not treated as errors.
        break;
    }

    await supabase
      .from('payment_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('provider', 'razorpay')
      .eq('provider_event_id', providerEventId);

    return jsonResponse({ received: true });
  } catch (err) {
    console.error('Error processing Razorpay webhook', err);
    return errorResponse('internal_error', 500);
  }
});
