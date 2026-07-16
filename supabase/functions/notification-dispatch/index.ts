// supabase/functions/notification-dispatch/index.ts
// Single fan-out point for all notifications: writes the in-app
// notification row and sends a transactional email (respecting the
// recipient's notification_preferences) in one place, so notification
// logic is never duplicated across feature code.

import { getSupabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabase-admin.ts';

type NotificationType =
  | 'order_status_changed'
  | 'new_lead'
  | 'subscription_renewed'
  | 'subscription_payment_failed'
  | 'card_activated'
  | 'employee_invited'
  | 'seat_limit_reached'
  | 'card_frozen';

interface DispatchRequestBody {
  user_id: string;
  organization_id?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

const EMAIL_PREFERENCE_KEY_BY_TYPE: Record<NotificationType, string | null> = {
  order_status_changed: 'email_order_updates',
  new_lead: 'email_new_lead',
  subscription_renewed: 'email_billing',
  subscription_payment_failed: 'email_billing',
  card_activated: 'email_order_updates',
  employee_invited: null, // always sent, not user-preference-gated
  seat_limit_reached: 'email_billing',
  card_frozen: 'email_order_updates',
};

Deno.serve(async (req: Request) => {
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== Deno.env.get('CRON_SECRET')) {
    return errorResponse('unauthorized', 401);
  }

  if (req.method !== 'POST') {
    return errorResponse('method_not_allowed', 405);
  }

  const body: DispatchRequestBody = await req.json();
  if (!body.user_id || !body.type || !body.title) {
    return errorResponse('missing_required_fields', 422);
  }

  const supabase = getSupabaseAdmin();

  const { error: insertError } = await supabase.from('notifications').insert({
    user_id: body.user_id,
    organization_id: body.organization_id ?? null,
    type: body.type,
    title: body.title,
    body: body.body ?? null,
    metadata: body.metadata ?? {},
  });

  if (insertError) {
    console.error('Failed to insert notification', insertError);
    return errorResponse('internal_error', 500);
  }

  const preferenceKey = EMAIL_PREFERENCE_KEY_BY_TYPE[body.type];
  let shouldEmail = true;

  if (preferenceKey) {
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select(preferenceKey)
      .eq('user_id', body.user_id)
      .maybeSingle();

    shouldEmail = prefs ? Boolean((prefs as Record<string, boolean>)[preferenceKey]) : true;
  }

  if (shouldEmail) {
    const { data: userData } = await supabase.auth.admin.getUserById(body.user_id);
    const toEmail = userData?.user?.email;

    if (toEmail) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${Deno.env.get('EMAIL_FROM_NAME') ?? 'Connect Cards'} <${
              Deno.env.get('EMAIL_FROM_ADDRESS') ?? 'hello@connectcards.app'
            }>`,
            to: toEmail,
            subject: body.title,
            html: `<p>${body.body ?? body.title}</p>`,
          }),
        });
      }
    }
  }

  return jsonResponse({ dispatched: true, emailed: shouldEmail });
});
