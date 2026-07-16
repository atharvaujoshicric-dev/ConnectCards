// app/(dashboard)/dashboard/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUserEntitlement, hasFeature } from '@/lib/entitlements';
import { BasicInfoForm } from '@/components/profile-builder/basic-info-form';
import { ContactExtrasForm } from '@/components/profile-builder/contact-extras-form';
import { SocialLinksEditor } from '@/components/profile-builder/social-links-editor';
import { PublishToggle } from '@/components/profile-builder/publish-toggle';

export default async function ProfileBuilderPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  const [{ data: socialLinks }, entitlement] = await Promise.all([
    supabase.from('social_links').select('*').eq('profile_id', profile.id).order('sort_order'),
    getUserEntitlement(supabase, user.id),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Profile builder</h1>
        <p className="mt-1 text-muted-foreground">
          This is what people see the moment they tap your card.
        </p>
      </div>

      <PublishToggle initialValue={profile.is_published} />

      <Section title="Basic information">
        <BasicInfoForm profile={profile} />
      </Section>

      <Section title="Contact & links">
        <ContactExtrasForm profile={profile} isProOrAbove={hasFeature(entitlement, 'gallery')} />
      </Section>

      <Section title="Social links">
        <SocialLinksEditor links={socialLinks ?? []} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
