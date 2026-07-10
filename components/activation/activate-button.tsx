// components/activation/activate-button.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { activateCardAction, ACTIVATE_INITIAL_STATE } from '@/a/[token]/actions';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Activating…' : 'Activate my card'}
    </Button>
  );
}

export function ActivateButton({ activationToken }: { activationToken: string }) {
  const boundAction = activateCardAction.bind(null, activationToken);
  const [state, formAction] = useActionState(boundAction, ACTIVATE_INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <SubmitButton />
      {state.status === 'error' && state.message && (
        <p role="alert" className="text-center text-sm text-destructive">
          {state.message}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Activating permanently binds this card to your account. This cannot be undone.
      </p>
    </form>
  );
}
