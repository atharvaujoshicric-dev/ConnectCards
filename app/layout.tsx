// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { spaceGrotesk, inter, plexMono } from '@/lib/fonts';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://connectcards.app'),
  title: {
    default: 'Connect Cards — One Tap. Your Whole Identity.',
    template: '%s · Connect Cards',
  },
  description:
    'Premium NFC business cards with a digital identity platform built in: link-in-bio, portfolio, lead capture, and team management for professionals and organizations.',
  keywords: [
    'NFC business card',
    'digital business card',
    'link in bio',
    'digital identity',
    'CRM lead capture',
  ],
  openGraph: {
    title: 'Connect Cards — One Tap. Your Whole Identity.',
    description:
      'Premium NFC business cards with a digital identity platform built in.',
    url: '/',
    siteName: 'Connect Cards',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connect Cards — One Tap. Your Whole Identity.',
    description:
      'Premium NFC business cards with a digital identity platform built in.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F6' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F11' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
