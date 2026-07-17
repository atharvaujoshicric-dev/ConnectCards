// components/marketing/site-footer.tsx
import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/order', label: 'Order a card' },
      { href: '/themes', label: 'Theme gallery' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/terms', label: 'Terms of service' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="container grid grid-cols-2 gap-10 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <span className="font-display text-lg font-semibold tracking-tight">
            Connect<span className="text-accent">Cards</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            One metal card. A permanent digital identity. Built for professionals and the
            organizations they work for.
          </p>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold">{section.title}</p>
            <ul className="mt-4 space-y-3">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container flex flex-col items-center justify-between gap-4 border-t border-border/60 py-6 text-xs text-muted-foreground md:flex-row">
        <p>&copy; {new Date().getFullYear()} Connect Cards. All rights reserved.</p>
        <p className="font-mono">Made for the people who hand you their card and never follow up.</p>
      </div>
    </footer>
  );
}
