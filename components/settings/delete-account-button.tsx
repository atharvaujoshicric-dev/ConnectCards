// components/settings/delete-account-button.tsx
'use client';

import { useTransition } from 'react';
import { deleteAccountAction } from '@/(dashboard)/dashboard/settings/actions';

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      'This will unpublish your profile and sign you out. Contact support if you need full data erasure. Continue?',
    );
    if (!confirmed) return;
    startTransition(() => deleteAccountAction());
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
    >
      {isPending ? 'Deleting…' : 'Delete account'}
    </button>
  );
}
