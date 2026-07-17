// app/[slug]/vcf/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildVCard } from '@/lib/services/profiles';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });
  }

  await supabase.rpc('record_analytics_event', {
    p_profile_id: profile.id,
    p_event_type: 'vcf_download',
    p_source: 'direct',
    p_referrer: null,
    p_device_type: null,
    p_country: null,
    p_city: null,
  });

  const vCardContent = buildVCard(profile);

  return new NextResponse(vCardContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.slug}.vcf"`,
    },
  });
}
