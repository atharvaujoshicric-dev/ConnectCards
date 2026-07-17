'use client';

// app/error.tsx
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">Something went wrong</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        We hit an unexpected error
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        This has been logged automatically. You can try again, and if it keeps happening, let us
        know via the contact page.
      </p>
      <Button variant="accent" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
