// components/marketing/trust-badges.tsx
import { Check } from 'lucide-react';

const BADGES = ['No app required', 'Works on iPhone & Android', '60-second activation'];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {BADGES.map((badge) => (
        <span key={badge} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-accent" />
          {badge}
        </span>
      ))}
    </div>
  );
}
