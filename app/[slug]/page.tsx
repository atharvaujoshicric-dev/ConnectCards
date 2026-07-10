// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPublicProfileBySlug } from '@/lib/services/profiles';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ContactActions } from '@/components/profile/contact-actions';
import { SocialLinks } from '@/components/profile/social-links';
import { Gallery } from '@/components/profile/gallery';
import { LeadForm } from '@/components/profile/lead-form';
import { AnalyticsBeacon } from '@/components/profile/analytics-beacon';

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_TOKENS = { bg: '#FFFFFF', fg: '#111111', accent: '#C9A24B', font: 'inter' };

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const bundle = await getPublicProfileBySlug(supabase, slug);

  if (!bundle) return { title: 'Profile not found' };

  const { profile } = bundle;
  const title = `${profile.full_name}${profile.job_title ? ` \u2014 ${profile.job_title}` : ''}`;

  return {
    title,
    description: profile.bio ?? `${profile.full_name}'s Connect Cards profile.`,
    openGraph: {
      title,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const bundle = await getPublicProfileBySlug(supabase, slug);

  if (!bundle) {
    notFound();
  }

  const { profile, theme, socialLinks, galleryItems } = bundle;
  const tokens = theme?.tokens ?? DEFAULT_TOKENS;
  const hasProFeatures = profile.plan !== 'free';

  return (
    <div
      className="min-h-screen py-12"
      style={
        {
          background: tokens.bg,
          color: tokens.fg,
          '--profile-bg': tokens.bg,
          '--profile-fg': tokens.fg,
          '--profile-accent': tokens.accent,
        } as React.CSSProperties
      }
    >
      <Suspense fallback={null}>
        <AnalyticsBeacon profileId={profile.id} />
      </Suspense>

      <div className="mx-auto w-full max-w-sm px-5">
        <ProfileHeader profile={profile} />

        <ContactActions profile={profile} hasProBrochure={hasProFeatures} />

        <SocialLinks links={socialLinks} />

        {hasProFeatures && <Gallery items={galleryItems} />}

        {hasProFeatures && <LeadForm profileId={profile.id} />}

        {!profile.branding_removed && (
          <p className="mt-10 text-center text-xs opacity-40">
            Made with Connect Cards
          </p>
        )}
      </div>
    </div>
  );
}
