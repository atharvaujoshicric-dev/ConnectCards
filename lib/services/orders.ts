// lib/services/orders.ts
// Business logic for card hardware orders. Route handlers and Server
// Actions call into this module; they never compute pricing or touch
// the database directly, so pricing logic is single-sourced.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Order, OrderItem } from '@/types/database.types';
import type { CreateOrderInput } from '@/lib/validation/order';
import { calculateCardUnitPrice } from '@/lib/utils';

const GST_RATE = 0.18;

export interface OrderPricingBreakdown {
  items: Array<{ cardColor: string; quantity: number; unitPrice: number; lineTotal: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function calculateOrderPricing(
  items: CreateOrderInput['items'],
  discountPercentage = 0,
): OrderPricingBreakdown {
  const lineItems = items.map((item) => {
    const unitPrice = calculateCardUnitPrice(item.quantity);
    return {
      cardColor: item.cardColor,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = Math.round(subtotal * (discountPercentage / 100));
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * GST_RATE);
  const total = taxableAmount + tax;

  return { items: lineItems, subtotal, discount, tax, total };
}

export async function validateAndApplyCoupon(
  supabase: SupabaseClient<Database>,
  couponCode: string | undefined,
): Promise<{ discountPercentage: number; couponId: string | null }> {
  if (!couponCode) return { discountPercentage: 0, couponId: null };

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();

  if (!coupon) {
    throw new Error('invalid_or_expired_coupon');
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    throw new Error('invalid_or_expired_coupon');
  }

  if (coupon.max_redemptions !== null && coupon.times_redeemed >= coupon.max_redemptions) {
    throw new Error('coupon_redemption_limit_reached');
  }

  const discountPercentage =
    coupon.discount_type === 'percentage'
      ? coupon.discount_value
      : 0; // fixed_amount coupons are applied as a flat deduction downstream, not modeled here as a %

  return { discountPercentage, couponId: coupon.id };
}

export async function createOrder(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateOrderInput,
): Promise<{ order: Order; orderItems: OrderItem[] }> {
  const { discountPercentage, couponId } = await validateAndApplyCoupon(supabase, input.couponCode);
  const pricing = calculateOrderPricing(input.items, discountPercentage);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      organization_id: input.organizationId ?? null,
      order_type: input.orderType,
      status: 'pending_payment',
      currency: 'INR',
      subtotal_amount: pricing.subtotal,
      discount_amount: pricing.discount,
      tax_amount: pricing.tax,
      total_amount: pricing.total,
      coupon_id: couponId,
      shipping_name: input.shipping.shippingName,
      shipping_phone: input.shipping.shippingPhone,
      shipping_address_line1: input.shipping.shippingAddressLine1,
      shipping_address_line2: input.shipping.shippingAddressLine2 || null,
      shipping_city: input.shipping.shippingCity,
      shipping_state: input.shipping.shippingState,
      shipping_postal_code: input.shipping.shippingPostalCode,
      shipping_country: input.shipping.shippingCountry,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? 'failed_to_create_order');
  }

  const orderItemsPayload = pricing.items.map((item) => ({
    order_id: order.id,
    card_color: item.cardColor,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
  }));

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload)
    .select();

  if (itemsError || !orderItems) {
    // Roll back the parent order if line items fail to insert.
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error(itemsError?.message ?? 'failed_to_create_order_items');
  }

  return { order, orderItems };
}

export async function getOrderWithItems(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (!order) return null;

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);

  return { order, items: items ?? [] };
}
