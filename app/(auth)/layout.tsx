// app/(auth)/layout.tsx
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/20 px-4 py-16">
      <Link href="/" className="mb-10 font-display text-lg font-semibold tracking-tight">
        Connect<span className="text-accent">Cards</span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
