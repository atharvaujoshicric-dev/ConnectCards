// components/profile/social-links.tsx
import {
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Github,
  Link as LinkIcon,
} from 'lucide-react';
import type { SocialLink } from '@/types/database.types';

const ICON_BY_PLATFORM: Record<string, typeof LinkIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  github: Github,
  tiktok: LinkIcon,
  behance: LinkIcon,
  dribbble: LinkIcon,
  custom: LinkIcon,
};

export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {links.map((link) => {
        const Icon = ICON_BY_PLATFORM[link.platform] ?? LinkIcon;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label ?? link.platform}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--profile-fg)]/15 bg-[color:var(--profile-fg)]/5 transition-transform hover:scale-105"
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
