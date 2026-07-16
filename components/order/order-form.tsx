// components/order/order-form.tsx
'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createOrderAction, type CreateOrderState } from '@/order/actions';
import { calculateCardUnitPrice, formatCurrency, cn } from '@/lib/utils';

const INITIAL_STATE: CreateOrderState = { status: 'idle' };

const CARD_COLORS = [
  { value: 'gold', label: 'Gold', hex: '#C9A24B' },
  { value: 'silver', label: 'Silver', hex: '#B8BCC2' },
  { value: 'rose_gold', label: 'Rose Gold', hex: '#C98A7A' },
  { value: 'black', label: 'Black', hex: '#1A1A1D' },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
    >
      {pending ? 'Placing order…' : 'Continue to payment'}
    </button>
  );
}

export function OrderForm() {
  const [color, setColor] = useState<(typeof CARD_COLORS)[number]['value']>('black');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'individual' | 'organization'>('individual');

  const [state, formAction] = useActionState(createOrderAction, INITIAL_STATE);

  const unitPrice = useMemo(() => calculateCardUnitPrice(quantity), [quantity]);
  const subtotal = unitPrice * quantity;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Order type</h2>
          <div className="flex gap-3">
            {(['individual', 'organization'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize',
                  orderType === type ? 'border-accent bg-accent/10' : 'border-border',
                )}
              >
                {type}
              </button>
            ))}
          </div>
          <input type="hidden" name="orderType" value={orderType} />
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Card color</h2>
          <div className="grid grid-cols-4 gap-3">
            {CARD_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  'rounded-lg border-2 p-3 text-center text-xs font-medium',
                  color === c.value ? 'border-accent' : 'border-transparent',
                )}
              >
                <span
                  className="mx-auto mb-2 block h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="cardColor" value={color} />

          <div className="mt-6">
            <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={10000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              20+ cards automatically unlock the &#8377;1,300/unit organization rate.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="shippingName" label="Full name" required error={state.fieldErrors?.shippingName?.[0]} />
            <TextField name="shippingPhone" label="Phone" type="tel" required error={state.fieldErrors?.shippingPhone?.[0]} />
            <TextField
              name="shippingAddressLine1"
              label="Address line 1"
              required
              className="sm:col-span-2"
              error={state.fieldErrors?.shippingAddressLine1?.[0]}
            />
            <TextField
              name="shippingAddressLine2"
              label="Address line 2 (optional)"
              className="sm:col-span-2"
            />
            <TextField name="shippingCity" label="City" required error={state.fieldErrors?.shippingCity?.[0]} />
            <TextField name="shippingState" label="State" required error={state.fieldErrors?.shippingState?.[0]} />
            <TextField
              name="shippingPostalCode"
              label="Postal code"
              required
              error={state.fieldErrors?.shippingPostalCode?.[0]}
            />
            <TextField name="shippingCountry" label="Country code" defaultValue="IN" required />
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Coupon</h2>
          <input
            name="couponCode"
            placeholder="Optional coupon code"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
          />
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-border/60 bg-secondary/30 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Order summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {quantity} &times; {CARD_COLORS.find((c) => c.value === color)?.label}
            </span>
            <span>{formatCurrency(unitPrice)} each</span>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-2 font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tax (GST 18%) and any discount are calculated at checkout.
          </p>
        </div>

        {state.status === 'error' && state.message && (
          <p className="mt-4 text-sm text-destructive">{state.message}</p>
        )}

        <div className="mt-6">
          <SubmitButton />
        </div>
      </aside>
    </form>
  );
}

function TextField({
  name,
  label,
  type = 'text',
  required,
  defaultValue,
  error,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
