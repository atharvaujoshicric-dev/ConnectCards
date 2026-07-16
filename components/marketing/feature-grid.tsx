// components/marketing/feature-grid.tsx
import { Smartphone, Link2, Inbox, Users2, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: Smartphone,
    title: 'Tap, don\u2019t fumble',
    body: 'Hold the card near any phone. Your profile opens instantly \u2014 no app required on either end.',
  },
  {
    icon: Link2,
    title: 'One link for everything',
    body: 'Portfolio, socials, WhatsApp, maps, a brochure download \u2014 all behind a single tap or QR scan.',
  },
  {
    icon: Inbox,
    title: 'Leads land in a pipeline',
    body: 'Every scan can capture a lead. Follow up from a real dashboard instead of a stack of cards on your desk.',
  },
  {
    icon: Users2,
    title: 'Built for teams',
    body: 'Issue branded cards company-wide, manage departments, and see organization-level analytics.',
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            <feature.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
        </div>
      ))}
    </div>
  );
}
