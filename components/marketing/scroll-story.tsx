// components/marketing/scroll-story.tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { CardVisual } from '@/components/marketing/card-visual';

interface Beat {
  title: string;
  body: string;
  range: [number, number];
}

const BEATS: Beat[] = [
  {
    title: 'Order your card',
    body: 'Pick a finish, place the order. It ships inert — not linked to anyone until you claim it.',
    range: [0, 0.25],
  },
  {
    title: 'Tap once to activate',
    body: 'Log in, tap the card against your phone, and it binds permanently to your account.',
    range: [0.25, 0.5],
  },
  {
    title: 'Share it anywhere',
    body: 'Tap it against anyone\u2019s phone or hand over the QR. Your profile opens instantly, no app needed.',
    range: [0.5, 0.75],
  },
  {
    title: 'Update anytime, never reprint',
    body: 'Change your title, add a new link, switch themes \u2014 the card in your pocket never has to change.',
    range: [0.75, 1],
  },
];

/**
 * A pinned scrollytelling sequence: the card stays fixed in view while
 * the story beats around it change as the user scrolls, echoing the
 * product's actual order -> activate -> share -> update lifecycle.
 */
export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const cardRotate = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, -6, 0, 6, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.02]);

  return (
    <div ref={containerRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden border-t border-border/60 bg-secondary/10">
        <div className="container grid gap-16 md:grid-cols-2 md:items-center">
          <div className="relative h-56 sm:h-48">
            {BEATS.map((beat) => (
              <StoryBeat key={beat.title} scrollYProgress={scrollYProgress} beat={beat} />
            ))}
          </div>

          <div className="flex justify-center md:justify-end">
            <motion.div style={{ rotate: cardRotate, scale: cardScale }} className="w-full max-w-sm">
              <CardVisual finish="black" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryBeat({
  scrollYProgress,
  beat,
}: {
  scrollYProgress: MotionValue<number>;
  beat: Beat;
}) {
  const [start, end] = beat.range;
  const span = end - start;
  const fadeEdge = span * 0.15;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + fadeEdge, end - fadeEdge, end],
    [0, 1, 1, 0],
  );
  const y = useTransform(scrollYProgress, [start, end], [16, -16]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {String(BEATS.indexOf(beat) + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">{beat.title}</h3>
      <p className="mt-3 max-w-sm text-muted-foreground">{beat.body}</p>
    </motion.div>
  );
}
