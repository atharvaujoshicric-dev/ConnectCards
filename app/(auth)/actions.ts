// app/(auth)/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { passwordSignUpSchema, passwordSignInSchema } from '@/lib/validation/auth';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

export interface AuthActionState {
  status: 'idle' | 'check_email' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordSignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { success } = await rateLimit(`signup:${parsed.data.email}`, RATE_LIMITS.PASSWORD_SIGNUP);
  if (!success) {
    return {
      status: 'error',
      message: 'Too many attempts. Please wait a few minutes before trying again.',
    };
  }

  const redirectTo = String(formData.get('redirect_to') ?? '') || '/dashboard';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    const message =
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('already exists')
        ? 'An account with that email already exists. Try logging in instead.'
        : 'We could not create your account. Please try again.';
    return { status: 'error', message };
  }

  // If "Confirm email" is disabled in Supabase Auth settings, signUp
  // returns an active session immediately and the user can go straight
  // in. If confirmation is required, there is no session yet and the
  // user must click the link we just emailed them.
  if (data.session) {
    redirect(redirectTo);
  }

  return {
    status: 'check_email',
    message: 'Check your email to confirm your account, then log in.',
  };
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordSignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { success } = await rateLimit(`signin:${parsed.data.email}`, RATE_LIMITS.PASSWORD_SIGNIN);
  if (!success) {
    return {
      status: 'error',
      message: 'Too many attempts. Please wait a few minutes before trying again.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const message = error.message.toLowerCase().includes('email not confirmed')
      ? 'Please confirm your email first — check your inbox for the confirmation link.'
      : 'Incorrect email or password.';
    return { status: 'error', message };
  }

  const redirectTo = String(formData.get('redirect_to') ?? '') || '/dashboard';
  redirect(redirectTo);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
