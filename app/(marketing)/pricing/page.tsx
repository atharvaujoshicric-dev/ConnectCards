// app/(marketing)/pricing/page.tsx
import type { Metadata } from 'next';
import { PlanCard } from '@/components/marketing/plan-card';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Every card includes the Free plan. Upgrade to Pro, Business, or Enterprise as your identity and your team grow.',
};

const PLANS = [
  {
    tier: 'free',
    name: 'Free',
    priceLabel: 'Included',
    priceCaveat: 'With every card you buy',
    description: 'Everything you need the moment your card arrives.',
    features: [
      'Name, photo, phone, email',
      'QR code with unlimited scans',
      'Basic analytics',
      '3 curated themes',
    ],
    ctaLabel: 'Order a card',
    ctaHref: '/order',
    highlighted: false,
  },
  {
    tier: 'pro',
    name: 'Pro',
    priceLabel: '₹499/mo',
    priceCaveat: 'or ₹4,999/year',
    description: 'Turn your card into your whole professional presence.',
    features: [
      'Everything in Free',
      'Unlimited themes, dark mode, animations',
      'Gallery, portfolio, and website links',
      'WhatsApp, maps, VCF & PDF brochure',
      'Lead capture forms',
      'Advanced analytics',
      'Remove Connect Cards branding',
    ],
    ctaLabel: 'Upgrade to Pro',
    ctaHref: '/dashboard/billing?plan=pro',
    highlighted: true,
  },
  {
    tier: 'business',
    name: 'Business',
    priceLabel: '₹1,499/mo',
    priceCaveat: 'per seat, billed to your organization',
    description: 'Issue and manage cards for your whole team.',
    features: [
      'Everything in Pro',
      'Company dashboard & branding',
      'Employee cards & departments',
      'Bulk card management',
      'Organization-wide analytics',
      'Lead dashboard & CRM export',
    ],
    ctaLabel: 'Start a Business plan',
    ctaHref: '/org/new',
    highlighted: false,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Custom',
    priceCaveat: 'Talk to us for volume pricing',
    description: 'For companies that need Connect Cards inside their own systems.',
    features: [
      'Everything in Business',
      'Unlimited employees',
      'API access',
      'White label',
      'Custom domain',
      'SSO',
      'Priority support',
    ],
    ctaLabel: 'Contact sales',
    ctaHref: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Every card starts free. Grow into the rest.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Hardware is a one-time purchase. Subscriptions are what let your card do more —
          and they cancel any time, effective at the end of your paid period.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.tier} {...plan} />
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-3xl rounded-2xl border border-border/60 bg-secondary/30 p-8">
        <h2 className="font-display text-xl font-semibold">Card hardware pricing</h2>
        <p className="mt-2 text-muted-foreground">
          Metal NFC cards in Gold, Silver, Rose Gold, or Black.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-card p-5">
            <p className="font-display text-2xl font-semibold">₹1,500</p>
            <p className="text-sm text-muted-foreground">per card, standard order</p>
          </div>
          <div className="rounded-xl bg-card p-5">
            <p className="font-display text-2xl font-semibold">₹1,300</p>
            <p className="text-sm text-muted-foreground">per card at 20+ (organizations)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
