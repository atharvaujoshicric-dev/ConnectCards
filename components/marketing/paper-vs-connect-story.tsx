// components/marketing/paper-vs-connect-story.tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Trash2, Leaf, RefreshCw } from 'lucide-react';
import { TapDemoAnimation } from '@/components/marketing/tap-demo-animation';

/**
 * As the user scrolls through this section, the paper-card side fades
 * and wilts away while the Connect Card side strengthens — the page
 * physically enacts "the old way fading out" rather than just saying it.
 */
export function PaperVsConnectStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.3'],
  });

  const paperOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0.15]);
  const paperRotate = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const paperScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const binOpacity = useTransform(scrollYProgress, [0.4, 1], [0, 1]);

  const connectOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.85, 1]);
  const connectScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <div ref={sectionRef}>
      <div className="grid gap-16 md:grid-cols-2 md:gap-8">
        {/* The old way */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-72 w-full max-w-xs items-center justify-center">
            <motion.div
              style={{ opacity: paperOpacity, rotate: paperRotate, scale: paperScale }}
              className="flex h-28 w-44 flex-col justify-center gap-1.5 rounded-md border border-border bg-card px-4 shadow-sm"
            >
              <span className="h-2 w-20 rounded-full bg-foreground/15" />
              <span className="h-1.5 w-28 rounded-full bg-foreground/10" />
              <span className="h-1.5 w-24 rounded-full bg-foreground/10" />
              <span className="mt-1 h-1.5 w-16 rounded-full bg-foreground/10" />
            </motion.div>
            <motion.div
              style={{ opacity: binOpacity }}
              className="absolute bottom-2 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-5 w-5" />
            </motion.div>
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">The paper card</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Handed over, glanced at once, and forgotten in a pocket. When details change, it&apos;s
            a full reprint — and the old ones just become waste.
          </p>
        </div>

        {/* The new way */}
        <div className="flex flex-col items-center text-center">
          <motion.div style={{ opacity: connectOpacity, scale: connectScale }}>
            <TapDemoAnimation />
          </motion.div>
          <h3 className="mt-4 font-display text-lg font-semibold">The Connect Card</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Tap, and your whole profile opens instantly — saved straight to their contacts.
            Update your details anytime; the card itself never needs reprinting.
          </p>
        </div>
      </div>

      {/* Environmental note — qualitative, honest, no invented statistics */}
      <div className="mx-auto mt-20 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-secondary/30 px-8 py-8 text-center sm:flex-row sm:text-left">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <Leaf className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display font-semibold">One card, no reprints, ever.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every job change or new number would normally mean another box of paper cards in
            the bin. Yours just gets updated from your dashboard — nothing new to print, ship,
            or throw away.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5" />
        Update your profile anytime — the physical card stays exactly the same.
      </div>
    </div>
  );
}
