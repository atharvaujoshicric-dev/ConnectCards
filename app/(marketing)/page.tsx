// app/(marketing)/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { HeroStory } from '@/components/marketing/hero-story';
import { Reveal } from '@/components/marketing/reveal';

const CARD_COLORS = [
  { key: 'gold', label: 'Gold', hex: '#C9A24B', note: 'For the deal you want remembered.' },
  { key: 'silver', label: 'Silver', hex: '#B8BCC2', note: 'For everyday, every meeting.' },
  { key: 'rose_gold', label: 'Rose Gold', hex: '#C98A7A', note: 'For studios, creators, agencies.' },
  { key: 'black', label: 'Black', hex: '#1A1A1D', note: 'For founders, counsel, consultants.' },
] as const;

const AUDIENCES = [
  'Lawyers', 'Doctors', 'Architects', 'Restaurants', 'Agencies', 'Consultants', 'Students', 'Creators',
];

export default function LandingPage() {
  return (
    <>
      {/* Chapter 1: the personalized hero — pick who you are, the story adapts */}
      <HeroStory />

      {/* Chapter 2: the problem this replaces */}
      <Reveal>
        <section className="border-y border-border/60 bg-secondary/20 py-16">
          <div className="container">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The problem
            </p>
            <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight">
              You&apos;ve handed someone a paper card and watched it disappear into a pocket,
              never to be looked at again.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The handoff moment deserves better — for you, and for the lead you just lost the
              second that card hit a drawer.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Chapter 3: the tap moment — card colors as the physical device */}
      <Reveal>
        <section className="py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Four finishes. One activation.
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Every card ships inert until you claim it. Tap once to bind it permanently to your
              account — no reselling ambiguity, no re-linking later.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CARD_COLORS.map((color, index) => (
                <Reveal key={color.key} delayMs={index * 75}>
                  <div className="rounded-xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-md">
                    <span
                      className="mb-4 block h-10 w-10 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden
                    />
                    <p className="font-display font-semibold">{color.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{color.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Chapter 4: how the story continues after the tap */}
      <Reveal>
        <section className="border-t border-border/60 bg-secondary/20 py-20">
          <div className="container">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              What happens next
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold tracking-tight">
              From order to first tap in three steps.
            </h2>
            <div className="mt-12">
              <HowItWorks />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Chapter 5: your identity, fully realized */}
      <Reveal>
        <section className="py-20">
          <div className="container">
            <h2 className="max-w-xl text-balance font-display text-3xl font-semibold tracking-tight">
              Superior to Popl, HiHello, Mobilo, and Dot Cards — on purpose.
            </h2>
            <div className="mt-12">
              <FeatureGrid />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Chapter 6: who else is in this story */}
      <Reveal>
        <section className="border-t border-border/60 py-16">
          <div className="container">
            <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Built for
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {AUDIENCES.map((audience) => (
                <span key={audience} className="font-display text-xl text-muted-foreground/70">
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Chapter 7: the decision */}
      <Reveal>
        <section className="relative overflow-hidden py-24 text-center">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 700px 350px at 50% 100%, rgba(201,162,75,0.12), transparent 70%)',
            }}
            aria-hidden
          />
          <div className="container">
            <h2 className="mx-auto max-w-lg text-balance font-display text-4xl font-semibold tracking-tight">
              Stop handing out paper that gets thrown away.
            </h2>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link href="/order">Order your card</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
