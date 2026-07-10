// lib/supabase/server.ts
// Server-side Supabase client for use in Server Components, Route
// Handlers, and Server Actions. Reads/writes auth cookies via Next.js's
// cookies() API so sessions persist correctly across the App Router.

import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // The `setAll` method was called from a Server Component that
            // cannot set cookies (e.g. during static rendering). This is
            // safe to ignore as long as middleware.ts is refreshing the
            // session on every navigable request.
          }
        },
      },
    },
  );
}

/**
 * Service-role client for privileged server-only operations (e.g. admin
 * dashboards reading across tenants, or scripts). NEVER expose this to
 * any client-reachable code path — it bypasses RLS entirely.
 */
export function createServiceRoleClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
