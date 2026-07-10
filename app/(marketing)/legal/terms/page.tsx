// app/(marketing)/legal/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-2xl prose prose-neutral">
        <h1 className="font-display">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: January 2026</p>

        <h2>The service</h2>
        <p>
          Connect Cards provides physical NFC cards and a digital identity platform, sold on a
          hardware-plus-subscription model as described on our pricing page. An account is
          required before ordering, and each physical card is permanently bound to one account
          upon activation.
        </p>

        <h2>Card activation</h2>
        <p>
          Activation is one-time and irreversible. Once a card is claimed by an account, ownership
          cannot be transferred by re-activation; a card can be frozen (by its owner or by an
          organization administrator, for org-issued cards) but not re-bound to a different
          account.
        </p>

        <h2>Subscriptions</h2>
        <p>
          Subscription plans (Pro, Business, Enterprise) renew automatically until cancelled.
          Cancelling stops future renewal but does not refund the current billing period; paid
          features remain available through the end of the period already paid for.
        </p>

        <h2>Acceptable use</h2>
        <p>
          You agree not to use your profile to publish unlawful, deceptive, or harmful content, and
          not to use the lead capture or analytics features to harvest data from visitors without
          appropriate disclosure.
        </p>

        <h2>Organization accounts</h2>
        <p>
          Organizations issuing cards to employees are responsible for the accuracy of employee
          invitations and for offboarding employees promptly when they leave; Connect Cards
          provides the tools but the organization controls the data and roster.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          The service is provided as-is. To the maximum extent permitted by law, Connect Cards is
          not liable for indirect or consequential damages arising from use of the platform or
          hardware.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent through our <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
