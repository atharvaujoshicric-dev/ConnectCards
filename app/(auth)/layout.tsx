// app/(auth)/layout.tsx
import Link from 'next/link';
import { CardVisual } from '@/components/marketing/card-visual';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on small screens, premium dark showcase on desktop */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0F0F11] p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(201,162,75,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(201,162,75,0.15), transparent 50%)',
          }}
        />

        <Link href="/" className="relative font-display text-lg font-semibold tracking-tight">
          Connect<span className="text-accent">Cards</span>
        </Link>

        <div className="relative flex flex-1 items-center justify-center py-12">
          <CardVisual finish="black" />
        </div>

        <div className="relative">
          <p className="font-display text-2xl font-semibold leading-snug">
            One tap replaces
            <br />
            your whole stack of cards.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/60">
            Metal NFC cards, a digital profile, and lead capture — built for professionals
            and the teams they work for.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 block font-display text-lg font-semibold tracking-tight lg:hidden"
          >
            Connect<span className="text-accent">Cards</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
