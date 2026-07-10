// app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OtpForm } from '@/components/auth/otp-form';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your Connect Cards account.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
