// lib/supabase/client.ts
// Browser-side Supabase client for use in Client Components only.
// Uses the public anon key; RLS is the enforcement boundary, not this file.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
