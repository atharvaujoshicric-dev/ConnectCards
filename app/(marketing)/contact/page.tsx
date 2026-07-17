// app/(marketing)/contact/page.tsx
import type { Metadata } from 'next';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch about individual cards, bulk orders, or Enterprise/API access.',
};

export default function ContactPage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Talk to us</h1>
        <p className="mt-4 text-muted-foreground">
          Ordering for yourself, outfitting a whole team, or building on our API — tell us
          what you need and we’ll route it to the right person.
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
