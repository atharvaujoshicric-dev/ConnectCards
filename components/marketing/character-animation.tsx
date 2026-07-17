// components/marketing/character-animation.tsx
'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { cn } from '@/lib/utils';

interface CharacterAnimationProps {
  /**
   * Filename only, relative to /public/animations/. e.g. "tap-moment.lottie".
   * Drop your downloaded/generated .lottie file into that folder and
   * reference it here — no other code changes needed.
   */
  src: string;
  className?: string;
  loop?: boolean;
  ariaLabel: string;
}

/**
 * Plays a Lottie character animation from /public/animations/. See
 * README's "Animated characters" section for where to source these
 * (LottieFiles marketplace, LottieFiles AI, or a commissioned artist).
 */
export function CharacterAnimation({
  src,
  className,
  loop = true,
  ariaLabel,
}: CharacterAnimationProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('mx-auto w-full max-w-xs', className)}
    >
      <DotLottieReact src={`/animations/${src}`} loop={loop} autoplay />
    </div>
  );
}
