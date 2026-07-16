// lib/entitlements/index.ts
// Single source of truth for feature gating. Reads the `entitlements`
// Postgres view (derived from subscriptions + plans) so no component or
// route handler ever hand-rolls `if (plan === 'pro')` logic directly.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Entitlement, PlanTier } from '@/types/database.types';

export type FeatureFlag =
  | 'gallery'
  | 'lead_forms'
  | 'advanced_analytics'
  | 'remove_branding'
  | 'org_dashboard'
  | 'employee_cards'
  | 'crm_export'
  | 'api_access'
  | 'white_label'
  | 'custom_domain'
  | 'sso';

const FREE_TIER_ENTITLEMENT: Entitlement = {
  subscription_id: 'free-tier',
  user_id: null,
  organization_id: null,
  tier: 'free',
  feature_flags: { themes: 3, gallery: false, lead_forms: false, advanced_analytics: false, remove_branding: false },
  status: 'active',
  current_period_end: '9999-12-31T23:59:59.000Z',
  seats: 1,
};

export async function getUserEntitlement(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Entitlement> {
  const { data } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return data ?? { ...FREE_TIER_ENTITLEMENT, user_id: userId };
}

export async function getOrganizationEntitlement(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<Entitlement> {
  const { data } = await supabase
    .from('entitlements')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  return data ?? { ...FREE_TIER_ENTITLEMENT, organization_id: organizationId, tier: 'business' };
}

export function hasFeature(entitlement: Entitlement, feature: FeatureFlag): boolean {
  const flag = entitlement.feature_flags[feature];
  return flag === true || flag === 'unlimited';
}

export function themeLimit(entitlement: Entitlement): number | 'unlimited' {
  const flag = entitlement.feature_flags['themes'];
  if (flag === 'unlimited') return 'unlimited';
  return typeof flag === 'number' ? flag : 3;
}

export function tierAtLeast(tier: PlanTier, minimum: PlanTier): boolean {
  const order: PlanTier[] = ['free', 'pro', 'business', 'enterprise'];
  return order.indexOf(tier) >= order.indexOf(minimum);
}
