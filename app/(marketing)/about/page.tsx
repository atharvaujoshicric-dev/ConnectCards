// app/(marketing)/about/page.tsx
import type { Metadata } from 'next';
import { CardVisual } from '@/components/marketing/card-visual';
import { Reveal } from '@/components/marketing/reveal';

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Connect Cards exists, and what we’re building toward.',
};

export default function AboutPage() {
  return (
    <div className="container py-20">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <div>
          <Reveal>
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              Paper cards get thrown away. Ours don’t.
            </h1>
          </Reveal>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <Reveal delayMs={100}>
              <p>
                Every professional has handed someone a paper card and watched it disappear into a
                pocket, never to be looked at again. We built Connect Cards because the handoff
                moment deserves better — for the person giving the card, and for the business
                trying to turn that moment into a real lead.
              </p>
            </Reveal>
            <Reveal delayMs={200}>
              <p>
                A Connect Card is a premium metal card with an NFC chip inside. Tap it against any
                phone and a digital profile opens instantly — your contact details, your
                portfolio, your booking link, whatever you choose to show. Every tap and scan is
                tracked, every lead form submission lands in a real pipeline.
              </p>
            </Reveal>
            <Reveal delayMs={300}>
              <p>
                We’re building toward something more complete than a link-in-bio tool: a full
                identity platform for individuals and the organizations that issue cards to their
                whole team — with the CRM, analytics, and management layer that a serious
                business actually needs.
              </p>
            </Reveal>
          </div>
        </div>
        <Reveal delayMs={150} className="flex justify-center">
          <CardVisual finish="rose_gold" name="Studio Nine" title="Creative Direction" />
        </Reveal>
      </div>

      <div className="mt-24 grid gap-10 border-t border-border/60 pt-16 sm:grid-cols-3">
        {[
          { value: '4', label: 'Card finishes, one activation model' },
          { value: '10k+', label: 'Active users the platform is designed for at launch' },
          { value: '0', label: 'Paper cards left in a drawer, if we’ve done our job' },
        ].map((stat, index) => (
          <Reveal key={stat.value} delayMs={index * 100}>
            <div>
              <p className="font-display text-3xl font-semibold text-accent">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
