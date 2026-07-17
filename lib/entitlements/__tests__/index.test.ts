// lib/entitlements/__tests__/index.test.ts
import { describe, it, expect } from 'vitest';
import { hasFeature, themeLimit, tierAtLeast } from '@/lib/entitlements';
import type { Entitlement } from '@/types/database.types';

function buildEntitlement(overrides: Partial<Entitlement> = {}): Entitlement {
  return {
    subscription_id: 'sub_1',
    user_id: 'user_1',
    organization_id: null,
    tier: 'free',
    feature_flags: { themes: 3, gallery: false },
    status: 'active',
    current_period_end: '9999-12-31T00:00:00.000Z',
    seats: 1,
    ...overrides,
  };
}

describe('hasFeature', () => {
  it('returns false for a flag set to false', () => {
    const entitlement = buildEntitlement({ feature_flags: { gallery: false } });
    expect(hasFeature(entitlement, 'gallery')).toBe(false);
  });

  it('returns true for a flag set to true', () => {
    const entitlement = buildEntitlement({ feature_flags: { gallery: true } });
    expect(hasFeature(entitlement, 'gallery')).toBe(true);
  });

  it('treats "unlimited" as truthy', () => {
    const entitlement = buildEntitlement({ feature_flags: { themes: 'unlimited' } });
    expect(hasFeature(entitlement, 'gallery' as never)).toBe(false);
    expect(entitlement.feature_flags.themes).toBe('unlimited');
  });

  it('returns false for a missing flag', () => {
    const entitlement = buildEntitlement({ feature_flags: {} });
    expect(hasFeature(entitlement, 'crm_export')).toBe(false);
  });
});

describe('themeLimit', () => {
  it('returns a numeric limit for Free-tier flags', () => {
    const entitlement = buildEntitlement({ feature_flags: { themes: 3 } });
    expect(themeLimit(entitlement)).toBe(3);
  });

  it('returns "unlimited" for Pro-tier flags', () => {
    const entitlement = buildEntitlement({ feature_flags: { themes: 'unlimited' } });
    expect(themeLimit(entitlement)).toBe('unlimited');
  });

  it('defaults to 3 when the flag is missing', () => {
    const entitlement = buildEntitlement({ feature_flags: {} });
    expect(themeLimit(entitlement)).toBe(3);
  });
});

describe('tierAtLeast', () => {
  it('orders tiers correctly', () => {
    expect(tierAtLeast('business', 'pro')).toBe(true);
    expect(tierAtLeast('pro', 'business')).toBe(false);
    expect(tierAtLeast('free', 'free')).toBe(true);
    expect(tierAtLeast('enterprise', 'business')).toBe(true);
  });
});
