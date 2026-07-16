// components/marketing/hero-story.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scale, Stethoscope, Building2, Palette, Briefcase, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardVisual } from '@/components/marketing/card-visual';
import { TrustBadges } from '@/components/marketing/trust-badges';
import { cn } from '@/lib/utils';

interface Persona {
  key: string;
  label: string;
  icon: LucideIcon;
  finish: 'gold' | 'silver' | 'rose_gold' | 'black';
  headline: string;
  body: string;
  cardName: string;
  cardTitle: string;
}

const PERSONAS: Persona[] = [
  {
    key: 'default',
    label: "I'm exploring",
    icon: Briefcase,
    finish: 'black',
    headline: 'Your whole identity.',
    body: 'Connect Cards replaces the paper business card with a premium metal one — and a digital profile behind it that captures every lead it creates.',
    cardName: 'Jane Doe',
    cardTitle: 'Principal Architect',
  },
  {
    key: 'lawyer',
    label: 'Lawyer',
    icon: Scale,
    finish: 'black',
    headline: 'Instant credibility.',
    body: 'Hand a client a card, not a stack of paper. They tap, see your credentials and practice areas, and book a consult — before they even sit down.',
    cardName: 'Advocate Rao',
    cardTitle: 'Senior Partner',
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    finish: 'silver',
    headline: 'Every patient, one tap away.',
    body: 'Share your clinic hours, WhatsApp line, and location instantly. No app to install, no number to type in wrong — just a tap.',
    cardName: 'Dr. Mehta',
    cardTitle: 'Consultant Physician',
  },
  {
    key: 'architect',
    label: 'Architect',
    icon: Building2,
    finish: 'rose_gold',
    headline: 'Your whole portfolio.',
    body: 'Your card opens straight into your project gallery. Clients see the work before they hear the pitch.',
    cardName: 'Jane Doe',
    cardTitle: 'Principal Architect',
  },
  {
    key: 'creator',
    label: 'Creator',
    icon: Palette,
    finish: 'rose_gold',
    headline: 'Your whole brand.',
    body: 'Every social, every link, every collab in one tap. Update it whenever your brand evolves — the card never needs reprinting.',
    cardName: 'Studio Nine',
    cardTitle: 'Creative Direction',
  },
];

export function HeroStory() {
  const [activeKey, setActiveKey] = useState('default');
  const active = PERSONAS.find((p) => p.key === activeKey) ?? PERSONAS[0];

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]"
        style={{
          background:
            'radial-gradient(ellipse 800px 400px at 50% -10%, rgba(201,162,75,0.14), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="container pb-8 pt-16 md:pt-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Who&apos;s tapping in today?
        </p>
        <div className="flex flex-wrap gap-2">
          {PERSONAS.map((persona) => (
            <button
              key={persona.key}
              type="button"
              onClick={() => setActiveKey(persona.key)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                activeKey === persona.key
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground',
              )}
            >
              <persona.icon className="h-3.5 w-3.5" />
              {persona.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container grid gap-12 pb-20 pt-8 md:grid-cols-2 md:items-center">
        <div key={active.key} className="animate-fade-in">
          <h1 className="text-balance font-display text-5xl font-semibold leading-[1.03] tracking-tight md:text-7xl">
            One tap.
            <br />
            <span className="bg-gradient-to-r from-accent to-[#8A6A2E] bg-clip-text text-transparent">
              {active.headline}
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">{active.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="accent" asChild>
              <Link href="/order">Order your card — ₹1,500</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            ₹1,300 per card at 20+ &middot; Free plan included with every card
          </p>
          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative w-full max-w-md">
            <div
              className="pointer-events-none absolute inset-0 -z-10 scale-125 rounded-full opacity-60 blur-3xl transition-colors duration-500"
              style={{ background: 'radial-gradient(circle, rgba(201,162,75,0.35), transparent 70%)' }}
              aria-hidden
            />
            <div key={active.key} className="animate-fade-in">
              <CardVisual finish={active.finish} name={active.cardName} title={active.cardTitle} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
