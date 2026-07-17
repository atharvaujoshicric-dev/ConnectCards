// components/order/razorpay-checkout-button.tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface RazorpayCheckoutButtonProps {
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function RazorpayCheckoutButton({
  orderId,
  totalAmount,
  customerName,
  customerEmail,
  customerPhone,
}: RazorpayCheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  async function handlePay() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const json = await response.json();

      if (json.error) {
        setError(json.error.message);
        setIsLoading(false);
        return;
      }

      const { orderId: razorpayOrderId, amount, currency, keyId } = json.data;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'Connect Cards',
        description: 'Metal NFC card order',
        order_id: razorpayOrderId,
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        theme: { color: '#C9A24B' },
        handler: () => {
          router.push(`/order/${orderId}/checkout?status=processing`);
          router.refresh();
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setError('Could not start checkout. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />
      <button
        type="button"
        disabled={!scriptReady || isLoading}
        onClick={handlePay}
        className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        {isLoading ? 'Opening payment…' : `Pay ${formatCurrency(totalAmount)}`}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
