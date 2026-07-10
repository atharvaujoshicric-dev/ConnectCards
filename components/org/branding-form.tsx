// components/org/branding-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateBrandingAction, ORG_ACTION_INITIAL_STATE } from '@/(dashboard)/dashboard/org/actions';
import type { Organization } from '@/types/database.types';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save branding'}
    </button>
  );
}

export function BrandingForm({ organization }: { organization: Organization }) {
  const boundAction = updateBrandingAction.bind(null, organization.id);
  const [state, formAction] = useActionState(boundAction, ORG_ACTION_INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Organization name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={organization.name}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="brandPrimaryColor" className="mb-1.5 block text-sm font-medium">
            Primary color
          </label>
          <input
            id="brandPrimaryColor"
            name="brandPrimaryColor"
            type="color"
            defaultValue={organization.brand_primary_color ?? '#C9A24B'}
            className="h-10 w-full rounded-md border border-input"
          />
        </div>
        <div>
          <label htmlFor="brandSecondaryColor" className="mb-1.5 block text-sm font-medium">
            Secondary color
          </label>
          <input
            id="brandSecondaryColor"
            name="brandSecondaryColor"
            type="color"
            defaultValue={organization.brand_secondary_color ?? '#111111'}
            className="h-10 w-full rounded-md border border-input"
          />
        </div>
      </div>

      {state.status === 'success' && <p className="text-sm text-success">{state.message}</p>}
      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <SaveButton />
    </form>
  );
}
