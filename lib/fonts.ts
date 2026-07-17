// lib/fonts.ts
// Type system: Space Grotesk carries the display voice — its geometric,
// slightly technical character nods to the NFC hardware at the center of
// the product without tipping into novelty. Inter handles body copy and
// UI at every size (the Stripe/Linear-standard choice for a reason: it
// disappears at small sizes). IBM Plex Mono is reserved for anything that
// is literally data — card serials, activation tokens, API keys — so
// monospace reads as "this is a real system value," not decoration.

import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-cal-sans',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});
