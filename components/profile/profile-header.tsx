// components/profile/profile-header.tsx
import Image from 'next/image';
import type { Profile } from '@/types/database.types';

export function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[color:var(--profile-bg)] shadow-lg">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[color:var(--profile-accent)] text-3xl font-semibold text-white">
            {getInitials(profile.full_name)}
          </div>
        )}
      </div>

      <h1 className="mt-4 font-display text-2xl font-semibold">{profile.full_name}</h1>
      {profile.job_title && (
        <p className="mt-1 text-sm opacity-80">
          {profile.job_title}
          {profile.company_name ? ` \u00b7 ${profile.company_name}` : ''}
        </p>
      )}
      {profile.bio && <p className="mt-4 max-w-sm text-sm opacity-80">{profile.bio}</p>}
    </div>
  );
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
