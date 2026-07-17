// app/api/checkout/razorpay/route.ts
import { createClient } from '@/lib/supabase/server';
import { createRazorpayOrderCheckout } from '@/lib/services/subscriptions';
import { apiError, apiSuccess } from '@/lib/security/api-response';

interface RazorpayCheckoutRequestBody {
  orderId: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError('unauthorized', 'You must be logged in to check out.');
  }

  const body: RazorpayCheckoutRequestBody = await request.json();

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', body.orderId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!order) {
    return apiError('not_found', 'Order not found.');
  }

  if (order.status !== 'pending_payment') {
    return apiError('conflict', 'This order has already been processed.');
  }

  try {
    const checkout = await createRazorpayOrderCheckout({
      amountInPaise: Math.round(order.total_amount * 100),
      receipt: order.id,
      ownerType: order.organization_id ? 'organization' : 'user',
      ownerId: order.organization_id ?? user.id,
    });

    return apiSuccess(checkout);
  } catch (err) {
    console.error('Razorpay checkout creation failed', err);
    return apiError('internal_error', 'Could not start checkout. Please try again.');
  }
}
