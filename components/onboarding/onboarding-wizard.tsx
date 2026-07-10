// components/onboarding/onboarding-wizard.tsx
'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Check } from 'lucide-react';
import { completeOnboarding, checkSlugAvailability, ONBOARDING_INITIAL_STATE } from '@/onboarding/actions';
import { cn, slugify } from '@/lib/utils';
import type { Theme } from '@/types/database.types';

const STEPS = ['Basics', 'Your link', 'Theme'] as const;

interface OnboardingWizardProps {
  cardId?: string;
  themes: Theme[];
  defaultEmail: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}

export function OnboardingWizard({ cardId, themes, defaultEmail }: OnboardingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fullName, setFullName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [selectedThemeId, setSelectedThemeId] = useState(themes[0]?.id ?? '');
  const [, startSlugCheck] = useTransition();

  const boundAction = completeOnboarding.bind(null, cardId);
  const [state, formAction] = useActionState(boundAction, ONBOARDING_INITIAL_STATE);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(fullName));
    }
  }, [fullName, slugTouched]);

  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    const timeout = setTimeout(() => {
      startSlugCheck(async () => {
        const result = await checkSlugAvailability(slug);
        setSlugStatus(result.available ? 'available' : 'taken');
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [slug]);

  return (
    <div>
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                index < stepIndex && 'bg-accent text-accent-foreground',
                index === stepIndex && 'bg-primary text-primary-foreground',
                index > stepIndex && 'bg-secondary text-muted-foreground',
              )}
            >
              {index < stepIndex ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            {index < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="themeId" value={selectedThemeId} />

        <div className={cn(stepIndex === 0 ? 'block' : 'hidden', 'space-y-4')}>
          <Field label="Full name" error={state.fieldErrors?.fullName?.[0]}>
            <input
              name="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Job title">
            <input name="jobTitle" className={inputClass} />
          </Field>
          <Field label="Company">
            <input name="companyName" className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" placeholder="+91XXXXXXXXXX" className={inputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={defaultEmail} className={inputClass} />
          </Field>
          <Field label="Short bio">
            <textarea name="bio" rows={3} className={inputClass} />
          </Field>

          <NextButton onClick={() => setStepIndex(1)} disabled={!fullName} />
        </div>

        <div className={cn(stepIndex === 1 ? 'block' : 'hidden', 'space-y-4')}>
          <Field label="Your Connect Cards link" error={state.fieldErrors?.slug?.[0]}>
            <div className="flex items-center overflow-hidden rounded-md border border-input">
              <span className="bg-secondary px-3 py-2 text-sm text-muted-foreground">
                connectcards.app/
              </span>
              <input
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full border-0 bg-background px-2 py-2 text-sm focus:outline-none"
              />
            </div>
            {slugStatus === 'checking' && (
              <p className="mt-1 text-xs text-muted-foreground">Checking availability…</p>
            )}
            {slugStatus === 'available' && (
              <p className="mt-1 text-xs text-success">This link is available.</p>
            )}
            {slugStatus === 'taken' && (
              <p className="mt-1 text-xs text-destructive">This link is already taken.</p>
            )}
          </Field>

          <div className="flex justify-between">
            <BackButton onClick={() => setStepIndex(0)} />
            <NextButton onClick={() => setStepIndex(2)} disabled={slugStatus !== 'available'} />
          </div>
        </div>

        <div className={cn(stepIndex === 2 ? 'block' : 'hidden', 'space-y-4')}>
          <p className="text-sm font-medium">Choose a starting theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedThemeId(theme.id)}
                className={cn(
                  'aspect-[3/4] rounded-lg border-2 p-2 text-left text-xs transition-colors',
                  selectedThemeId === theme.id ? 'border-accent' : 'border-transparent',
                )}
                style={{ background: theme.tokens.bg, color: theme.tokens.fg }}
              >
                <span
                  className="mb-2 block h-6 w-6 rounded-full"
                  style={{ background: theme.tokens.accent }}
                />
                {theme.name}
              </button>
            ))}
          </div>

          {state.status === 'error' && state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <div className="flex justify-between">
            <BackButton onClick={() => setStepIndex(1)} />
            <SubmitButton label="Publish my profile" />
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ml-auto block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
    >
      Continue
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      Back
    </button>
  );
}

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';
