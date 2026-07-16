// lib/validation/order.ts
import { z } from 'zod';

const phoneRegex = /^\+?[1-9][0-9]{7,14}$/;

export const shippingAddressSchema = z.object({
  shippingName: z.string().min(1, 'Full name is required.').max(120),
  shippingPhone: z.string().regex(phoneRegex, 'Enter a valid phone number with country code.'),
  shippingAddressLine1: z.string().min(1, 'Address is required.').max(200),
  shippingAddressLine2: z.string().max(200).optional().or(z.literal('')),
  shippingCity: z.string().min(1, 'City is required.').max(80),
  shippingState: z.string().min(1, 'State is required.').max(80),
  shippingPostalCode: z
    .string()
    .min(3, 'Enter a valid postal code.')
    .max(12, 'Enter a valid postal code.'),
  shippingCountry: z.string().length(2, 'Use a 2-letter country code (e.g. IN).').default('IN'),
});

export const orderItemInputSchema = z.object({
  cardColor: z.enum(['gold', 'silver', 'rose_gold', 'black']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1.').max(10000),
});

export const createOrderSchema = z.object({
  orderType: z.enum(['individual', 'organization']),
  organizationId: z.string().uuid().optional(),
  items: z.array(orderItemInputSchema).min(1, 'Add at least one card to your order.'),
  couponCode: z.string().max(40).optional(),
  shipping: shippingAddressSchema,
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
