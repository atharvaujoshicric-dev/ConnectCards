// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        The link might be broken, or the page may have been moved. Check the URL, or head back
        home.
      </p>
      <Button variant="accent" className="mt-6" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
