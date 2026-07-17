// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://connectcards.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/pricing`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${APP_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/themes`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/legal/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${APP_URL}/legal/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('slug, updated_at')
      .eq('is_published', true)
      .is('deleted_at', null)
      .limit(5000);

    const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
      url: `${APP_URL}/${profile.slug}`,
      lastModified: profile.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...profileRoutes];
  } catch {
    // If the database is unreachable at build time, still ship a valid
    // sitemap with the static routes rather than failing the build.
    return staticRoutes;
  }
}
