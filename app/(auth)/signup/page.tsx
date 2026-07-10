// app/(auth)/signup/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OtpForm } from '@/components/auth/otp-form';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your Connect Cards account.',
};

export default function SignupPage() {
  // Email OTP handles both sign-up and log-in in one flow (shouldCreateUser
  // is true on the request), so this route intentionally renders the same
  // form as /login rather than duplicating logic.
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
