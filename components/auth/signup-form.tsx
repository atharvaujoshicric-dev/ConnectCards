// components/auth/signup-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUpAction, type AuthActionState } from '@/(auth)/actions';
import { cn } from '@/lib/utils';

const INITIAL_STATE: AuthActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Creating account…' : 'Create account'}
    </button>
  );
}

export function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') ?? '/dashboard';

  const [state, formAction] = useActionState(signUpAction, INITIAL_STATE);

  if (state.status === 'check_email') {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set a password once — no codes, no links to click every time.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
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
            autoComplete="email"
            className={fieldClass(Boolean(state.fieldErrors?.email))}
          />
          {state.fieldErrors?.email?.map((error) => (
            <p key={error} className="mt-1 text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className={fieldClass(Boolean(state.fieldErrors?.password))}
          />
          {state.fieldErrors?.password?.map((error) => (
            <p key={error} className="mt-1 text-xs text-destructive">
              {error}
            </p>
          ))}
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={fieldClass(Boolean(state.fieldErrors?.confirmPassword))}
          />
          {state.fieldErrors?.confirmPassword?.map((error) => (
            <p key={error} className="mt-1 text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>

        {state.status === 'error' && state.message && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={`/login?redirect_to=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

function fieldClass(hasError: boolean): string {
  return cn(
    'w-full rounded-lg border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    hasError ? 'border-destructive' : 'border-input',
  );
}
