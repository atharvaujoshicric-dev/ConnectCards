// components/marketing/plan-card.tsx
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PlanCardProps {
  tier: string;
  name: string;
  priceLabel: string;
  priceCaveat?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

export function PlanCard({
  name,
  priceLabel,
  priceCaveat,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlighted,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border p-8',
        highlighted
          ? 'border-accent bg-card shadow-[0_20px_45px_-20px_rgba(201,162,75,0.5)]'
          : 'border-border/60 bg-card',
      )}
    >
      {highlighted && (
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
          Most popular
        </span>
      )}
      <h3 className="font-display text-xl font-semibold">{name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-6">
        <span className="font-display text-3xl font-semibold">{priceLabel}</span>
        {priceCaveat && <p className="mt-1 text-xs text-muted-foreground">{priceCaveat}</p>}
      </div>

      <Button
        variant={highlighted ? 'accent' : 'outline'}
        className="mt-6"
        asChild
      >
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>

      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
