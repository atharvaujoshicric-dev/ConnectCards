// app/(marketing)/about/page.tsx
import type { Metadata } from 'next';
import { CardVisual } from '@/components/marketing/card-visual';

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Connect Cards exists, and what we’re building toward.',
};

export default function AboutPage() {
  return (
    <div className="container py-20">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Paper cards get thrown away. Ours don’t.
          </h1>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              Every professional has handed someone a paper card and watched it disappear into a
              pocket, never to be looked at again. We built Connect Cards because the handoff
              moment deserves better — for the person giving the card, and for the business
              trying to turn that moment into a real lead.
            </p>
            <p>
              A Connect Card is a premium metal card with an NFC chip inside. Tap it against any
              phone and a digital profile opens instantly — your contact details, your
              portfolio, your booking link, whatever you choose to show. Every tap and scan is
              tracked, every lead form submission lands in a real pipeline.
            </p>
            <p>
              We’re building toward something more complete than a link-in-bio tool: a full
              identity platform for individuals and the organizations that issue cards to their
              whole team — with the CRM, analytics, and management layer that a serious
              business actually needs.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <CardVisual finish="rose_gold" name="Studio Nine" title="Creative Direction" />
        </div>
      </div>

      <div className="mt-24 grid gap-10 border-t border-border/60 pt-16 sm:grid-cols-3">
        <div>
          <p className="font-display text-3xl font-semibold text-accent">4</p>
          <p className="mt-2 text-sm text-muted-foreground">Card finishes, one activation model</p>
        </div>
        <div>
          <p className="font-display text-3xl font-semibold text-accent">10k+</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Active users the platform is designed for at launch
          </p>
        </div>
        <div>
          <p className="font-display text-3xl font-semibold text-accent">0</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Paper cards left in a drawer, if we’ve done our job
          </p>
        </div>
      </div>
    </div>
  );
}
