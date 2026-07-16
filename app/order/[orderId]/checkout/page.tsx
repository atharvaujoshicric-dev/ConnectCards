// app/order/[orderId]/checkout/page.tsx
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getOrderWithItems } from '@/lib/services/orders';
import { RazorpayCheckoutButton } from '@/components/order/razorpay-checkout-button';
import { formatCurrency } from '@/lib/utils';

interface CheckoutPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { orderId } = await params;
  const { status } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect_to=/order/${orderId}/checkout`);
  }

  const bundle = await getOrderWithItems(supabase, orderId);

  if (!bundle || bundle.order.user_id !== user.id) {
    notFound();
  }

  const { order, items } = bundle;

  if (order.status === 'paid' || order.status === 'in_production' || status === 'processing') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          {order.status === 'pending_payment' ? 'Payment received' : 'Order confirmed'}
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          We are producing your card now. You will get an email with tracking as soon as it
          ships, and can activate it the moment it arrives.
        </p>
        <Link href="/dashboard" className="mt-6 text-sm font-medium text-accent">
          Go to dashboard &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-16">
      <div className="container max-w-lg">
        <Link href="/" className="mb-8 inline-block font-display text-lg font-semibold tracking-tight">
          Connect<span className="text-accent">Cards</span>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="font-display text-xl font-semibold">Complete your payment</h1>
          <p className="mt-1 text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>

          <ul className="mt-6 space-y-2 border-b border-border/60 pb-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="capitalize text-muted-foreground">
                  {item.quantity} &times; {item.card_color.replace('_', ' ')}
                </span>
                <span>{formatCurrency(item.line_total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          <div className="mt-6">
            <RazorpayCheckoutButton
              orderId={order.id}
              totalAmount={order.total_amount}
              customerName={order.shipping_name}
              customerEmail={user.email ?? ''}
              customerPhone={order.shipping_phone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
