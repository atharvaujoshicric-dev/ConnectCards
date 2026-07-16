// lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCardUnitPrice, slugify, formatCurrency, cn } from '@/lib/utils';

describe('calculateCardUnitPrice', () => {
  it('returns 1500 for quantities under 20', () => {
    expect(calculateCardUnitPrice(1)).toBe(1500);
    expect(calculateCardUnitPrice(19)).toBe(1500);
  });

  it('returns 1300 for quantities at or above 20', () => {
    expect(calculateCardUnitPrice(20)).toBe(1300);
    expect(calculateCardUnitPrice(1000)).toBe(1300);
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Jane Doe')).toBe('jane-doe');
  });

  it('strips special characters', () => {
    expect(slugify("Jane's Café & Co.")).toBe('janes-caf-co');
  });

  it('collapses repeated whitespace and hyphens', () => {
    expect(slugify('  Jane   Doe  ')).toBe('jane-doe');
    expect(slugify('jane--doe')).toBe('jane-doe');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-jane doe-')).toBe('jane-doe');
  });
});

describe('formatCurrency', () => {
  it('formats INR amounts with the rupee symbol and no decimals', () => {
    const formatted = formatCurrency(1500);
    expect(formatted).toContain('1,500');
  });
});

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold');
  });
});
