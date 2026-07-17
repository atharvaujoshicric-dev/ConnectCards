// lib/services/profiles.ts
// Read-side queries for rendering a public profile page: the profile
// itself plus its theme, social links, and gallery in one shape the page
// component can render directly.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Profile, SocialLink, GalleryItem, Theme } from '@/types/database.types';

export interface PublicProfileBundle {
  profile: Profile;
  theme: Theme | null;
  socialLinks: SocialLink[];
  galleryItems: GalleryItem[];
}

export async function getPublicProfileBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<PublicProfileBundle | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: theme }, { data: socialLinks }, { data: galleryItems }] = await Promise.all([
    profile.theme_id
      ? supabase.from('themes').select('*').eq('id', profile.theme_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('social_links').select('*').eq('profile_id', profile.id).order('sort_order'),
    supabase.from('gallery_items').select('*').eq('profile_id', profile.id).order('sort_order'),
  ]);

  return {
    profile,
    theme: theme ?? null,
    socialLinks: socialLinks ?? [],
    galleryItems: galleryItems ?? [],
  };
}

export function buildVCard(profile: Profile): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.full_name}`,
    profile.job_title ? `TITLE:${profile.job_title}` : null,
    profile.company_name ? `ORG:${profile.company_name}` : null,
    profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : null,
    profile.email ? `EMAIL:${profile.email}` : null,
    profile.website_url ? `URL:${profile.website_url}` : null,
    'END:VCARD',
  ].filter(Boolean);

  return lines.join('\r\n');
}
