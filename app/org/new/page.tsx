// app/org/new/page.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createOrganizationAction, type CreateOrgState } from '@/org/new/actions';

const INITIAL_STATE: CreateOrgState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
    >
      {pending ? 'Creating…' : 'Create organization'}
    </button>
  );
}

export default function NewOrganizationPage() {
  const [state, formAction] = useActionState(createOrganizationAction, INITIAL_STATE);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <h1 className="font-display text-xl font-semibold">Set up your organization</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll be the owner and can invite your team next.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Organization name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state.fieldErrors?.name?.map((error) => (
              <p key={error} className="mt-1 text-xs text-destructive">
                {error}
              </p>
            ))}
          </div>

          {state.status === 'error' && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
