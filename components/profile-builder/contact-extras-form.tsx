// components/profile-builder/contact-extras-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import {
  updateContactExtras,
  type ProfileFormState,
} from '@/(dashboard)/dashboard/profile/actions';
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

export function ContactExtrasForm({ profile, isProOrAbove }: { profile: Profile; isProOrAbove: boolean }) {
  const [state, formAction] = useActionState(updateContactExtras, INITIAL_STATE);

  if (!isProOrAbove) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-5">
        <Lock className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Website, WhatsApp, and map location are Pro features</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upgrade to unlock these fields plus galleries, lead forms, and advanced analytics.
          </p>
          <Link href="/dashboard/billing" className="mt-3 inline-block text-sm font-medium text-accent">
            Upgrade to Pro &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field name="websiteUrl" label="Website" defaultValue={profile.website_url ?? ''} type="url" />
      <Field
        name="whatsappNumber"
        label="WhatsApp number"
        defaultValue={profile.whatsapp_number ?? ''}
        type="tel"
      />
      <Field name="mapAddress" label="Map address" defaultValue={profile.map_address ?? ''} />

      {state.status === 'success' && <p className="text-sm text-success">{state.message}</p>}
      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SaveButton />
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = 'text',
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
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
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
