// components/marketing/tap-demo-animation.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * A small looping demo: a card taps a phone, a ripple fires, and a
 * profile "card" slides up confirming the save — shows the one-tap
 * claim happening rather than just describing it in copy. Pure CSS/SVG
 * shapes, no external art assets.
 */
export function TapDemoAnimation() {
  return (
    <div className="relative mx-auto flex h-72 w-full max-w-xs items-center justify-center">
      {/* Phone silhouette */}
      <div className="relative h-64 w-32 rounded-[1.75rem] border-4 border-foreground/10 bg-secondary/40">
        <div className="absolute left-1/2 top-2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-foreground/10" />

        {/* Ripple, fires on loop */}
        <motion.span
          className="absolute left-1/2 top-10 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-accent"
          animate={{ scale: [0.5, 2.6], opacity: [0.7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeOut' }}
        />

        {/* Profile card sliding up to confirm the "save" */}
        <motion.div
          className="absolute inset-x-2 bottom-3 rounded-lg border border-border bg-card px-2 py-2 shadow-md"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: [24, 0, 0, 24], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.25, 0.75, 1],
            ease: 'easeInOut',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/20 text-success">
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className="text-[10px] font-medium">Saved to contacts</span>
          </div>
        </motion.div>
      </div>

      {/* Card, taps down onto the phone on loop */}
      <motion.div
        className="absolute left-1/2 top-4 h-14 w-20 -translate-x-1/2 rounded-lg shadow-lg"
        style={{
          background: 'linear-gradient(155deg, #3A3A40 0%, #1A1A1D 60%, #000000 100%)',
        }}
        animate={{ y: [-64, 30, 30, -64], rotate: [-6, 0, 0, -6] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          times: [0, 0.3, 0.6, 1],
          ease: 'easeInOut',
        }}
      >
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
      </motion.div>
    </div>
  );
}
