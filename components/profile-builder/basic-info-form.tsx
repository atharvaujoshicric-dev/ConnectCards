// components/profile-builder/basic-info-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateBasicInfo, type ProfileFormState } from '@/(dashboard)/dashboard/profile/actions';
import type { Profile } from '@/types/database.types';

const INITIAL_STATE: ProfileFormState = { status: 'idle' };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export function BasicInfoForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateBasicInfo, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="fullName"
          label="Full name"
          defaultValue={profile.full_name}
          error={state.fieldErrors?.fullName?.[0]}
          required
        />
        <TextField name="jobTitle" label="Job title" defaultValue={profile.job_title ?? ''} />
        <TextField name="companyName" label="Company" defaultValue={profile.company_name ?? ''} />
        <TextField name="phone" label="Phone" defaultValue={profile.phone ?? ''} type="tel" />
        <TextField name="email" label="Email" defaultValue={profile.email ?? ''} type="email" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ''}
          maxLength={1000}
          className={fieldClass}
        />
      </div>

      {state.status === 'success' && (
        <p role="status" className="text-sm text-success">
          {state.message}
        </p>
      )}
      {state.status === 'error' && state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <SaveButton />
    </form>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  error,
  type = 'text',
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className={fieldClass}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const fieldClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';
