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

export const passwordSignUpSchema = z
  .object({
    email: z.string().email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password must be 72 characters or fewer.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const passwordSignInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type EmailOtpRequestInput = z.infer<typeof emailOtpRequestSchema>;
export type EmailOtpVerifyInput = z.infer<typeof emailOtpVerifySchema>;
export type PasswordSignUpInput = z.infer<typeof passwordSignUpSchema>;
export type PasswordSignInInput = z.infer<typeof passwordSignInSchema>;
