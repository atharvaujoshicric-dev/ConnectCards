// components/marketing/card-visual.tsx
// The signature element: a rendered metal card with a moving light sheen
// and a "tap ripple" that expands from the point of contact — the single
// physical gesture (tap the card) that the entire product is built
// around. Everything else on the landing page stays quiet around this.

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const CARD_FINISHES = {
  gold: { base: '#8A6A2E', mid: '#C9A24B', hi: '#F0DBA6', text: '#2A2114' },
  silver: { base: '#8B8F96', mid: '#B8BCC2', hi: '#F1F2F4', text: '#1E2023' },
  rose_gold: { base: '#8A5C50', mid: '#C98A7A', hi: '#EFC3B7', text: '#2A1714' },
  black: { base: '#000000', mid: '#1A1A1D', hi: '#3A3A40', text: '#F5F5F4' },
} as const;

interface CardVisualProps {
  finish?: keyof typeof CARD_FINISHES;
  name?: string;
  title?: string;
  className?: string;
}

export function CardVisual({
  finish = 'black',
  name = 'Jane Doe',
  title = 'Principal Architect',
  className,
}: CardVisualProps) {
  const [rippleKey, setRippleKey] = useState(0);
  const colors = CARD_FINISHES[finish];

  return (
    <button
      type="button"
      aria-label="Simulate tapping the Connect Card to activate the profile"
      onClick={() => setRippleKey((k) => k + 1)}
      className={cn(
        'group relative isolate aspect-[1.586/1] w-full max-w-md select-none rounded-2xl',
        'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] transition-transform duration-500',
        'hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4',
        className,
      )}
      style={{
        background: `linear-gradient(155deg, ${colors.hi} 0%, ${colors.mid} 35%, ${colors.base} 100%)`,
      }}
    >
      {/* Moving sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 mix-blend-overlay"
        style={{
          background:
            'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 48%, transparent 65%)',
          backgroundSize: '250% 250%',
          animation: 'card-sheen-sweep 5s ease-in-out infinite',
        }}
      />

      {/* Tap ripple, replayed on each click */}
      <span
        key={rippleKey}
        className="pointer-events-none absolute right-10 top-8 h-3 w-3 rounded-full"
        style={{ backgroundColor: colors.hi }}
        aria-hidden
      >
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-60"
          style={{ backgroundColor: colors.hi, animationDuration: '900ms', animationIterationCount: 1 }}
        />
      </span>

      {/* Card face content */}
      <div className="relative flex h-full flex-col justify-between p-7 text-left">
        <div className="flex items-start justify-between">
          <span
            className="font-display text-sm font-semibold tracking-tight"
            style={{ color: colors.text }}
          >
            Connect Cards
          </span>
          <NfcMark color={colors.text} />
        </div>

        <div>
          <p className="font-display text-xl font-semibold" style={{ color: colors.text }}>
            {name}
          </p>
          <p className="text-sm opacity-80" style={{ color: colors.text }}>
            {title}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes card-sheen-sweep {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </button>
  );
}

function NfcMark({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M8 20C5 17 5 11 8 8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M11.5 17C9.5 15 9.5 13 11.5 11"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="16" cy="14" r="2" fill={color} />
    </svg>
  );
}
