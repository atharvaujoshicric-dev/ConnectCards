// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/security/api-response';

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('plans').select('id').limit(1);

    if (error) {
      return apiError('internal_error', 'Database connectivity check failed.');
    }

    return apiSuccess({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return apiError('internal_error', 'Health check failed.');
  }
}
