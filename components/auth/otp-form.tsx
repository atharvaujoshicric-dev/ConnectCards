// components/auth/otp-form.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { requestOtp, verifyOtp, type OtpActionState } from '@/(auth)/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const INITIAL_STATE: OtpActionState = { status: 'idle' };

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" className="w-full" disabled={pending}>
      {pending ? 'Please wait…' : children}
    </Button>
  );
}

export function OtpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') ?? '/dashboard';
  const callbackError = searchParams.get('error');

  const [requestState, requestAction] = useActionState(requestOtp, INITIAL_STATE);
  const [verifyState, verifyActionDispatch] = useActionState(verifyOtp, INITIAL_STATE);
  const [step, setStep] = useState<'email' | 'code'>('email');

  const activeState = step === 'email' ? requestState : verifyState;
  const email = verifyState.email ?? requestState.email;

  useEffect(() => {
    if (requestState.status === 'otp_sent' && step === 'email') {
      setStep('code');
    }
  }, [requestState.status, step]);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">
        {step === 'email' ? 'Log in or sign up' : 'Enter your code'}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 'email'
          ? 'We will email you a one-time code. No password needed.'
          : `We sent an email to ${email}. Enter the code below, or just click the "Sign in" link in that email — either works.`}
      </p>

      {callbackError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {callbackError}
        </p>
      )}

      {step === 'email' ? (
        <form action={requestAction} className="mt-6 space-y-4">
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className={inputClassName(Boolean(activeState.fieldErrors?.email))}
              aria-invalid={Boolean(activeState.fieldErrors?.email)}
            />
            {activeState.fieldErrors?.email?.map((error) => (
              <p key={error} className="mt-1 text-xs text-destructive">
                {error}
              </p>
            ))}
          </div>

          {activeState.status === 'error' && activeState.message && (
            <p role="alert" className="text-sm text-destructive">
              {activeState.message}
            </p>
          )}

          <SubmitButton>Send code</SubmitButton>
        </form>
      ) : (
        <form action={verifyActionDispatch} className="mt-6 space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div>
            <label htmlFor="token" className="mb-1.5 block text-sm font-medium">
              6-digit code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              autoFocus
              className={cn(inputClassName(Boolean(verifyState.fieldErrors?.token)), 'text-center font-mono text-lg tracking-[0.5em]')}
              aria-invalid={Boolean(verifyState.fieldErrors?.token)}
            />
            {verifyState.fieldErrors?.token?.map((error) => (
              <p key={error} className="mt-1 text-xs text-destructive">
                {error}
              </p>
            ))}
          </div>

          {verifyState.status === 'error' && verifyState.message && (
            <p role="alert" className="text-sm text-destructive">
              {verifyState.message}
            </p>
          )}

          <SubmitButton>Verify and continue</SubmitButton>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}

function inputClassName(hasError: boolean): string {
  return cn(
    'w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    hasError ? 'border-destructive' : 'border-input',
  );
}
