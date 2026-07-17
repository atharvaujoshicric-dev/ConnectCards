// components/marketing/contact-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from '@/(marketing)/contact/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const INITIAL_STATE: ContactFormState = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Sending\u2026' : 'Send message'}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, INITIAL_STATE);

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-accent/30 bg-accent/10 p-6 text-sm"
      >
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name" errors={state.fieldErrors?.name}>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={inputClassName(Boolean(state.fieldErrors?.name))}
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
        </Field>
        <Field name="email" label="Email" errors={state.fieldErrors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClassName(Boolean(state.fieldErrors?.email))}
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="company" label="Company (optional)" errors={state.fieldErrors?.company}>
          <input
            id="company"
            name="company"
            type="text"
            className={inputClassName(Boolean(state.fieldErrors?.company))}
          />
        </Field>
        <Field name="interest" label="I'm interested in" errors={state.fieldErrors?.interest}>
          <select
            id="interest"
            name="interest"
            defaultValue="individual"
            className={inputClassName(Boolean(state.fieldErrors?.interest))}
          >
            <option value="individual">An individual card</option>
            <option value="business_bulk">Bulk cards for my team</option>
            <option value="enterprise_api">Enterprise / API access</option>
            <option value="press">Press</option>
            <option value="other">Something else</option>
          </select>
        </Field>
      </div>

      <Field name="message" label="Message" errors={state.fieldErrors?.message}>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={inputClassName(Boolean(state.fieldErrors?.message))}
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
      </Field>

      {!state.success && state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  name,
  label,
  errors,
  children,
}: {
  name: string;
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {errors?.map((error) => (
        <p key={error} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ))}
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
