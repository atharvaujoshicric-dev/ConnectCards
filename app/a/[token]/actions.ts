// app/a/[token]/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { activateCard } from '@/lib/services/cards';

export interface ActivateCardState {
  status: 'idle' | 'error';
  message?: string;
}

export async function activateCardAction(
  activationToken: string,
  _prevState: ActivateCardState,
): Promise<ActivateCardState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect_to=${encodeURIComponent(`/a/${activationToken}`)}`);
  }

  try {
    const card = await activateCard(supabase, activationToken, user.id);

    // If this was an individual (non-org-assigned) card, the newly bound
    // owner has no profile yet on first activation — send them to
    // onboarding. Returning activations skip straight to the dashboard.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      redirect(`/onboarding?card=${card.id}`);
    }

    redirect('/dashboard?activated=true');
  } catch (err) {
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
      throw err;
    }

    const message = mapActivationError(err);
    return { status: 'error', message };
  }
}

function mapActivationError(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'unknown_error';

  if (raw.includes('card_already_activated')) {
    return 'This card has already been activated on another account.';
  }
  if (raw.includes('invalid_activation_token')) {
    return 'We could not find a card matching this link.';
  }
  if (raw.includes('employee_email_mismatch')) {
    return 'This card was issued to a different email address. Please log in with the email your organization invited.';
  }
  if (raw.includes('card_not_shippable_state')) {
    return 'This card is not yet ready to activate. Please contact support.';
  }

  return 'Something went wrong activating your card. Please try again or contact support.';
}
