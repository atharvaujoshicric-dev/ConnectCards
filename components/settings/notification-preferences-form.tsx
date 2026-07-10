// components/settings/notification-preferences-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  updateNotificationPreferencesAction,
  SETTINGS_ACTION_INITIAL_STATE,
} from '@/(dashboard)/dashboard/settings/actions';
import type { NotificationPreferences } from '@/types/database.types';

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save preferences'}
    </button>
  );
}

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreferences | null }) {
  const [state, formAction] = useActionState(
    updateNotificationPreferencesAction,
    SETTINGS_ACTION_INITIAL_STATE,
  );

  return (
    <form action={formAction} className="space-y-3">
      <CheckboxRow
        name="email_new_lead"
        label="New lead notifications"
        defaultChecked={preferences?.email_new_lead ?? true}
      />
      <CheckboxRow
        name="email_order_updates"
        label="Order & shipping updates"
        defaultChecked={preferences?.email_order_updates ?? true}
      />
      <CheckboxRow
        name="email_billing"
        label="Billing & subscription emails"
        defaultChecked={preferences?.email_billing ?? true}
      />
      <CheckboxRow
        name="email_product_updates"
        label="Product news & tips"
        defaultChecked={preferences?.email_product_updates ?? false}
      />

      {state.status === 'success' && <p className="text-sm text-success">{state.message}</p>}
      {state.status === 'error' && <p className="text-sm text-destructive">{state.message}</p>}

      <SaveButton />
    </form>
  );
}

function CheckboxRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-input"
      />
      {label}
    </label>
  );
}
