// app/robots.ts
import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://connectcards.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api', '/onboarding', '/login', '/signup'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
