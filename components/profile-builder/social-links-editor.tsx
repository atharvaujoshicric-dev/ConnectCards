// components/profile-builder/social-links-editor.tsx
'use client';

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { X } from 'lucide-react';
import {
  addSocialLink,
  removeSocialLink,
  type ProfileFormState,
} from '@/(dashboard)/dashboard/profile/actions';
import type { SocialLink } from '@/types/database.types';

const INITIAL_STATE: ProfileFormState = { status: 'idle' };

const PLATFORMS = [
  'linkedin', 'instagram', 'twitter', 'facebook', 'youtube',
  'tiktok', 'github', 'behance', 'dribbble', 'custom',
] as const;

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? 'Adding…' : 'Add link'}
    </button>
  );
}

export function SocialLinksEditor({ links }: { links: SocialLink[] }) {
  const [state, formAction] = useActionState(addSocialLink, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium capitalize">{link.platform}</span>
              <span className="ml-2 text-muted-foreground">{link.url}</span>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => removeSocialLink(link.id))}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${link.platform} link`}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground">No links added yet.</p>
        )}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium" htmlFor="platform">
            Platform
          </label>
          <select id="platform" name="platform" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium" htmlFor="url">
            URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <AddButton />
      </form>

      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </div>
  );
}
