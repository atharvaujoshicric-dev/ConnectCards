// lib/services/cards.ts
// Business logic for card activation, freezing, and QR code generation.
// Binding mutations always go through the SECURITY DEFINER RPCs
// (activate_card / freeze_card) — this module never issues a raw UPDATE
// against cards for ownership fields.

import 'server-only';
import QRCode from 'qrcode';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Card, CardStatus, CardColor } from '@/types/database.types';

export interface CardLookupResult {
  id: string;
  status: CardStatus;
  color: CardColor;
  bound_profile_slug: string | null;
}

export async function lookupCardByToken(
  supabase: SupabaseClient<Database>,
  activationToken: string,
): Promise<CardLookupResult | null> {
  const { data, error } = await supabase.rpc('get_card_by_token', {
    p_activation_token: activationToken,
  });

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function activateCard(
  supabase: SupabaseClient<Database>,
  activationToken: string,
  userId: string,
): Promise<Card> {
  const { data, error } = await supabase.rpc('activate_card', {
    p_activation_token: activationToken,
    p_user_id: userId,
  });

  if (error || !data) {
    throw new Error(error?.message ?? 'card_activation_failed');
  }

  return data;
}

export async function freezeCard(
  supabase: SupabaseClient<Database>,
  cardId: string,
  reason: string,
): Promise<Card> {
  const { data, error } = await supabase.rpc('freeze_card', {
    p_card_id: cardId,
    p_reason: reason,
  });

  if (error || !data) {
    throw new Error(error?.message ?? 'card_freeze_failed');
  }

  return data;
}

/**
 * Generates a QR code (as a data URL) for a given target URL. Used both
 * at manufacturing time (encoding the activation URL) and post-activation
 * (encoding the permanent profile URL for redisplay/export).
 */
export async function generateQrCodeDataUrl(targetUrl: string): Promise<string> {
  return QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: { dark: '#111111', light: '#FFFFFF' },
  });
}

export function buildActivationUrl(activationToken: string, appUrl: string): string {
  return `${appUrl}/a/${activationToken}`;
}

export function buildProfileUrl(slug: string, appUrl: string): string {
  return `${appUrl}/${slug}`;
}
