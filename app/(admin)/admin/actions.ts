// app/(admin)/admin/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import type { OrderStatus, CardColor } from '@/types/database.types';

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSuperAdmin = Boolean(
    (user?.app_metadata as Record<string, unknown> | undefined)?.is_super_admin,
  );

  if (!user || !isSuperAdmin) throw new Error('forbidden');
  return { supabase, userId: user.id };
}

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  action: string,
  targetTable: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown,
) {
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    before_data: beforeData as Record<string, unknown> | null,
    after_data: afterData as Record<string, unknown> | null,
  });
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string,
  trackingCarrier?: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const { supabase, userId } = await requireSuperAdmin();

    const { data: before } = await supabase.from('orders').select('*').eq('id', orderId).single();

    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (trackingNumber) updatePayload.tracking_number = trackingNumber;
    if (trackingCarrier) updatePayload.tracking_carrier = trackingCarrier;
    if (newStatus === 'shipped') updatePayload.shipped_at = new Date().toISOString();
    if (newStatus === 'delivered') updatePayload.delivered_at = new Date().toISOString();

    const { data: after, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    await writeAuditLog(supabase, userId, 'update_order_status', 'orders', orderId, before, after);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch {
    return { success: false, message: 'Could not update order status.' };
  }
}

export async function issueRefundAction(orderId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { supabase, userId } = await requireSuperAdmin();

    const { data: before } = await supabase.from('orders').select('*').eq('id', orderId).single();

    // In production this would call the Razorpay/Stripe refund API using
    // the order's payment_events records before flipping local status.
    // That provider call is intentionally out of scope for this action;
    // see lib/services/subscriptions.ts for the pattern used elsewhere.
    const { data: after, error } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    await writeAuditLog(supabase, userId, 'issue_refund', 'orders', orderId, before, after);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch {
    return { success: false, message: 'Could not issue refund.' };
  }
}

export async function advanceManufacturingBatchAction(
  batchId: string,
  newStatus: 'in_production' | 'quality_check' | 'ready_to_ship' | 'shipped',
): Promise<{ success: boolean; message?: string }> {
  try {
    const { supabase, userId } = await requireSuperAdmin();

    const { data: before } = await supabase
      .from('manufacturing_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    const { data: after, error } = await supabase
      .from('manufacturing_batches')
      .update({ status: newStatus })
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;

    // Once a batch is ready to ship, generate the individual card records
    // (serial + activation token) if they don't already exist.
    if (newStatus === 'ready_to_ship') {
      const { count: existingCardCount } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .eq('batch_id', batchId);

      if ((existingCardCount ?? 0) === 0 && before) {
        const cardsToInsert = Array.from({ length: before.quantity }).map(() => ({
          batch_id: batchId,
          card_serial: `CC-${randomBytes(4).toString('hex').toUpperCase()}`,
          activation_token: randomBytes(16).toString('hex'),
          color: before.color as CardColor,
          status: 'ready_to_ship' as const,
          organization_id: before.organization_id,
        }));

        await supabase.from('cards').insert(cardsToInsert);
      }
    }

    if (newStatus === 'shipped') {
      await supabase
        .from('cards')
        .update({ status: 'shipped', shipped_at: new Date().toISOString() })
        .eq('batch_id', batchId)
        .eq('status', 'ready_to_ship');
    }

    await writeAuditLog(
      supabase,
      userId,
      'advance_manufacturing_batch',
      'manufacturing_batches',
      batchId,
      before,
      after,
    );
    revalidatePath('/admin/manufacturing');
    return { success: true };
  } catch {
    return { success: false, message: 'Could not update manufacturing batch.' };
  }
}
