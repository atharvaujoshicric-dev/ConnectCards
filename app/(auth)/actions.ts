// app/(auth)/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { emailOtpRequestSchema, emailOtpVerifySchema } from '@/lib/validation/auth';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

export interface OtpActionState {
  status: 'idle' | 'otp_sent' | 'error' | 'verified';
  email?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const OTP_INITIAL_STATE: OtpActionState = { status: 'idle' };

export async function requestOtp(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = emailOtpRequestSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { status: 'error', fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { success } = await rateLimit(`otp-request:${parsed.data.email}`, RATE_LIMITS.OTP_REQUEST);
  if (!success) {
    return {
      status: 'error',
      message: 'Too many attempts. Please wait a few minutes before trying again.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { status: 'error', message: 'We could not send that code. Please try again.' };
  }

  return { status: 'otp_sent', email: parsed.data.email };
}

export async function verifyOtp(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = emailOtpVerifySchema.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      email: String(formData.get('email') ?? ''),
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { success } = await rateLimit(`otp-verify:${parsed.data.email}`, RATE_LIMITS.OTP_VERIFY);
  if (!success) {
    return {
      status: 'error',
      email: parsed.data.email,
      message: 'Too many attempts. Please request a new code.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: 'email',
  });

  if (error) {
    return {
      status: 'error',
      email: parsed.data.email,
      message: 'That code did not work. Check it and try again, or request a new one.',
    };
  }

  const redirectTo = String(formData.get('redirect_to') ?? '') || '/dashboard';
  redirect(redirectTo);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
