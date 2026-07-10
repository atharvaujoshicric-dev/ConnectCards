// lib/validation/auth.ts
import { z } from 'zod';

export const emailOtpRequestSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export const emailOtpVerifySchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  token: z
    .string()
    .length(6, 'Enter the 6-digit code we emailed you.')
    .regex(/^\d{6}$/, 'Code must be numeric.'),
});

export type EmailOtpRequestInput = z.infer<typeof emailOtpRequestSchema>;
export type EmailOtpVerifyInput = z.infer<typeof emailOtpVerifySchema>;
