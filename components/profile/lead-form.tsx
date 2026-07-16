// components/profile/lead-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { submitLeadAction, type LeadFormState } from '@/[slug]/actions';

const INITIAL_STATE: LeadFormState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-[color:var(--profile-accent)] px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send message'}
    </button>
  );
}

export function LeadForm({ profileId }: { profileId: string }) {
  const searchParams = useSearchParams();
  const source = searchParams.get('src') ?? 'direct';

  const boundAction = submitLeadAction.bind(null, profileId);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  if (state.success) {
    return (
      <div className="mt-10 rounded-lg border border-[color:var(--profile-fg)]/15 p-5 text-center text-sm">
        {state.message}
      </div>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] opacity-60">
        Get in touch
      </h2>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="source" value={source} />

        <input
          name="fullName"
          type="text"
          placeholder="Your name"
          required
          className={fieldClass}
        />
        {state.fieldErrors?.fullName?.map((e) => (
          <p key={e} className="text-xs text-red-500">
            {e}
          </p>
        ))}

        <input name="email" type="email" placeholder="Email (optional)" className={fieldClass} />
        <input name="phone" type="tel" placeholder="Phone (optional)" className={fieldClass} />
        <input
          name="company"
          type="text"
          placeholder="Company (optional)"
          className={fieldClass}
        />
        <textarea
          name="message"
          placeholder="What would you like to discuss?"
          rows={3}
          className={fieldClass}
        />

        {!state.success && state.message && (
          <p className="text-center text-xs text-red-500">{state.message}</p>
        )}

        <SubmitButton />
      </form>
    </section>
  );
}

const fieldClass =
  'w-full rounded-lg border border-[color:var(--profile-fg)]/15 bg-[color:var(--profile-fg)]/5 px-4 py-3 text-sm placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--profile-accent)]';
