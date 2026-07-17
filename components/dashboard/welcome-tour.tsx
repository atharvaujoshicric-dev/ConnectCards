// components/dashboard/welcome-tour.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Palette, Users, X } from 'lucide-react';
import Link from 'next/link';

interface Step {
  icon: typeof BarChart3;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}

const STEPS: Step[] = [
  {
    icon: Palette,
    title: 'Make it yours',
    body: 'Pick a theme, add your photo, and fill in your bio. This is exactly what people see the moment they tap your card.',
    href: '/dashboard/profile',
    linkLabel: 'Go to Profile builder',
  },
  {
    icon: BarChart3,
    title: 'Watch it work',
    body: 'Every tap and scan shows up here in real time \u2014 views, taps, and (on Pro) exactly where they came from.',
    href: '/dashboard/analytics',
    linkLabel: 'View Analytics',
  },
  {
    icon: Users,
    title: 'Bring your team in',
    body: 'Running a company? Create an organization to issue branded cards to everyone and manage them from one place.',
    href: '/dashboard/org',
    linkLabel: 'Set up Organization',
  },
];

const DISMISS_STORAGE_KEY = 'connect-cards:welcome-tour-dismissed';

/**
 * A short, animated welcome sequence shown once right after a user
 * finishes onboarding or activates their first card. Dismissal is
 * remembered locally so it never nags on later visits.
 */
export function WelcomeTour() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const justOnboarded =
      searchParams.get('onboarded') === 'true' || searchParams.get('activated') === 'true';

    if (!justOnboarded) return;

    const alreadyDismissed = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (alreadyDismissed) return;

    setIsOpen(true);
    // Clean the query param out of the URL without a full navigation.
    router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setIsOpen(false);
    window.localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
  }

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <AnimatePresence>
      {isOpen && step && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close welcome tour"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <step.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                <Link
                  href={step.href}
                  onClick={handleClose}
                  className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  {step.linkLabel} &rarr;
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((s, i) => (
                  <span
                    key={s.title}
                    className={`h-1.5 rounded-full transition-all ${
                      i === stepIndex ? 'w-6 bg-accent' : 'w-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => (isLastStep ? handleClose() : setStepIndex((i) => i + 1))}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {isLastStep ? 'Get started' : 'Next'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
