// app/(marketing)/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardVisual } from '@/components/marketing/card-visual';

const CARD_COLORS = [
  { key: 'gold', label: 'Gold', hex: '#C9A24B', note: 'For the deal you want remembered.' },
  { key: 'silver', label: 'Silver', hex: '#B8BCC2', note: 'For everyday, every meeting.' },
  { key: 'rose_gold', label: 'Rose Gold', hex: '#C98A7A', note: 'For studios, creators, agencies.' },
  { key: 'black', label: 'Black', hex: '#1A1A1D', note: 'For founders, counsel, consultants.' },
] as const;

const AUDIENCES = [
  'Lawyers', 'Doctors', 'Architects', 'Restaurants', 'Agencies', 'Consultants', 'Students', 'Creators',
];

const FEATURES = [
  {
    title: 'Tap, don’t fumble',
    body: 'Hold the card near any phone. Your profile opens instantly — no app required on the other end.',
  },
  {
    title: 'One link for everything',
    body: 'Portfolio, socials, WhatsApp, maps, a brochure download — all behind a single tap or QR scan.',
  },
  {
    title: 'Leads land in a pipeline, not a pocket',
    body: 'Every scan can capture a lead. Follow up from a real dashboard instead of a stack of cards on your desk.',
  },
  {
    title: 'Built for teams, not just individuals',
    body: 'Issue branded cards company-wide, manage departments, and see organization-level analytics.',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container grid gap-12 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Metal NFC cards &middot; Digital identity platform
          </p>
          <h1 className="text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            One tap.
            <br />
            Your whole identity.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Connect Cards replaces the paper business card with a premium metal one — and a
            digital profile behind it that captures every lead it creates.
          </p>
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
        </div>

        <div className="flex justify-center md:justify-end">
          <CardVisual finish="black" />
        </div>
      </section>

      {/* Card color / tier device — literal to the product, not decorative numbering */}
      <section className="border-y border-border/60 bg-secondary/30 py-16">
        <div className="container">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Four finishes. One activation.
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Every card ships inert until you claim it. Tap once to bind it permanently to your
            account — no reselling ambiguity, no re-linking later.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARD_COLORS.map((color) => (
              <div
                key={color.key}
                className="rounded-xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-md"
              >
                <span
                  className="mb-4 block h-10 w-10 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden
                />
                <p className="font-display font-semibold">{color.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{color.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="max-w-xl text-balance font-display text-3xl font-semibold tracking-tight">
          Superior to Popl, HiHello, Mobilo, and Dot Cards — on purpose.
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audiences */}
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

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="mx-auto max-w-lg text-balance font-display text-3xl font-semibold tracking-tight">
          Stop handing out paper that gets thrown away.
        </h2>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" variant="accent" asChild>
            <Link href="/order">Order your card</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
