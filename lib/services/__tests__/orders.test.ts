// lib/services/__tests__/orders.test.ts
import { describe, it, expect } from 'vitest';
import { calculateOrderPricing } from '@/lib/services/orders';

describe('calculateOrderPricing', () => {
  it('charges the standard rate below the MOQ threshold', () => {
    const result = calculateOrderPricing([{ cardColor: 'black', quantity: 5 }]);

    expect(result.items[0].unitPrice).toBe(1500);
    expect(result.subtotal).toBe(7500);
  });

  it('charges the bulk rate at exactly 20 units', () => {
    const result = calculateOrderPricing([{ cardColor: 'gold', quantity: 20 }]);

    expect(result.items[0].unitPrice).toBe(1300);
    expect(result.subtotal).toBe(26000);
  });

  it('charges the bulk rate above the MOQ threshold', () => {
    const result = calculateOrderPricing([{ cardColor: 'silver', quantity: 50 }]);

    expect(result.items[0].unitPrice).toBe(1300);
    expect(result.subtotal).toBe(65000);
  });

  it('applies a percentage discount before calculating GST', () => {
    const result = calculateOrderPricing([{ cardColor: 'black', quantity: 1 }], 10);

    expect(result.subtotal).toBe(1500);
    expect(result.discount).toBe(150);
    // Taxable amount is 1350; GST at 18% = 243
    expect(result.tax).toBe(243);
    expect(result.total).toBe(1350 + 243);
  });

  it('sums multiple line items independently', () => {
    const result = calculateOrderPricing([
      { cardColor: 'gold', quantity: 3 },
      { cardColor: 'black', quantity: 25 },
    ]);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].unitPrice).toBe(1500); // 3 units, below MOQ
    expect(result.items[1].unitPrice).toBe(1300); // 25 units, at/above MOQ
    expect(result.subtotal).toBe(3 * 1500 + 25 * 1300);
  });

  it('returns zero discount and tax correctly for a zero-discount order', () => {
    const result = calculateOrderPricing([{ cardColor: 'rose_gold', quantity: 1 }], 0);

    expect(result.discount).toBe(0);
    expect(result.tax).toBe(Math.round(1500 * 0.18));
  });
});
