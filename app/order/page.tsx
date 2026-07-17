// app/order/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { OrderForm } from '@/components/order/order-form';

export const metadata: Metadata = {
  title: 'Order your card',
  description: 'Order a premium metal NFC card in Gold, Silver, Rose Gold, or Black.',
};

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container">
        <Link href="/" className="mb-8 inline-block font-display text-lg font-semibold tracking-tight">
          Connect<span className="text-accent">Cards</span>
        </Link>

        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Order your card</h1>
          <p className="mt-2 text-muted-foreground">
            &#8377;1,500 per card, or &#8377;1,300 per card at 20 or more.
          </p>
          <div className="mt-8">
            <OrderForm />
          </div>
        </div>
      </div>
    </div>
  );
}
