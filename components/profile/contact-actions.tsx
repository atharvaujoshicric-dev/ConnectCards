// components/profile/contact-actions.tsx
import { Phone, Mail, MessageCircle, Globe, MapPin, Download, FileText } from 'lucide-react';
import type { Profile } from '@/types/database.types';

interface ContactActionsProps {
  profile: Profile;
  hasProBrochure: boolean;
}

export function ContactActions({ profile, hasProBrochure }: ContactActionsProps) {
  const actions = [
    profile.phone && {
      href: `tel:${profile.phone}`,
      label: 'Call',
      icon: Phone,
    },
    profile.email && {
      href: `mailto:${profile.email}`,
      label: 'Email',
      icon: Mail,
    },
    profile.whatsapp_number && {
      href: `https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`,
      label: 'WhatsApp',
      icon: MessageCircle,
    },
    profile.website_url && {
      href: profile.website_url,
      label: 'Website',
      icon: Globe,
    },
    profile.map_address && {
      href: `https://maps.google.com/?q=${encodeURIComponent(profile.map_address)}`,
      label: 'Directions',
      icon: MapPin,
    },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: typeof Phone }>;

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <a
          key={action.label}
          href={action.href}
          target={action.href.startsWith('http') ? '_blank' : undefined}
          rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--profile-fg)]/15 bg-[color:var(--profile-fg)]/5 px-4 py-3 text-sm font-medium transition-transform active:scale-95"
        >
          <action.icon className="h-4 w-4" />
          {action.label}
        </a>
      ))}

      <a
        href={`/${profile.slug}/vcf`}
        className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--profile-fg)]/15 bg-[color:var(--profile-fg)]/5 px-4 py-3 text-sm font-medium transition-transform active:scale-95"
      >
        <Download className="h-4 w-4" />
        Save contact
      </a>

      {hasProBrochure && (
        <a
          href={`/${profile.slug}/brochure`}
          className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--profile-fg)]/15 bg-[color:var(--profile-fg)]/5 px-4 py-3 text-sm font-medium transition-transform active:scale-95"
        >
          <FileText className="h-4 w-4" />
          Brochure
        </a>
      )}
    </div>
  );
}
