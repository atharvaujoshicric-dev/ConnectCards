// components/profile/analytics-beacon.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AnalyticsSource } from '@/types/database.types';

/**
 * Fires exactly one `profile_view` (or `nfc_tap` / `qr_scan`, inferred
 * from the `?src=` query param that the card/QR URL encodes) analytics
 * event per page load. Renders nothing — mount-and-forget.
 */
export function AnalyticsBeacon({ profileId }: { profileId: string }) {
  const searchParams = useSearchParams();
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const sourceParam = searchParams.get('src');
    const source: AnalyticsSource =
      sourceParam === 'nfc' || sourceParam === 'qr' || sourceParam === 'share'
        ? sourceParam
        : sourceParam === 'link'
          ? 'link'
          : 'direct';

    const eventType = source === 'nfc' ? 'nfc_tap' : source === 'qr' ? 'qr_scan' : 'profile_view';

    const deviceType = /Mobi|Android/i.test(navigator.userAgent)
      ? 'mobile'
      : /Tablet|iPad/i.test(navigator.userAgent)
        ? 'tablet'
        : 'desktop';

    const supabase = createClient();
    void supabase.rpc('record_analytics_event', {
      p_profile_id: profileId,
      p_event_type: eventType,
      p_source: source,
      p_referrer: document.referrer || null,
      p_device_type: deviceType,
      p_country: null,
      p_city: null,
    });
  }, [profileId, searchParams]);

  return null;
}
