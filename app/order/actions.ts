// app/order/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createOrderSchema } from '@/lib/validation/order';
import { createOrder } from '@/lib/services/orders';

export interface CreateOrderState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const CREATE_ORDER_INITIAL_STATE: CreateOrderState = { status: 'idle' };

export async function createOrderAction(
  _prevState: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect_to=/order');
  }

  const parsed = createOrderSchema.safeParse({
    orderType: formData.get('orderType'),
    organizationId: formData.get('organizationId') || undefined,
    items: [
      {
        cardColor: formData.get('cardColor'),
        quantity: Number(formData.get('quantity') ?? 1),
      },
    ],
    couponCode: formData.get('couponCode') || undefined,
    shipping: {
      shippingName: formData.get('shippingName'),
      shippingPhone: formData.get('shippingPhone'),
      shippingAddressLine1: formData.get('shippingAddressLine1'),
      shippingAddressLine2: formData.get('shippingAddressLine2') || undefined,
      shippingCity: formData.get('shippingCity'),
      shippingState: formData.get('shippingState'),
      shippingPostalCode: formData.get('shippingPostalCode'),
      shippingCountry: formData.get('shippingCountry') || 'IN',
    },
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      fieldErrors: { ...flattened.fieldErrors } as Record<string, string[]>,
    };
  }

  try {
    const { order } = await createOrder(supabase, user.id, parsed.data);
    redirect(`/order/${order.id}/checkout`);
  } catch (err) {
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) throw err;
    const message =
      err instanceof Error && err.message === 'invalid_or_expired_coupon'
        ? 'That coupon code is invalid or has expired.'
        : 'We could not create your order. Please try again.';
    return { status: 'error', message };
  }
}
